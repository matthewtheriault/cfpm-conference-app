# CFPM Conference App

The official mobile app for the Canadian Federation of Podiatric Medicine conference.
Built with [Expo](https://expo.dev) (React Native + TypeScript) so one codebase ships
to both the App Store and Google Play, with [Firebase](https://firebase.google.com)
as the backend for content and push notifications, and [Cloudinary](https://cloudinary.com)
for admin photo/logo uploads.

## What's in the app

- **Conference code gate** — attendees enter `CFPM2026` once to unlock the app (stored
  on-device after that), then enter their first and last name once (no password, no
  account — just personalizes the app).
- **Home, Schedule, Map, Updates, More** — the bottom tab bar. "More" holds Events,
  Speakers, Exhibitors, Sponsors, and Polls & Surveys, since a phone can't fit nine tabs.
  Everything reads live from Firestore, so you can publish/update content without an app
  store release, and each section shows a friendly "coming soon" state until real content
  is added.
- **Schedule** — day-by-day tabs at the top, tap a session for full details, tap the star
  to bookmark it (saved on-device).
- **Speakers & Exhibitors** — profile lists with photos/logos and detail pages.
- **Map** — toggle between the venue floor plan and the exhibit hall floor plan.
- **Updates** — a feed of everything sent from the admin dashboard's push notification
  tool, so attendees can catch up even if they missed the push.
- **Polls & Surveys** — post-lecture polls and a post-conference survey; each device can
  answer a given poll once (there's no real account system to enforce this server-side).
- **Admin dashboard** — sign in with the organizer's Firebase account to manage every
  content type (Schedule, Speakers, Exhibitors, Sponsors, Events, Maps, Polls & Surveys)
  and to send push notifications. Reachable from the shield icon in the header, or the
  "Admin sign in" link on the code-entry screen. **Admin access is hardcoded to one email
  address** (see "Admin access" below) — it can't be granted to anyone else, even by
  accident. Photo/logo uploads go through Cloudinary (not Firebase Storage), so the app
  stays entirely on Firebase's free Spark plan — see "Cloudinary setup" below.
- **Push notifications** — sent directly from the organizer's device to Expo's push
  service (works for both iOS and Android without you managing APNs/FCM credentials, and
  needs no backend server). Notifications are send-immediately only — there's no
  "schedule for later" yet, since that would need a server running in the background even
  when no one has the app open. If you want scheduled sends later, the two paths are: a
  free scheduled GitHub Actions workflow, or Firebase Cloud Functions on the paid Blaze
  plan — ask and we can add either.

## One-time setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com) and create a project.
2. Add a **Web app** (yes, even though this is a mobile app — the Firebase JS SDK used
   here connects the same way on iOS/Android/web). Copy the config values it gives you.
3. Enable **Firestore Database** (production mode).
4. Enable **Authentication -> Sign-in method -> Email/Password** (this is how you, the
   organizer, sign in to the admin dashboard — attendees never use Firebase Auth).

That's it for billing — everything in this app runs on Firebase's free **Spark** plan.
Photo/logo/map uploads go through Cloudinary instead of Firebase Storage (see below), so
nothing here requires upgrading to the paid Blaze plan.

### 3. Cloudinary setup (for admin photo/logo uploads)

1. Create a free account at [cloudinary.com](https://cloudinary.com) — no credit card
   required. Your **Cloud name** is shown on the dashboard.
2. Go to Settings (gear icon) → Upload → **Upload presets** → Add upload preset.
   - Set **Signing mode** to **Unsigned** (required — the app uploads directly from the
     organizer's device, with no backend server available to sign requests).
   - Restrict it: set **Allowed formats** to image types only (e.g. `jpg,png,webp`), set a
     reasonable **Max file size**, and consider turning on **Moderation**. An unsigned
     preset's name isn't secret once it ships in the app, so these limits are what keep
     the preset from being abused if someone finds it — they can't touch anything else in
     your account, but they could otherwise upload arbitrary images against your free
     quota.
   - Save it and copy the preset name.

### 4. Configure the app

```bash
cp .env.example .env
```

Fill in `.env` with the values from Firebase console → Project settings → General →
Your apps → SDK setup and configuration, plus `CLOUDINARY_CLOUD_NAME` and
`CLOUDINARY_UPLOAD_PRESET` from the step above.

### 5. Deploy Firestore rules

```bash
npm install -g firebase-tools   # if you don't already have it
firebase login
```

Edit `.firebaserc` and replace `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID` with your actual
Firebase project ID, then:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### 6. Give yourself admin access

Admin access is locked to **one email address**, hardcoded in two places: the
`isAdmin()` check in `firestore.rules`, and a guard in `scripts/setAdminClaim.js` that
refuses to grant the claim to anyone else. This means even if the grant script were ever
run against a different account, Firestore would still reject its writes. If the
organizer's email ever changes, update the email in both of those files together.

Note this doesn't cover Cloudinary uploads — an unsigned upload preset accepts uploads
from anyone who has the preset name, not just signed-in admins (there's no concept of
"admin" in Cloudinary itself). The format/size/moderation restrictions from the
Cloudinary setup step above are what keep that endpoint from being abused, since the
app's admin sign-in only gates the *button* in the UI, not the network request itself.

1. In the Firebase console, create your organizer account under Authentication (using
   that exact email) — or sign up once from the app's Admin sign-in screen.
2. Firebase console → Project settings → Service accounts → **Generate new private
   key**. Save the downloaded file as `serviceAccountKey.json` in the project root
   (it's gitignored — never commit it).
3. Run:

   ```bash
   node scripts/setAdminClaim.js you@example.com
   ```

4. Sign out and back in on the Admin screen in the app for the permission to take effect.

## Running the app

```bash
npm start
```

Then press `i` for the iOS simulator, `a` for Android, or scan the QR code with the
[Expo Go](https://expo.dev/go) app on your phone. `npm run web` also works for quick UI
checks in a browser, but push notifications and some native behavior only work on a
real device/simulator.

## Managing content

Everything below is editable from the admin dashboard (shield icon → sign in → "Manage
content") — pick photos straight from your device and they upload to Cloudinary
automatically, or paste an image URL instead if you'd rather host it elsewhere.

- **Schedule** — sessions grouped by day, with sort order, time, speaker, location, and
  description.
- **Speakers** — name, title, organization, bio, headshot.
- **Exhibitors** — name, booth number, category, bio, website, logo.
- **Sponsors** — name, tier (Platinum/Gold/Silver/Bronze), website, description, logo.
- **Events** — title, date, time, location, description, image.
- **Maps** — separate image + notes for the Venue map and the Exhibit Hall map.
- **Polls & Surveys** — title, description, poll vs. survey, open/closed, and a list of
  questions (single choice, multiple choice, or open text).

You can still add/edit documents directly in the Firestore console if you ever need to
— the collections are `schedule`, `speakers`, `exhibitors`, `sponsors`, `events`, `map`
(fixed doc IDs `venue` and `exhibitHall`), and `polls`.

## Sending push notifications

Sign in on the Admin dashboard (shield icon in the header) with your organizer account.
Compose a title and message and tap **Send Now** — it's delivered within a few seconds,
directly from your device to every attendee's phone that has the app installed with
notifications enabled, and also appears in every attendee's **Updates** tab. A log of
what was sent, when, and to how many devices shows underneath.

You can also switch to **Schedule for later**, pick a date/time, and it'll be queued
instead of sent immediately (shown under "Scheduled", with a cancel button). Delivery is
handled by a GitHub Actions workflow (`.github/workflows/scheduled-notifications.yml`)
that checks for due sends roughly every 10 minutes — it can run a few minutes late under
GitHub's scheduler, and GitHub pauses scheduled workflows on repos with no activity for
60 days (any push or a manual "Run workflow" click re-enables it). This keeps everything
on Firebase's free Spark plan, since it avoids needing Cloud Functions (which requires
the paid Blaze plan).

**One-time setup for scheduled sends:** the workflow needs its own copy of the service
account key (the `serviceAccountKey.json` you already generated in step 6 above, but
GitHub can't read your local gitignored file — it goes into a repository secret
instead):

1. Open the `serviceAccountKey.json` file you downloaded earlier.
2. In GitHub: your repo → Settings → Secrets and variables → Actions → New repository
   secret.
3. Name it `FIREBASE_SERVICE_ACCOUNT`, paste the entire JSON file's contents as the
   value, and save.

That's it — scheduled sends will start working on the next scheduled run (or trigger one
immediately from the Actions tab → "Send scheduled notifications" → Run workflow).

## Building for the App Store / Google Play

This project uses [EAS Build](https://docs.expo.dev/build/introduction/). You'll need:

- An [Apple Developer Program](https://developer.apple.com/programs/) account ($99/yr)
- A [Google Play Developer](https://play.google.com/console/signup) account ($25 one-time)

Once you have those:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform all
```

EAS will walk you through generating signing credentials. After a build succeeds,
`eas submit --platform ios` / `eas submit --platform android` uploads it to the
respective store. We can revisit this step together when you're ready to submit.

## Project structure

```
App.tsx                  App entry: providers, navigation, push registration
app.config.ts             Expo config (app name, icons, bundle IDs, env wiring)
src/
  context/                Conference-code gate, name-entry profile, bookmarks, admin auth
  screens/                Home/Schedule/Map/Updates/More tabs and their detail screens,
                           code-gate, name-entry, admin login/dashboard
  admin/                  Generic admin content-editor + per-entity field configs/screens
  navigation/              Root stack, bottom tab navigator, per-tab stacks
  hooks/                  Firestore data-fetching hook
  firebase.ts              Firebase SDK initialization (Auth, Firestore)
  storage.ts                Image upload helper (Cloudinary, unsigned upload preset)
  deviceId.ts                Per-device random id (poll "already answered" tracking)
  pollAnswered.ts             On-device poll-answered tracking
  notifications.ts          Push token registration
  pushSend.ts                Sends a push notification directly to all devices
  theme.ts                  Shared colors/spacing
  components/ErrorBoundary.tsx, OfflineBanner.tsx   Crash guard + offline banner (see App.tsx)
scripts/setAdminClaim.js    Grants/revokes the admin custom claim (locked to one email)
scripts/sendScheduledNotifications.js   Delivers due "scheduled for later" notifications
.github/workflows/scheduled-notifications.yml   Cron trigger for the script above
firestore.rules            Firestore security rules (admin locked to one email)
```
