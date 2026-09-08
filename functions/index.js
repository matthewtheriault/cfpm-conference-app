const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";
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
