const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// Overridable only so local emulator tests can point at a mock instead of
// Expo's real push service; never set in production.
const EXPO_PUSH_ENDPOINT = process.env.EXPO_PUSH_ENDPOINT || "https://exp.host/--/api/v2/push/send";
const CHUNK_SIZE = 90; // Expo recommends batches of ~100 messages per request.

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sends a push notification to every registered device. Called from the
 * admin dashboard (web or native) via a callable function so the request
 * runs server-side - browsers block a direct client fetch to Expo's push
 * API since it doesn't return CORS headers.
 */
exports.sendPushNotification = onCall(async (request) => {
  if (!request.auth?.token?.admin) {
    throw new HttpsError("permission-denied", "Admin access required.");
  }

  const title = String(request.data?.title ?? "").trim();
  const body = String(request.data?.body ?? "").trim();
  if (!title || !body) {
    throw new HttpsError("invalid-argument", "Title and body are required.");
  }

  const tokensSnapshot = await db.collection("pushTokens").get();
  const tokens = tokensSnapshot.docs
    .map((doc) => doc.data().token)
    .filter((token) => typeof token === "string" && token.startsWith("ExponentPushToken"));

  const messages = tokens.map((to) => ({ to, title, body, sound: "default" }));

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

  await db.collection("notifications").add({
    title,
    body,
    recipientCount: tokens.length,
    sentBy: request.auth.token.email || request.auth.uid,
    sentAt: FieldValue.serverTimestamp(),
  });

  return { recipientCount: tokens.length };
});

async function getPushTokens() {
  const tokensSnapshot = await db.collection("pushTokens").get();
  return tokensSnapshot.docs
    .map((doc) => doc.data().token)
    .filter((token) => typeof token === "string" && token.startsWith("ExponentPushToken"));
}

/**
 * Sends any scheduled notifications that are due, then marks them sent.
 * Each one is claimed (pending -> sending) in a transaction first, so an
 * overlapping run - or a manual run of the GitHub Actions backup - can
 * never send the same notification twice.
 */
async function sendDueNotifications() {
  const due = await db
    .collection("scheduledNotifications")
    .where("status", "==", "pending")
    .where("sendAt", "<=", Timestamp.now())
    .get();
  if (due.empty) return [];

  const tokens = await getPushTokens();
  const sent = [];

  for (const doc of due.docs) {
    const claimed = await db.runTransaction(async (tx) => {
      const fresh = await tx.get(doc.ref);
      if (fresh.data()?.status !== "pending") return false;
      tx.update(doc.ref, { status: "sending" });
      return true;
    });
    if (!claimed) continue;

    const { title, body, createdBy } = doc.data();
    try {
      const messages = tokens.map((to) => ({ to, title, body, sound: "default" }));
      for (const batch of chunk(messages, CHUNK_SIZE)) {
        await fetch(EXPO_PUSH_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(batch),
        });
      }

      await db.collection("notifications").add({
        title,
        body,
        recipientCount: tokens.length,
        sentBy: createdBy ? `${createdBy} (scheduled)` : "scheduled",
        sentAt: FieldValue.serverTimestamp(),
      });

      await doc.ref.update({ status: "sent" });
      console.log(`Sent "${title}" to ${tokens.length} device(s).`);
      sent.push(title);
    } catch (err) {
      await doc.ref.update({ status: "failed", error: err.message });
      console.error(`Failed to send "${title}":`, err.message);
    }
  }
  return sent;
}

// Checks for due scheduled notifications every minute. Replaces the GitHub
// Actions cron as the primary sender - GitHub throttles scheduled workflows
// to runs hours apart, which made "scheduled" sends arrive hours late.
exports.sendScheduledNotifications = onSchedule(
  { schedule: "every 1 minutes", timeZone: "America/Toronto" },
  async () => {
    await sendDueNotifications();
  }
);
