import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, firebaseConfigured } from "../firebase";

// Used until the organizer saves a tier list from the admin Sponsors screen,
// and as a fallback if config/sponsorTiers is missing or unreadable.
export const DEFAULT_SPONSOR_TIERS = [
  "Platinum",
  "Gold",
  "Silver",
  "Bronze",
  "Lanyard",
  "Delegate Bag Sponsor",
];

// The sponsor tier list, top to bottom, from the config/sponsorTiers doc.
// Lives in Firestore (not in code) so tiers can be added or reordered from
// the admin dashboard without shipping an app update.
export function useSponsorTiers() {
  const [tiers, setTiers] = useState<string[]>(DEFAULT_SPONSOR_TIERS);

  useEffect(() => {
    if (!firebaseConfigured) return;
    return onSnapshot(
      doc(db, "config", "sponsorTiers"),
      (snap) => {
        const list = snap.data()?.tiers;
        setTiers(Array.isArray(list) && list.length > 0 ? list : DEFAULT_SPONSOR_TIERS);
      },
      () => setTiers(DEFAULT_SPONSOR_TIERS)
    );
  }, []);

  return tiers;
}
