# Google Play Store — path to production

Checklist for getting `org.cfpm.conference` from internal testing to a public Play Store
listing. Originally pulled from the Play Console dashboard checklist on 2026-09-11;
updated 2026-09-14 after completing sections 1–3. Re-check the console for current
status before resuming, since Google's requirements/wording can shift.

**Update 2026-09-15 — plan flip-flopped, landed back on Production after all.**
Briefly considered matching iOS's private/unlisted direction here too (staying on
closed testing indefinitely instead of applying for Production - see prior version of
this note in git history), but reversed course same day: maintaining a tester email
list for 80-200+ attendees, kept current as more people register right up to the
conference, is real ongoing admin burden for a solo organizer that isn't justified here.
**Reasoning for the platform asymmetry (private iOS, public Android) is intentional, not
an oversight:** the motivation for going private on iOS was specifically to avoid
Apple's discretionary Guideline 3.2 business-model review risk (see
[[project-appstore-3-2-contingency]]) - Google Play's review process has no equivalent
discretionary "is this really public" judgment call, so that risk doesn't exist here.
The `CFPM2026` in-app access code still protects actual content either way, so a public
*listing* doesn't mean open *access* - going public just means the app is discoverable/
installable without email pre-registration, nothing about the app's behavior changes.
**Current plan: apply for Production once the 12-testers/14-days requirement clears**
(already running, see section 3) - normal public Play Store listing, easiest install
experience for non-technical attendees (no opt-in step, no tester list to maintain).

**App**: CFPM Conference (`org.cfpm.conference`)
**Play Console account**: MartB (personal account, ID `5402622256860424059`)
**App ID**: `4973323512103925390`

## 1. Content declarations — ✅ done (2026-09-14)

All declarations under App content are complete: privacy policy URL, sign-in details
(conference code CFPM2026 explained), ads (none), content rating (IARC → "All ages"),
target audience (18+), data safety (Name + Device/other IDs declared, "app functionality"
purpose, no third-party sharing), advertising ID (none), government apps (no), financial
features (none), health apps (none).

## 2. Store presentation — ✅ mostly done (2026-09-14)

- App category: **Events**. Contact email: `membership@cfpmcanada.ca`. Support URL
  published.
- Default store listing (English - US): app name, short description, full description
  all saved. App icon (512x512) and feature graphic (1024x500) uploaded. Phone
  screenshots (2-8 required) — pending, to be captured from an Android device.

## 3. Closed testing — submitted for review 2026-09-14

- Closed testing - Alpha track created, restricted to **Canada only**.
- Release created with build 7 (1.0.0), submitted to Google for review 2026-09-14 —
  cleared review, live "Available to selected testers" as of Sep 14 4:06 PM.
- Need **12 testers opted in, for 14 continuous days** before production access unlocks.
  As of 2026-09-14: 0 opted in yet — get the opt-in link out to testers as soon as this
  submission clears review.
- **Update 2026-09-15: 12+ testers confirmed opted in — the 14-day clock has started.**
  Confirmed via Play Console > Dashboard > Production section checklist: "Publish a
  closed testing release" and "Have at least 12 testers opted-in" both show green
  checkmarks; only "Run your closed test with at least 12 testers, for at least 14 days"
  remains open. Google does not display an exact start date or day-count anywhere in the
  console — just this checklist state — so the exact day the 14-day window started isn't
  directly visible, only that it's in progress. Re-check this same Dashboard page
  periodically; "Apply for production" unlocks automatically once the third item checks
  off.

### Important: what "opted in" actually requires

**Testers only need a Google account — not an Android device.** Opting in means
visiting the opt-in URL (Testing → Closed testing → Closed testing - Alpha → Testers
tab) and clicking "Become a tester" while signed into any Google account. They do not
need to install the app or own an Android phone for it to count toward the 12. This
matters because the requirement felt like it needed 12 people who own Android devices —
it doesn't. Any 12 people with a Gmail/Google account can opt in from any device
(iPhone, desktop browser, etc.).

The 14-day clock effectively only counts while the opted-in count is **at or above 12**
— if it drops below 12 mid-window, Google can reset the clock, so a few extra past 12 is
a safe buffer.

## 4. Apply for production access — the current plan

Unlocks only once step 3's criteria (12 testers, 14 days) are met. As of 2026-09-15,
still waiting on the 14-day window (12+ testers opted in, but the "run for at least 14
days" checklist item is still unchecked and "Apply for production" is still greyed out
in the Dashboard). Google reviews the production application itself after that
(separate from the automated review each release gets).

**Remember:** the Canada-only country restriction was set on the Closed testing track
specifically — it does **not** carry over to Production automatically. Once production
access unlocks, redo the same restriction there (Test and release → Production →
Countries/regions).

## Notes

- Internal testing is already live and working (see git history / conversation — FCM
  push notifications confirmed working on a real device via that track). No country
  restriction exists for Internal testing — testers there are managed by email invite,
  not geography.
- The Firebase backend (Firestore + Cloud Functions) is shared across iOS/Android/web
  admin dashboard, so nothing here affects content management — this is purely
  Play Store distribution paperwork.
