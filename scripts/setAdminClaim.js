// One-time helper to grant (or revoke) organizer/admin access to a Firebase
// Auth user. Run from the project root:
//
//   node scripts/setAdminClaim.js you@example.com
//   node scripts/setAdminClaim.js you@example.com --revoke
//
// Requires a Firebase service account key saved as serviceAccountKey.json in
// the project root (Firebase console -> Project settings -> Service accounts
// -> Generate new private key). That file is gitignored - never commit it.

const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const path = require("path");

// Admin access is locked to this one organizer account (also hardcoded in
// firestore.rules, so granting the claim to any other email wouldn't
// actually unlock anything — this just fails fast).
const ALLOWED_ADMIN_EMAIL = "theriaultmatt889@gmail.com";

const email = process.argv[2];
const revoke = process.argv.includes("--revoke");

if (!email) {
  console.error("Usage: node scripts/setAdminClaim.js <email> [--revoke]");
  process.exit(1);
}

if (!revoke && email.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
  console.error(
    `Refusing to grant admin to ${email}.\n` +
      `Admin access is locked to ${ALLOWED_ADMIN_EMAIL} in firestore.rules — ` +
      `granting the claim to any other account wouldn't give it real access anyway.`
  );
  process.exit(1);
}

const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch {
  console.error(
    `Couldn't find serviceAccountKey.json in the project root.\n` +
      `Download it from Firebase console -> Project settings -> Service accounts -> Generate new private key.`
  );
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();

auth
  .getUserByEmail(email)
  .then((user) => auth.setCustomUserClaims(user.uid, { admin: !revoke }).then(() => user))
  .then((user) => {
    console.log(`${revoke ? "Revoked" : "Granted"} admin access for ${user.email}.`);
    console.log("They'll need to sign out and back in for it to take effect.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to update claim:", err.message);
    process.exit(1);
  });
