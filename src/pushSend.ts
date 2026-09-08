import { getFunctions, httpsCallable } from "firebase/functions";
import type { Timestamp } from "firebase/firestore";
import app from "./firebase";

/**
 * Sends a push notification to every registered device via a server-side
 * Cloud Function (see functions/index.js). This runs the same on web and
 * native - calling Expo's push API directly from a browser fails because it
 * doesn't return CORS headers, so the actual send has to happen server-side.
 */
export async function sendPushToAllDevices(title: string, body: string): Promise<number> {
  const sendPushNotification = httpsCallable<{ title: string; body: string }, { recipientCount: number }>(
    getFunctions(app),
    "sendPushNotification"
  );
  const result = await sendPushNotification({ title, body });
  return result.data.recipientCount;
}

export type SentNotification = {
  id: string;
  title: string;
  body: string;
  recipientCount: number;
  sentBy: string;
  sentAt: Timestamp | null;
};
