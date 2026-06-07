# Security Policy — FocusFlow

FocusFlow is built to be safe by design. This document explains how, and how to report
anything you find.

## Security posture

- **No backend, no network data flow.** FocusFlow has no server. Your data never leaves
  your device. There is no API to attack and no database to breach.
- **No remote code.** All JavaScript ships inside the extension and is auditable in this
  repo. Nothing is fetched and executed at runtime. (Manifest V3 forbids remote code,
  and FocusFlow complies.)
- **No dependencies.** Zero npm packages, zero third-party libraries. Nothing to inherit
  a vulnerability from. The entire codebase is plain HTML/CSS/JS you can read in minutes.
- **Least-privilege intent.** Each permission maps to one visible feature — see
  [PRIVACY.md](PRIVACY.md) for the table. The broad `<all_urls>` host permission exists
  only to draw the celebration overlay on the current tab; FocusFlow never reads or
  exfiltrates page content.
- **Local-only storage.** Data lives in `chrome.storage.local` and is removed when you
  uninstall.

## Audit it yourself

You don't have to trust us — read the code:

- [`service-worker.js`](service-worker.js) — the timer engine and alerts
- [`content-script.js`](content-script.js) — the on-page overlay (draw-only)
- [`offscreen.js`](offscreen.js) — plays the local chime files
- [`popup/`](popup/) — the UI

Search the repo for `fetch(`, `XMLHttpRequest`, or any external URL (`http`). You'll find
nothing — fonts and sounds are bundled locally. FocusFlow makes zero network requests.

## Supported versions

The latest release on the `main` branch is the supported version.

## Reporting a vulnerability

If you believe you've found a security issue:

1. **Do not** open a public issue with exploit details.
2. Use GitHub's **private vulnerability reporting** (Security tab → "Report a
   vulnerability"), or open a minimal issue asking for a private contact channel.
3. Include steps to reproduce and the affected file/line if known.

We aim to acknowledge reports within a few days and will credit reporters who wish to be
named once a fix ships.
