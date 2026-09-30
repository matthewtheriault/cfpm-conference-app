# In-App Messaging Plan — ReadMe

Scoping notes only. **Not started, not scheduled.** Written 2026-09-08 in response to a
"how hard would this be" question, so the idea is captured somewhere before it's
forgotten. This file lives at the repo root (not in `docs/`) specifically so it isn't
published to the public GitHub Pages site.

## The ask

Let attendees message each other in-app (not just receive organizer broadcasts).

## Would an attendee list need to exist?

Yes. Today there's no server-side attendee identity at all — the name someone types in
stays on-device only (see `docs/privacy.html`: "This stays on your device only — it is
never sent to our servers"). Messaging requires a real Firestore collection of
discoverable attendees. That collection doesn't exist today and is the first thing
this project would add.

## Would signing in auto-enroll someone in messaging?

Technically possible, but **not recommended**. Silent auto-opt-in would directly
contradict the current privacy policy's core promise, and Apple's App Review guideline
1.2 (apps with user-to-user communication) generally expects explicit consent plus
safety tooling. The right pattern is an explicit prompt at first use ("want to be
discoverable to other attendees?"), not automatic enrollment.

## Could attendees opt out?

Yes, and it's the cheap part: a toggle in More (discoverable on/off), plus ideally a
way to delete their attendee record entirely.

## Why this is bigger than it looks

The app has **no real per-attendee authentication**. The conference code is a shared
constant, not an identity — nothing distinguishes one attendee from another
server-side. Firestore security rules can't safely gate "only I can read my messages"
without a verifiable identity, so this effectively requires bolting on Firebase
Anonymous Auth (or similar) per attendee *before* messaging itself can be built
securely.

Rough shape of the work:

- New auth layer (anonymous sign-in per attendee) + attendee Firestore collection with
  proper security rules
- Real-time messaging data model (conversations/messages) and UI (directory, threads,
  chat screens)
- Push notifications for new messages — current push setup is one-way organizer
  broadcast only (`scripts/sendScheduledNotifications.js`), would need extending
- Block/report/moderation tooling — near-mandatory for App Review on anything with
  user-to-user messaging
- Privacy policy rewrite, since it currently promises the opposite of what this needs

**Estimate:** medium-to-large — realistically multiple days to a couple weeks of solid
work done properly, mostly because of the auth foundation currently missing, not the
chat UI itself.

## Would it risk breaking anything else?

Not the existing screens directly — schedule/exhibitors/speakers/etc. don't depend on
attendee identity. But it is a genuine architecture shift (first real user accounts in
an app deliberately built to avoid them), which adds ongoing complexity: more Firestore
cost, more security surface, more moderation responsibility for a solo organizer.

## Cheaper alternative worth considering instead

If the real goal is "let attendees connect" rather than full chat, a lightweight
opt-in "interest board" or shareable contact card (QR-based handshake) could solve
networking without the real-time chat + moderation burden. Worth a separate
conversation if this comes back up.
