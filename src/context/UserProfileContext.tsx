import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
