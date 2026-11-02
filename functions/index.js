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

// A batch that fails (network error, non-2xx, or a request-level error in
// Expo's reply) is retried after each of these delays before giving up.
const RETRY_DELAYS_MS = [2000, 5000];
// A scheduled notification that reached no one at all (e.g. Expo was down)
// goes back in the queue for the next minute's run, up to this many times.
const MAX_SCHEDULED_ATTEMPTS = 10;
// Per-request timeout, so a hung connection counts as a failed attempt.
const REQUEST_TIMEOUT_MS = 10000;
// A claimed notification still "sending" after this long means its run died
// mid-send (the function timed out or crashed).
const STALE_SENDING_MS = 10 * 60 * 1000;

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function postBatch(batch) {
  const response = await fetch(EXPO_PUSH_ENDPOINT, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(batch),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Expo push service returned HTTP ${response.status}`);
  }
  const result = await response.json().catch(() => ({}));
  // Request-level errors reject the whole batch. Per-device errors inside
  // result.data (e.g. an uninstalled app) only affect that one device, so
  // they don't count as a failed batch.
  if (Array.isArray(result.errors) && result.errors.length > 0) {
    throw new Error(`Expo push service error: ${result.errors[0].message || result.errors[0].code}`);
  }
}

/**
 * Sends one message to every token, in batches, retrying failed batches.
 * Returns how many devices it reached and the last error, if any batch
 * still failed after retries.
 */
async function sendToTokens(tokens, title, body) {
  const messages = tokens.map((to) => ({ to, title, body, sound: "default" }));
  let delivered = 0;
  let lastError = null;
  for (const batch of chunk(messages, CHUNK_SIZE)) {
    for (let attempt = 0; ; attempt++) {
      try {
        await postBatch(batch);
        delivered += batch.length;
        break;
      } catch (err) {
        if (attempt >= RETRY_DELAYS_MS.length) {
          lastError = err;
          console.error(`Batch of ${batch.length} failed after retries:`, err.message);
          break;
        }
        await sleep(RETRY_DELAYS_MS[attempt]);
      }
    }
  }
  return { delivered, total: tokens.length, lastError };
}

/**
 * Sends a push notification to every registered device. Called from the
 * admin dashboard (web or native) via a callable function so the request
 * runs server-side - browsers block a direct client fetch to Expo's push
 * API since it doesn't return CORS headers.
 */
exports.sendPushNotification = onCall({ timeoutSeconds: 120 }, async (request) => {
  if (!request.auth?.token?.admin) {
    throw new HttpsError("permission-denied", "Admin access required.");
  }

  const title = String(request.data?.title ?? "").trim();
  const body = String(request.data?.body ?? "").trim();
  if (!title || !body) {
    throw new HttpsError("invalid-argument", "Title and body are required.");
  }

  const tokens = await getPushTokens();
  const { delivered, total, lastError } = await sendToTokens(tokens, title, body);

  // Reached no one: fail loudly so the admin sees "Couldn't send" - retrying
  // is safe since nobody got it.
  if (total > 0 && delivered === 0) {
    throw new HttpsError("unavailable", `Push service unavailable: ${lastError?.message}`);
  }

  // Partial delivery still succeeds (retrying would double-send to the
  // devices that did get it); the count the admin sees is the real one.
  await db.collection("notifications").add({
    title,
    body,
    recipientCount: delivered,
    sentBy: request.auth.token.email || request.auth.uid,
    sentAt: FieldValue.serverTimestamp(),
  });

  return { recipientCount: delivered };
});

async function getPushTokens() {
  const tokensSnapshot = await db.collection("pushTokens").get();
  return tokensSnapshot.docs
    .map((doc) => doc.data().token)
    .filter((token) => typeof token === "string" && token.startsWith("ExponentPushToken"));
}

// Marks notifications whose run died mid-send as failed, rather than leaving
// them stuck at "sending". Not re-queued: some devices may already have it.
async function failStaleSends() {
  const stale = await db
    .collection("scheduledNotifications")
    .where("status", "==", "sending")
    .where("claimedAt", "<=", Timestamp.fromMillis(Date.now() - STALE_SENDING_MS))
    .get();
  for (const doc of stale.docs) {
    await doc.ref.update({ status: "failed", error: "Send was interrupted partway through" });
    console.error(`"${doc.data().title}" was interrupted mid-send; marked failed.`);
  }
}

/**
 * Sends any scheduled notifications that are due, then marks them sent.
 * Each one is claimed (pending -> sending) in a transaction first, so an
 * overlapping run - or a manual run of the GitHub Actions backup - can
 * never send the same notification twice.
 */
async function sendDueNotifications() {
  // Housekeeping only - must never stop due notifications from going out.
  await failStaleSends().catch((err) => console.error("Stale-send check failed:", err.message));

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
      tx.update(doc.ref, { status: "sending", claimedAt: Timestamp.now() });
      return true;
    });
    if (!claimed) continue;

    const { title, body, createdBy, attempts = 0 } = doc.data();
    try {
      const { delivered, total, lastError } = await sendToTokens(tokens, title, body);

      // Reached no one (e.g. Expo was down): put it back in the queue for the
      // next run. Safe to retry, since nobody received it.
      if (total > 0 && delivered === 0) {
        const nextAttempts = attempts + 1;
        await doc.ref.update(
          nextAttempts < MAX_SCHEDULED_ATTEMPTS
            ? { status: "pending", attempts: nextAttempts, error: lastError?.message ?? null }
            : { status: "failed", attempts: nextAttempts, error: lastError?.message ?? "Push service unavailable" }
        );
        console.error(`"${title}" reached no devices (attempt ${nextAttempts}):`, lastError?.message);
        continue;
      }

      await db.collection("notifications").add({
        title,
        body,
        recipientCount: delivered,
        sentBy: createdBy ? `${createdBy} (scheduled)` : "scheduled",
        sentAt: FieldValue.serverTimestamp(),
      });

      if (delivered < total) {
        // Partial: not re-queued, since that would double-send to the devices
        // that did get it.
        await doc.ref.update({
          status: "failed",
          error: `Reached ${delivered} of ${total} devices: ${lastError?.message}`,
        });
        console.error(`"${title}" reached ${delivered} of ${total} device(s).`);
      } else {
        await doc.ref.update({ status: "sent" });
        console.log(`Sent "${title}" to ${delivered} device(s).`);
        sent.push(title);
      }
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
  // Worst case (every batch retried to its timeout) needs more than the
  // default 60s; overlapping runs are safe thanks to the claim above.
  { schedule: "every 1 minutes", timeZone: "America/Toronto", timeoutSeconds: 300 },
  async () => {
    await sendDueNotifications();
  }
);
