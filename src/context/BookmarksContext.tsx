import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "cfpm.bookmarks";

type BookmarksContextValue = {
  isLoading: boolean;
  isBookmarked: (scheduleItemId: string) => boolean;
  toggleBookmark: (scheduleItemId: string) => void;
};

const BookmarksContext = createContext<BookmarksContextValue | undefined>(undefined);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
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

  const toggleBookmark = (scheduleItemId: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(scheduleItemId)) {
        next.delete(scheduleItemId);
      } else {
        next.add(scheduleItemId);
      }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const value = useMemo(
    () => ({
      isLoading,
      isBookmarked: (id: string) => ids.has(id),
      toggleBookmark,
    }),
    [ids, isLoading]
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarksProvider");
  return ctx;
}
