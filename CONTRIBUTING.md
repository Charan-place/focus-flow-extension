# Contributing to FocusFlow

Thanks for your interest! FocusFlow is intentionally simple — plain HTML/CSS/JS, no build
step, no dependencies — so contributing is easy.

## Run it locally

1. Clone the repo:
   ```bash
   git clone https://github.com/Charan-place/focus-flow-extension.git
   ```
2. Open `chrome://extensions` in Chrome (or any Chromium browser).
3. Toggle **Developer mode** ON (top right).
4. Click **Load unpacked** and select the cloned folder.
5. Make changes, then click the ↻ reload button on the FocusFlow card to see them.

## Project layout

| File | Role |
|------|------|
| `manifest.json` | MV3 manifest, permissions, entry points |
| `service-worker.js` | Timer engine, alarms, state, stats, alerts, TTS, sound |
| `content-script.js` | Full-screen celebration overlay + confetti |
| `offscreen.html` / `offscreen.js` | Hidden audio document for chimes |
| `popup/` | The toolbar popup UI |
| `sounds/` | Completion chime audio |
| `icons/` | Extension icons |

## Guidelines

- **Match the existing style.** No frameworks, no bundlers. Keep it dependency-free.
- **Privacy is a hard rule.** No analytics, no tracking, no network calls for user data.
  See [PRIVACY.md](PRIVACY.md).
- **One change per PR.** Small, focused pull requests are easier to review.
- **Test manually** by loading unpacked and running a short focus session (set Focus to
  1 minute in Settings to test quickly).

## Ideas welcome

Check the open issues, or open a new one to discuss a feature before building it. Good
first issues: bundling the overlay font locally, custom chime uploads, Firefox port.
