import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, firebaseConfigured } from "../firebase";
import { getDeviceId } from "../deviceId";

const STORAGE_KEY = "cfpm.checkins";

type CheckinsContextValue = {
  isLoading: boolean;
  isCheckedIn: (scheduleItemId: string) => boolean;
  toggleCheckin: (scheduleItemId: string) => void;
};

const CheckinsContext = createContext<CheckinsContextValue | undefined>(undefined);

export function CheckinsProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

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

  const mirrorToFirestore = async (scheduleItemId: string, checkedIn: boolean) => {
    if (!firebaseConfigured) return;
    try {
      const deviceId = await getDeviceId();
      const checkinRef = doc(db, "checkins", `${scheduleItemId}_${deviceId}`);
      if (checkedIn) {
        await setDoc(checkinRef, {
          scheduleItemId,
          deviceId,
          checkedInAt: serverTimestamp(),
          method: "self",
        });
      } else {
        await deleteDoc(checkinRef);
      }
    } catch {
      // Best-effort mirror for the organizer's future visibility — on-device
      // state (below) is the source of truth for the attendee, so a failed
      // write here shouldn't block or roll back the toggle.
    }
  };

  const toggleCheckin = (scheduleItemId: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      const checkedIn = !next.has(scheduleItemId);
      if (checkedIn) {
        next.add(scheduleItemId);
      } else {
        next.delete(scheduleItemId);
      }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      mirrorToFirestore(scheduleItemId, checkedIn);
      return next;
    });
  };

  const value = useMemo(
    () => ({
      isLoading,
      isCheckedIn: (id: string) => ids.has(id),
      toggleCheckin,
    }),
    [ids, isLoading]
  );

  return <CheckinsContext.Provider value={value}>{children}</CheckinsContext.Provider>;
}

export function useCheckins() {
  const ctx = useContext(CheckinsContext);
  if (!ctx) throw new Error("useCheckins must be used within CheckinsProvider");
  return ctx;
}
