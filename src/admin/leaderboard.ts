import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export type LeaderboardEntry = {
  deviceId: string;
  name: string;
  boothPoints: number;
  sessionPoints: number;
  totalPoints: number;
};

/**
 * Points are just a scan/check-in count: 1 per exhibitor booth visited, 1
 * per session checked into. Aggregated client-side from the existing
 * `checkins` and `exhibitorVisits` collections rather than a separate
 * ledger, since both already record the attendee's name and device ID.
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const [checkinsSnap, visitsSnap] = await Promise.all([
    getDocs(collection(db, "checkins")),
    getDocs(collection(db, "exhibitorVisits")),
  ]);

  const byDevice = new Map<string, LeaderboardEntry>();

  const ensure = (deviceId: string, firstName?: string, lastName?: string) => {
    let entry = byDevice.get(deviceId);
    if (!entry) {
      entry = { deviceId, name: "", boothPoints: 0, sessionPoints: 0, totalPoints: 0 };
      byDevice.set(deviceId, entry);
    }
    const name = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (name) entry.name = name;
    return entry;
  };

  checkinsSnap.forEach((doc) => {
    const data = doc.data() as { deviceId?: string; firstName?: string; lastName?: string };
    if (!data.deviceId) return;
    const entry = ensure(data.deviceId, data.firstName, data.lastName);
    entry.sessionPoints += 1;
    entry.totalPoints += 1;
  });

  visitsSnap.forEach((doc) => {
    const data = doc.data() as { deviceId?: string; firstName?: string; lastName?: string };
    if (!data.deviceId) return;
    const entry = ensure(data.deviceId, data.firstName, data.lastName);
    entry.boothPoints += 1;
    entry.totalPoints += 1;
  });

  return Array.from(byDevice.values())
    .filter((entry) => entry.name) // skip records from before name capture existed
    .sort((a, b) => b.totalPoints - a.totalPoints);
}
