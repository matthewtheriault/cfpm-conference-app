import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, firebaseConfigured } from "../firebase";
import { getDeviceId } from "../deviceId";
import { useUserProfile } from "./UserProfileContext";

const STORAGE_KEY = "cfpm.exhibitorPassport";

type ExhibitorPassportContextValue = {
  isLoading: boolean;
  isVisited: (exhibitorId: string) => boolean;
  visitedCount: number;
  recordVisit: (exhibitorId: string) => Promise<"new" | "already">;
  clearVisits: () => Promise<void>;
};

const ExhibitorPassportContext = createContext<ExhibitorPassportContextValue | undefined>(undefined);

export function ExhibitorPassportProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { firstName, lastName } = useUserProfile();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setIds(new Set(JSON.parse(raw)));
        } catch {
          setIds(new Set());
        }
      }
      setIsLoading(false);
    });
  }, []);

  const mirrorToFirestore = async (exhibitorId: string) => {
    if (!firebaseConfigured) return;
    try {
      const deviceId = await getDeviceId();
      await setDoc(doc(db, "exhibitorVisits", `${exhibitorId}_${deviceId}`), {
        exhibitorId,
        deviceId,
        firstName,
        lastName,
        visitedAt: serverTimestamp(),
      });
    } catch {
      // Best-effort mirror for the organizer's visibility - on-device state
      // (below) is the source of truth for the attendee's own passport.
    }
  };

  const recordVisit = async (exhibitorId: string): Promise<"new" | "already"> => {
    if (ids.has(exhibitorId)) return "already";
    setIds((prev) => {
      const next = new Set(prev);
      next.add(exhibitorId);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
    await mirrorToFirestore(exhibitorId);
    return "new";
  };

  const clearVisits = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setIds(new Set());
  };

  const value = useMemo(
    () => ({
      isLoading,
      isVisited: (id: string) => ids.has(id),
      visitedCount: ids.size,
      recordVisit,
      clearVisits,
    }),
    [ids, isLoading]
  );

  return <ExhibitorPassportContext.Provider value={value}>{children}</ExhibitorPassportContext.Provider>;
}

export function useExhibitorPassport() {
  const ctx = useContext(ExhibitorPassportContext);
  if (!ctx) throw new Error("useExhibitorPassport must be used within ExhibitorPassportProvider");
  return ctx;
}
