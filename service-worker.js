// FocusFlow Service Worker — Timer Engine
// Survives popup close, drives all alarms and TTS

const ALARM_TICK = 'focusflow-tick';
const ALARM_POMODORO = 'focusflow-pomodoro';
const OFFSCREEN_DOC = 'offscreen.html';

// ─── Default Settings ───────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakAfter: 4,
  ttsEnabled: true,
  ttsVoice: '',
  ttsRate: 0.95,
  ttsPitch: 1.0,
  notificationsEnabled: true,
  soundEnabled: true,
  soundVolume: 0.7,
  autoStartBreaks: false,
  autoStartFocus: false,
  theme: 'dark'
};

// ─── State ──────────────────────────────────────────────────────────
let timerState = {
  running: false,
  mode: 'focus', // focus | shortBreak | longBreak
  secondsLeft: 25 * 60,
  totalSeconds: 25 * 60,
  pomodoroCount: 0,
  activeTaskId: null,
  sessionStart: null
};

// ─── Init ────────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(['settings', 'tasks', 'stats', 'timerState']);
  
  if (!existing.settings) {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
  }
  if (!existing.tasks) {
    await chrome.storage.local.set({ tasks: [] });
  }
  if (!existing.stats) {
    await chrome.storage.local.set({
      stats: {
        totalPomodoros: 0,
        totalFocusMinutes: 0,
        tasksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        dailyHistory: []
      }
    });
  }
  if (existing.timerState) {
    timerState = { ...timerState, ...existing.timerState };
  }
});

// Restore timer state on SW wake
chrome.storage.local.get(['timerState']).then(({ timerState: saved }) => {
  if (saved) timerState = { ...timerState, ...saved };
});

// ─── Alarm Handler ───────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_TICK) {
    await handleTick();
  }
});

async function handleTick() {
  if (!timerState.running) return;

  timerState.secondsLeft -= 1;

  // Broadcast tick to popup
  broadcastState();

  if (timerState.secondsLeft <= 0) {
    await handleTimerComplete();
  } else {
    await saveTimerState();
  }
}

async function handleTimerComplete() {
  const { settings, tasks } = await chrome.storage.local.get(['settings', 'tasks']);
  const cfg = { ...DEFAULT_SETTINGS, ...settings };

  timerState.running = false;
  chrome.alarms.clear(ALARM_TICK);

  if (timerState.mode === 'focus') {
    timerState.pomodoroCount += 1;
    await updateStats(cfg);

    // Check if active task should be marked complete (user decides)
    const activeTask = tasks?.find(t => t.id === timerState.activeTaskId);
    const taskName = activeTask?.text || 'Focus session';

    // Determine next break type
    const isLongBreak = timerState.pomodoroCount % cfg.longBreakAfter === 0;
    const nextMode = isLongBreak ? 'longBreak' : 'shortBreak';
    const nextDuration = isLongBreak ? cfg.longBreak : cfg.shortBreak;

    await triggerAlert({
      type: 'focusComplete',
      taskName,
      pomodoroCount: timerState.pomodoroCount,
      nextMode,
      settings: cfg
    });

    if (cfg.autoStartBreaks) {
      startTimer(nextMode, nextDuration, timerState.activeTaskId);
    } else {
      timerState.mode = nextMode;
      timerState.secondsLeft = nextDuration * 60;
      timerState.totalSeconds = nextDuration * 60;
      timerState.running = false;
      await saveTimerState();
    }

  } else {
    // Break complete
    await triggerAlert({
      type: 'breakComplete',
      settings: cfg
    });

    if (cfg.autoStartFocus) {
      startTimer('focus', cfg.focusDuration, timerState.activeTaskId);
    } else {
      timerState.mode = 'focus';
      timerState.secondsLeft = cfg.focusDuration * 60;
      timerState.totalSeconds = cfg.focusDuration * 60;
      timerState.running = false;
      await saveTimerState();
    }
  }

  broadcastState();
}

