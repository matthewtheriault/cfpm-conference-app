import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, firebaseConfigured } from "../firebase";
import { getDeviceId } from "../deviceId";

const STORAGE_KEY = "cfpm.userProfile";

type Profile = { firstName: string; lastName: string };

type UserProfileContextValue = {
  firstName: string;
  lastName: string;
  isProfileComplete: boolean;
  isLoading: boolean;
  saveProfile: (firstName: string, lastName: string) => Promise<void>;
  clearProfile: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setProfile(JSON.parse(raw));
        } catch {
          setProfile(null);
        }
      }
      setIsLoading(false);
    });
  }, []);

  const saveProfile = async (firstName: string, lastName: string) => {
    const next = { firstName: firstName.trim(), lastName: lastName.trim() };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProfile(next);
    if (firebaseConfigured) {
      try {
        const deviceId = await getDeviceId();
        await setDoc(doc(db, "profiles", deviceId), {
          deviceId,
          firstName: next.firstName,
          lastName: next.lastName,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Best-effort mirror for the organizer's "Attendees" view - on-device
        // storage above is the source of truth for the attendee's own app.
      }
    }
  };

  const clearProfile = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  };

  const value = useMemo(
    () => ({
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      isProfileComplete: Boolean(profile?.firstName && profile?.lastName),
      isLoading,
      saveProfile,
      clearProfile,
    }),
    [profile, isLoading]
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
}
