// Sends any push notifications that were scheduled for now or earlier, then
// marks them sent. Runs on a cron via
// .github/workflows/scheduled-notifications.yml (nothing needs to run this
// locally, but you can with FIREBASE_SERVICE_ACCOUNT set in your shell).
//
// Requires FIREBASE_SERVICE_ACCOUNT - the full service-account JSON, as a
// single-line string - set as a GitHub Actions repository secret. See
// README.md for how to create it (same service account used for
// serviceAccountKey.json / scripts/setAdminClaim.js).

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp, FieldValue } = require("firebase-admin/firestore");

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";
const CHUNK_SIZE = 90; // Expo recommends batches of ~100 messages per request.

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
  console.error("FIREBASE_SERVICE_ACCOUNT env var is not set.");
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(raw)) });
const db = getFirestore();

async function run() {
  const due = await db
    .collection("scheduledNotifications")
    .where("status", "==", "pending")
    .where("sendAt", "<=", Timestamp.now())
    .get();

  if (due.empty) {
    console.log("No scheduled notifications are due.");
    return;
  }

  const tokensSnapshot = await db.collection("pushTokens").get();
  const tokens = tokensSnapshot.docs
    .map((doc) => doc.data().token)
    .filter((token) => typeof token === "string" && token.startsWith("ExponentPushToken"));

  for (const doc of due.docs) {
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
    } catch (err) {
      await doc.ref.update({ status: "failed", error: err.message });
      console.error(`Failed to send "${title}":`, err.message);
    }
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