// ─── Timer Controls ──────────────────────────────────────────────────
function startTimer(mode, durationMinutes, taskId) {
  chrome.alarms.clear(ALARM_TICK);
  timerState = {
    ...timerState,
    running: true,
    mode,
    secondsLeft: durationMinutes * 60,
    totalSeconds: durationMinutes * 60,
    activeTaskId: taskId,
    sessionStart: Date.now()
  };
  chrome.alarms.create(ALARM_TICK, { periodInMinutes: 1 / 60 });
  saveTimerState();
  broadcastState();
}

function pauseTimer() {
  timerState.running = false;
  chrome.alarms.clear(ALARM_TICK);
  saveTimerState();
  broadcastState();
}

function resumeTimer() {
  if (timerState.secondsLeft <= 0) return;
  timerState.running = true;
  chrome.alarms.create(ALARM_TICK, { periodInMinutes: 1 / 60 });
  saveTimerState();
  broadcastState();
}

function resetTimer(settings) {
  chrome.alarms.clear(ALARM_TICK);
  const cfg = { ...DEFAULT_SETTINGS, ...settings };
  timerState = {
    ...timerState,
    running: false,
    mode: 'focus',
    secondsLeft: cfg.focusDuration * 60,
    totalSeconds: cfg.focusDuration * 60,
    sessionStart: null
  };
  saveTimerState();
  broadcastState();
}

// ─── Message Handler ─────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    const { settings } = await chrome.storage.local.get('settings');
    const cfg = { ...DEFAULT_SETTINGS, ...settings };

    switch (msg.type) {
      case 'START_TIMER':
        startTimer(msg.mode || 'focus', msg.duration || cfg.focusDuration, msg.taskId);
        sendResponse({ ok: true, state: timerState });
        break;

      case 'PAUSE_TIMER':
        pauseTimer();
        sendResponse({ ok: true, state: timerState });
        break;

      case 'RESUME_TIMER':
        resumeTimer();
        sendResponse({ ok: true, state: timerState });
        break;

      case 'RESET_TIMER':
        resetTimer(settings);
        sendResponse({ ok: true, state: timerState });
        break;

      case 'SKIP_PHASE':
        await handleTimerComplete();
        sendResponse({ ok: true, state: timerState });
        break;

      case 'GET_STATE':
        sendResponse({ state: timerState });
        break;

      case 'TASK_COMPLETE':
        await handleTaskComplete(msg.taskId, msg.taskName, cfg);
        sendResponse({ ok: true });
        break;

      case 'SPEAK':
        await speak(msg.text, cfg);
        sendResponse({ ok: true });
        break;

      case 'TEST_SOUND':
        await playSound('focusComplete', cfg.soundVolume);
        sendResponse({ ok: true });
        break;

      default:
        sendResponse({ ok: false, error: 'Unknown message type' });
    }
  })();
  return true; // async response
});

// ─── Alert System ────────────────────────────────────────────────────
async function triggerAlert({ type, taskName, pomodoroCount, nextMode, settings: cfg }) {
  let title, body, ttsText, alertType, soundName;

  if (type === 'focusComplete') {
    soundName = 'focusComplete';
    title = '🔥 Focus Session Complete!';
    body = pomodoroCount % 4 === 0
      ? `Incredible! ${pomodoroCount} pomodoros done. Time for a long break, warrior.`
      : `Pomodoro #${pomodoroCount} crushed! Take a short break — you've earned it.`;
    ttsText = pomodoroCount % 4 === 0
      ? `Outstanding focus! ${pomodoroCount} pomodoros complete. Take your long break. You have earned it.`
      : `Focus session complete. Pomodoro number ${pomodoroCount} done. Time for a short break.`;
    alertType = 'success';
  } else if (type === 'breakComplete') {
    soundName = 'breakComplete';
    title = '⚡ Break Over — Time to Focus!';
    body = 'Your mind is refreshed. Lock in. One task. Full power.';
    ttsText = 'Break time is over. Get back in the zone. One task, full focus. You can do this.';
    alertType = 'focus';
  } else if (type === 'taskComplete') {
    soundName = 'victory';
    title = '✅ Task Conquered!';
    body = `"${taskName}" — DONE. That's what champions do.`;
    ttsText = `Task complete. ${taskName}. Absolutely crushed it. Well done.`;
    alertType = 'victory';
  }

  // Browser notification
  if (cfg.notificationsEnabled) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title,
      message: body,
      priority: 2,
      requireInteraction: type === 'focusComplete'
    });
  }

  // Inject overlay into active tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_ALERT',
        alertType,
        title,
        body,
        pomodoroCount
      }).catch(() => {}); // tab may not have content script
    }
  } catch (e) {}

  // Chime
  if (cfg.soundEnabled && soundName) {
    await playSound(soundName, cfg.soundVolume);
  }

  // TTS
  if (cfg.ttsEnabled && ttsText) {
    await speak(ttsText, cfg);
  }
}

