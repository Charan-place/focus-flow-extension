# Privacy Policy — FocusFlow

_Last updated: 2026_

**Short version: FocusFlow collects nothing. Nothing leaves your browser. Ever.**

## What data FocusFlow stores

FocusFlow stores the following **locally on your own device**, using the browser's
`chrome.storage.local` API:

- Your tasks (the text you type in)
- Your timer settings (durations, sound, voice preferences)
- Your stats (pomodoro counts, focus minutes, streaks, a 7-day history)

That's it. This data sits in your browser's local storage and is used only to make the
extension work — show your tasks, run your timer, draw your stats chart.

## What FocusFlow does NOT do

- ❌ No accounts, no sign-in, no email collection.
- ❌ No servers. FocusFlow has no backend. There is nowhere for your data to go.
- ❌ No analytics, no telemetry, no tracking pixels, no fingerprinting.
- ❌ No third-party SDKs or ad networks.
- ❌ No selling, sharing, or transmitting of any data to anyone.
- ❌ No reading of page content. (More on permissions below.)

## Network activity

FocusFlow makes **no network requests** for your data. The only outbound request the
code can make is loading a Google Font for the on-page celebration overlay. If you want
zero external requests, that font can be bundled locally — see the repo issues.

## About the permissions

| Permission | Why it's needed |
|------------|-----------------|
| `storage` | Save your tasks, settings, and stats locally. |
| `alarms` | Run the countdown timer reliably in the background. |
| `notifications` | Show the "session complete" desktop notification. |
| `tts` | Speak the encouraging voice line (uses your OS voice; nothing recorded). |
| `offscreen` | Play the completion chime (background workers can't play audio directly). |
| `activeTab` / `scripting` / `<all_urls>` | Paint the celebration overlay on the page you're currently looking at. FocusFlow does **not** read, store, or transmit any page content — it only draws its own overlay on top. |

## Your control

Everything is local, so you are always in full control:

- Clear all stats anytime: **Settings → Reset All Stats**.
- Remove all data: uninstall the extension. Local storage is wiped with it.

## Contact

Questions? Open an issue on the GitHub repository.
