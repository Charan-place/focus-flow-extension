<div align="center">

# ◎ FocusFlow — Deep Work Engine

**A free, open-source, privacy-first Pomodoro focus timer for Chrome.**
One task. Full focus. A dopamine-driven reward loop for elite concentration.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](manifest.json)
[![No Tracking](https://img.shields.io/badge/Privacy-No%20Tracking-brightgreen.svg)](PRIVACY.md)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen.svg)](#-how-its-built)
[![Lint](https://github.com/Charan-place/focus-flow-extension/actions/workflows/lint.yml/badge.svg)](https://github.com/Charan-place/focus-flow-extension/actions/workflows/lint.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-orange.svg)](CONTRIBUTING.md)

<!-- TODO: replace with a real demo GIF. Record a 25→1 min session, hit start, show the chime + confetti + voice celebration. Drop the file in docs/ and update the path below. -->
<!-- ![FocusFlow demo](docs/demo.gif) -->

</div>

> **One task. Full focus. A dopamine-driven Pomodoro timer for elite concentration.**

FocusFlow is a Chrome (and Chromium-family) browser extension that turns the classic
[Pomodoro Technique](https://en.wikipedia.org/wiki/Pomodoro_Technique) into a reward
loop your brain actually *wants* to come back to. You pick **one** task, lock in for a
focus session, and when the timer ends FocusFlow celebrates you — a voice cheers you on,
a notification fires, and confetti rains across whatever page you're on. Then it nudges
you into a break, and back again.

**No accounts. No cloud. No tracking. No data ever leaves your device.** The entire
codebase is plain HTML/CSS/JS with zero dependencies — read it in minutes, trust it
forever. See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md).

---

## ⬇️ Install (2 minutes)

> **Coming soon to the Chrome Web Store** for true one-click install. For now, install
> the open-source build directly — it takes two minutes and you can read every line first.

1. **Download** this repo — [grab the ZIP](https://github.com/Charan-place/focus-flow-extension/archive/refs/heads/main.zip) and unzip it, or clone:
   ```bash
   git clone https://github.com/Charan-place/focus-flow-extension.git
   ```
2. Open **`chrome://extensions`** in Chrome / Edge / Brave / Opera.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** → select the `focus-flow-extension` folder.
5. Pin the ◎ icon and start your first focus session.

---

## ✨ What It Does

| Feature | Detail |
|---------|--------|
| **Background timer engine** | Runs in a service worker, so the countdown keeps going even after you close the popup. |
| **Focus / Short Break / Long Break** | Configurable durations (default 25 / 5 / 15 min), with a long break after every N pomodoros. |
| **One-task focus** | A "LOCKED IN ON" banner keeps a single task front and center. No multitasking theater. |
| **Dopamine rewards** | On every completed session: a full-screen celebratory overlay, confetti, a browser notification, an encouraging **text-to-speech voice**, and a **completion chime**. |
| **Completion chimes** | Distinct synthesized tones for focus-done, break-over, and task-conquered — with an on/off toggle and volume slider (previews when you adjust them). |
| **Streaks & stats** | Tracks total pomodoros, focus minutes, tasks completed, current streak, longest streak, and a 7-day bar chart. |
| **Automation** | Optional auto-start of breaks and the next focus block, so you never lose momentum. |
| **100% local & private** | All data is stored in `chrome.storage.local`. Nothing leaves your machine. |

---

## 🚀 Install

### Option A — From the Chrome Web Store (for everyone)
*Once published:* search **"FocusFlow — Deep Work Engine"** in the
[Chrome Web Store](https://chrome.google.com/webstore) and click **Add to Chrome**.
Works in Chrome, Edge, Brave, Opera, and any Chromium browser.

### Option B — Load Unpacked (developers / instant use)
1. Download or clone this folder.
2. Open `chrome://extensions` in your browser.
3. Toggle **Developer mode** (top right) ON.
4. Click **Load unpacked** and select the `focusflow/` folder.
5. Pin the ◎ icon to your toolbar. Done.

---

## 🎮 How to Use

1. Click the ◎ toolbar icon.
2. Type a task → press **+** → click it to make it the active task.
3. Hit **START**. Work until the ring empties.
4. Get celebrated. Take your break. Repeat.
5. Click **◈** to see your stats, **⚙** to tune durations, voice, and automation.

---

## 🧱 How It's Built

```
focusflow/
├── manifest.json        # MV3 manifest, permissions, entry points
├── service-worker.js    # Timer engine: alarms, state, stats, alerts, TTS, sound
├── content-script.js    # Full-screen celebration overlay + confetti (injected into pages)
├── offscreen.html/.js   # Hidden audio doc — plays chimes (SW can't touch Audio)
├── popup/
│   ├── popup.html       # UI: timer ring, task list, stats, settings
│   ├── popup.css        # Styling
│   └── popup.js         # UI logic, talks to the service worker via messages
├── sounds/              # Completion chimes (focus / break / victory .wav)
└── icons/               # 16 / 48 / 128 px icons
```

- **Manifest V3**, no build step, no dependencies — plain HTML/CSS/JS.
- The **service worker** owns the clock. It uses `chrome.alarms` to tick every second
  so the timer survives popup close and even browser idle. State is persisted to
  `chrome.storage.local` and restored when the worker wakes.
- The **popup** is just a view: it sends `START_TIMER` / `PAUSE_TIMER` / etc. messages
  and renders `STATE_UPDATE` broadcasts.
- The **content script** listens for `SHOW_ALERT` and paints the reward overlay on the
  current tab, so the dopamine hit happens *where your eyes already are*.
- The **offscreen document** exists only to play sound. MV3 service workers have no
  `Audio` or DOM, so the worker spins up a hidden `offscreen.html`, sends it a
  `PLAY_SOUND` message, and it plays the matching chime from `sounds/`.

### Permissions, plainly
`storage` (save your tasks/stats locally), `alarms` (the timer ticks), `notifications`
(the "session complete" popup), `tts` (the voice), `activeTab` + `scripting` +
`<all_urls>` (paint the celebration overlay on the current page), `offscreen` (audio).

---

## 🌍 How This Impacts Daily Life

FocusFlow is small, but the behavior it trains is not:

- **It makes starting easy.** The hardest part of deep work is beginning. A single
  visible task plus one button removes the friction that lets you drift to a new tab.
- **It protects your attention from yourself.** By committing to *one* task per block,
  you stop the silent tax of context-switching — the dozen half-finished things that
  leave you tired but with nothing done.
- **It turns effort into evidence.** Streaks and minutes give you proof you showed up.
  Motivation is unreliable; a chain you don't want to break is not.
- **It builds rest into the work.** The breaks aren't a reward for finishing — they're
  part of the method. People who never stop don't work more; they work worse, longer.
- **It celebrates small wins out loud.** The voice, the confetti — they sound silly
  until you notice you actually *want* to start the next session. That's the point: it
  rewires effort to feel good instead of grim.

Over weeks this compounds: fewer open tabs, fewer abandoned tasks, more finished work,
and a calmer relationship with your own focus.

---

## 🪨 Forgotten Life Lessons Inside This Extension

Buried in a 25-minute timer are some old truths we keep relearning:

1. **One thing at a time.** Our grandparents finished what they started before reaching
   for the next thing. Attention is single-threaded; pretending otherwise is the modern
   illusion FocusFlow quietly refuses.

2. **Rest is part of the work, not the enemy of it.** The break is scheduled, mandatory,
   and earned. The field left fallow yields more next season. So does the mind.

3. **Bound your effort and it gets bigger.** A task with no edges expands to fill all
   your dread. Put a 25-minute box around it and suddenly it's just 25 minutes. Limits
   create freedom.

4. **Showing up beats feeling inspired.** The streak doesn't ask if you're motivated.
   Craftsmen built cathedrals by laying one stone a day, not by waiting for a good mood.

5. **Celebrate the small wins.** We've been trained to only mark the finish line. The
   confetti for a single pomodoro is a reminder that progress, not just completion,
   deserves a cheer — and that joy in the doing is what makes the doing last.

6. **Presence is a skill, and skills are practiced.** Focus isn't a personality trait
   you either have or don't. It's a muscle. Every session is a rep.

> *"How we spend our days is, of course, how we spend our lives."* — Annie Dillard
> FocusFlow is just a small machine for spending them on purpose.

---

## 🛠 Roadmap Ideas

- Firefox / Edge store builds (port `chrome.*` → `browser.*`)
- Custom sounds and a "white noise" focus mode
- Per-task pomodoro estimates and history
- Export stats to CSV / sync option (opt-in)

---

## 📄 License

Use it, fork it, make your days better. Add a `LICENSE` file (MIT recommended) before
publishing publicly.
```