// ─── Sound (via offscreen document) ──────────────────────────────────
async function ensureOffscreen() {
  // Avoid creating a second offscreen doc.
  if (await chrome.offscreen.hasDocument?.()) return;
  try {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOC,
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Play focus/break/victory completion chimes.'
    });
  } catch (e) {
    // Race: another call may have created it between check and create.
    if (!String(e.message).includes('Only a single offscreen')) {
      console.warn('Offscreen create failed:', e);
    }
  }
}

async function playSound(soundName, volume) {
  try {
    await ensureOffscreen();
    chrome.runtime.sendMessage({
      target: 'offscreen',
      type: 'PLAY_SOUND',
      sound: soundName,
      volume: typeof volume === 'number' ? volume : 0.7
    }).catch(() => {});
  } catch (e) {
    console.warn('playSound error:', e);
  }
}

async function handleTaskComplete(taskId, taskName, cfg) {
  await triggerAlert({ type: 'taskComplete', taskName, settings: cfg });

  // Update stats
  const { stats } = await chrome.storage.local.get('stats');
  const today = new Date().toDateString();
  const updated = {
    ...stats,
    tasksCompleted: (stats?.tasksCompleted || 0) + 1,
    lastActiveDate: today
  };
  await chrome.storage.local.set({ stats: updated });
}

// ─── TTS ─────────────────────────────────────────────────────────────
async function speak(text, cfg) {
  try {
    chrome.tts.speak(text, {
      rate: cfg.ttsRate || 0.95,
      pitch: cfg.ttsPitch || 1.0,
      volume: 1.0,
      voiceName: cfg.ttsVoice || undefined,
      onEvent: () => {}
    });
  } catch (e) {
    console.warn('TTS error:', e);
  }
}

// ─── Stats ───────────────────────────────────────────────────────────
async function updateStats(cfg) {
  const { stats } = await chrome.storage.local.get('stats');
  const today = new Date().toDateString();
  const s = stats || {};
  const lastDate = s.lastActiveDate;
  
  // Streak logic
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = lastDate === yesterday.toDateString();
  const isToday = lastDate === today;
  
  let streak = s.currentStreak || 0;
  if (!isToday && !wasYesterday) streak = 1;
  else if (!isToday) streak += 1;

  const updated = {
    ...s,
    totalPomodoros: (s.totalPomodoros || 0) + 1,
    totalFocusMinutes: (s.totalFocusMinutes || 0) + cfg.focusDuration,
    currentStreak: streak,
    longestStreak: Math.max(s.longestStreak || 0, streak),
    lastActiveDate: today,
    dailyHistory: updateDailyHistory(s.dailyHistory || [], today, cfg.focusDuration)
  };

  await chrome.storage.local.set({ stats: updated });
}

function updateDailyHistory(history, today, minutes) {
  const existing = history.find(d => d.date === today);
  if (existing) {
    existing.pomodoros += 1;
    existing.minutes += minutes;
    return history;
  }
  return [...history.slice(-29), { date: today, pomodoros: 1, minutes }];
}

// ─── Helpers ─────────────────────────────────────────────────────────
async function saveTimerState() {
  await chrome.storage.local.set({ timerState });
}

function broadcastState() {
  chrome.runtime.sendMessage({ type: 'STATE_UPDATE', state: timerState }).catch(() => {});
}
