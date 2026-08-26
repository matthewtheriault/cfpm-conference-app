import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "cfpm.conferenceCodeVerified";
const CONFERENCE_CODE = "CFPM2026";

type AccessContextValue = {
  isUnlocked: boolean;
  isLoading: boolean;
  submitCode: (code: string) => Promise<boolean>;
  lock: () => Promise<void>;
};

const AccessContext = createContext<AccessContextValue | undefined>(undefined);

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      setIsUnlocked(value === "true");
      setIsLoading(false);
    });
  }, []);

  const submitCode = async (code: string) => {
    const isValid = code.trim().toUpperCase() === CONFERENCE_CODE;
    if (isValid) {
      await AsyncStorage.setItem(STORAGE_KEY, "true");
      setIsUnlocked(true);
    }
    return isValid;
  };

  const lock = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setIsUnlocked(false);
  };

  const value = useMemo(
    () => ({ isUnlocked, isLoading, submitCode, lock }),
    [isUnlocked, isLoading]
  );

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error("useAccess must be used within AccessProvider");
  return ctx;
}
