# App Store Connect listing — final

Finalized copy, ready to paste into App Store Connect.

- **App name** (30 char max): `CFPM Conference`
- **Subtitle** (30 char max): `CFPM Annual Conference`
- **Primary category**: Business
- **Secondary category**: Reference
- **Promotional text** (170 char max, editable without a new build):

  > Your CFPM conference companion — schedule, speakers, exhibitors, sponsors, and live
  > updates, all in one place.

- **Description** (4000 char max):

  > The official app for the Canadian Federation of Podiatric Medicine's annual
  > conference. Enter your conference code once and you're in — no account or password
  > required.
  >
  > • Full session schedule with day-by-day tabs and track filters — bookmark the ones
  > you don't want to miss
  > • Speaker and exhibitor profiles
  > • Sponsor recognition
  > • Live push notifications for schedule changes and announcements
  > • Venue and exhibit hall maps
  > • Post-session polls and the conference survey
  > • Conference board and staff directory
  >
  > No account needed — just enter your name once to personalize the app.

- **Keywords** (100 char max, comma-separated): `conference,podiatry,podiatric,medicine,CFPM,schedule,medical conference`
- **Support URL**: `https://matthewtheriault.github.io/cfpm-conference-app/support.html`
- **Marketing URL**: (skipped — no separate conference website page for the app)
- **Privacy Policy URL**: `https://matthewtheriault.github.io/cfpm-conference-app/privacy.html`
- **Age rating questionnaire**: answer "None" throughout (no user-generated content
  visible to other users, no mature/suggestive content, no gambling, no unrestricted web
  access). Expect 4+.
- **Contact info**: `membership@cfpmcanada.ca`
- **Copyright**: `© 2026 Canadian Federation of Podiatric Medicine`

## Screenshots

Uploaded (iPhone 6.5" Display slot, resized to 1284×2778px): **Map**, **Events**,
**Home**, **More**. Captured live from the iOS Simulator (`xcrun simctl io booted
screenshot`) and resized with PIL to match Apple's required bucket exactly — raw
simulator output (1320×2868, iPhone 17 Pro Max) isn't an accepted size.

None of the four show exhibitor/sponsor logos or speaker names/photos, per instruction —
Home has no sponsor carousel since no sponsors are configured yet in this pass, Map is
venue-only, More is just the app's own menu, Events shows a single non-personal event.
The **Schedule** screen was captured but held back — it shows speaker names inline in
session listings (e.g. "Dr. Ivan Bristow"), which falls under the same restriction.

Screenshots don't need to be conference-specific to pass review — Apple just wants proof
of a real, working app, not empty placeholders. These four satisfy that. If a 5th is
wanted later, Polls & Surveys and My Schedule are currently empty-state and should be
avoided until they have real data.

## Still needed before submission (not code)

- Real screenshots at the correct resolution (see above).
- Confirm real conference content (schedule, speakers, exhibitors) is populated in the
  admin dashboard, not test/placeholder data.
