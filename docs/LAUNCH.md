# Launch & Growth Playbook (private notes)

Everything here is for **you** to act on. Not user-facing. Delete or keep — your call.

---

## 1. GitHub repo setup (do these in the browser, 5 min)

These are the biggest, fastest trust + SEO wins. None require code.

### About box (top-right of repo, gear icon)
- **Description:**
  `Free, privacy-first Pomodoro focus timer Chrome extension. One task, full focus, dopamine rewards. No tracking, zero dependencies, open source.`
- **Website:** your Product Hunt or Chrome Web Store link once you have one.
- **Topics** (click the gear → add these — this is GitHub's main SEO lever):
  ```
  pomodoro  pomodoro-timer  productivity  focus  focus-timer
  chrome-extension  browser-extension  manifest-v3  deep-work
  time-management  privacy  open-source  javascript  no-tracking
  ```

### Repo settings
- Settings → General → **enable Issues** and **Discussions** (looks alive).
- Settings → Security → **enable Private vulnerability reporting** (matches SECURITY.md).
- Add a **social preview image** (Settings → General → Social preview): a 1280×640
  banner of the timer UI. This is what shows when the link is shared on Twitter/Slack —
  huge for click-through.
- Pin the repo to your profile.

---

## 2. Screenshots / demo GIF (the #1 conversion driver)

People star what they can *see*. Do this before any promo.

- Record a short screen capture: open the popup, add a task, set Focus to 1 min,
  hit START, let it complete → show the confetti + chime + voice celebration.
- Tools: macOS `Cmd+Shift+5` for video, then convert to GIF (e.g. Gifski, or
  `ffmpeg`). Keep it <10s, <5MB.
- Save as `docs/demo.gif`, then uncomment the image line at the top of `README.md`.
- Also grab 3-4 PNG screenshots (timer, task list, stats, settings) for Product Hunt
  and the future Chrome Web Store listing.

---

## 3. Product Hunt launch

**Best day:** Tue–Thu. Launch at **12:01 AM PST** (PH day resets then) for a full day
of votes.

**Name:** FocusFlow — Deep Work Engine

**Tagline (60 char max):**
`A privacy-first Pomodoro timer that rewards your focus`

**Description:**
> FocusFlow turns the Pomodoro Technique into a reward loop your brain wants to come back
> to. Pick one task, lock in, and when the timer ends you get a celebration — voice
> cheer, completion chime, and confetti across your screen. It tracks streaks and focus
> minutes to keep you coming back.
>
> 100% local and private: no accounts, no servers, no tracking, zero dependencies. It's
> open source — read every line. Free forever.
>
> Built for anyone who opens twelve tabs and finishes nothing. One task. Full focus.

**First comment (post it yourself right after launch):**
> Hey PH 👋 I built FocusFlow because every Pomodoro app either nagged me or harvested my
> data. This one does neither — it's fully local, open source, and it actually celebrates
> you when you finish. Would love your feedback on the reward loop. What makes *you*
> come back to a focus app?

**Assets needed:** the demo GIF + 3 screenshots from step 2.

---

## 4. Show HN (Hacker News)

**Title:** `Show HN: FocusFlow – a privacy-first, open-source Pomodoro timer for Chrome`

**Body:**
> I made a Chrome extension that runs the Pomodoro technique with a twist: when a session
> ends it celebrates you (voice + chime + confetti) to build a reward loop. It's fully
> local — no backend, no analytics, zero dependencies — so the whole thing is auditable
> in a few minutes. MV3, plain JS.
>
> Repo: https://github.com/Charan-place/focus-flow-extension
>
> Curious whether the "reward" angle actually helps people stick with focus tools, or if
> it's just noise. Feedback welcome.

Post 8–10 AM PST on a weekday. Reply to every comment.

---

## 5. Reddit

Subreddits: r/productivity, r/chrome_extensions, r/GetMotivated, r/ADHD (huge focus-tool
audience — but read each sub's self-promo rules first; some require you be an active
member).

**Title:** `I built a free, open-source Pomodoro extension that celebrates you when you finish a task`

Lead with the GIF, mention it's free + no tracking + open source, link the repo, ask a
question to spark comments. Don't just drop a link — Reddit punishes that.

---

## 6. Awesome-list PRs (slow but evergreen SEO)

Search GitHub for these and open a PR adding FocusFlow:
- `awesome-chrome-extensions`
- `awesome-productivity`
- `awesome-pomodoro`
- `awesome-selfhosted` (it's local-first, may fit)

Each merged PR = a permanent backlink + steady discovery.

---

## 7. On GitHub Trending (the honest part)

Trending = a burst of stars in a short window (roughly a day). There is no trick —
you need real humans starring in a tight timeframe. The realistic recipe:

1. Repo must look finished first (demo GIF, license, privacy/security docs — done).
2. Launch on Product Hunt + Show HN **on the same day** to concentrate the spike.
3. Post the repo link in those threads and ask people who like it to star.
4. If 50–150+ stars land in a day, you have a real shot at the
   `javascript` / `chrome-extension` trending pages.

Do **not** buy stars or use star-exchange schemes — GitHub flags and bans for it, and it
kills credibility.

---

## 8. The real 1-click install

GitHub will always be developer-mode/unpacked — never true one-click for normal users.
When you're ready for that audience:

- Register a Chrome Web Store developer account ($5 one-time).
- Zip the extension (manifest at the zip root) and upload.
- Add screenshots + the privacy disclosures (you already have PRIVACY.md to copy from).
- Review takes ~1–3 days. After approval, add an **"Add to Chrome"** button at the top
  of the README linking to the store page — *that's* the one-click install.
