import { addDoc, collection, getDocs, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";
const CHUNK_SIZE = 90; // Expo recommends batches of ~100 messages per request.

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sends a push notification to every registered device right now, directly
 * from this (admin) device — no backend server required. Called only from
 * the admin dashboard, which is gated by a Firebase Auth admin claim and
 * Firestore rules that restrict reading `pushTokens` to admins.
 */
export async function sendPushToAllDevices(
  title: string,
  body: string,
  sentBy: string
): Promise<number> {
  const tokensSnapshot = await getDocs(collection(db, "pushTokens"));
  const tokens = tokensSnapshot.docs
    .map((doc) => doc.data().token as string)
    .filter((token) => typeof token === "string" && token.startsWith("ExponentPushToken"));

  const messages = tokens.map((to) => ({ to, title, body, sound: "default" as const }));

  for (const batch of chunk(messages, CHUNK_SIZE)) {
    await fetch(EXPO_PUSH_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(batch),
    });
  }

  await addDoc(collection(db, "notifications"), {
    title,
    body,
    recipientCount: tokens.length,
    sentBy,
    sentAt: serverTimestamp(),
  });

  return tokens.length;
}

export type SentNotification = {
  id: string;
  title: string;
  body: string;
  recipientCount: number;
  sentBy: string;
  sentAt: Timestamp | null;
};
