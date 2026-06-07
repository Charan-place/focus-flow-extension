// FocusFlow Popup JS — Full Application Controller

const CIRCUMFERENCE = 2 * Math.PI * 96; // matches SVG r=96

// ─── State ──────────────────────────────────────────────────────────
let timerState = {
  running: false,
  mode: 'focus',
  secondsLeft: 25 * 60,
  totalSeconds: 25 * 60,
  pomodoroCount: 0,
  activeTaskId: null
};

let tasks = [];
let settings = {};
let stats = {};

// ─── DOM Refs ────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const timerDisplay = $('timerDisplay');
const timerModeLabel = $('timerModeLabel');
const ringProgress = $('ringProgress');
const startPauseBtn = $('startPauseBtn');
const startPauseBtnIcon = $('startPauseBtnIcon');
const startPauseBtnLabel = $('startPauseBtnLabel');
const resetBtn = $('resetBtn');
const skipBtn = $('skipBtn');
const taskInput = $('taskInput');
const addTaskBtn = $('addTaskBtn');
const taskList = $('taskList');
const emptyState = $('emptyState');
const activeTaskBanner = $('activeTaskBanner');
const activeTaskName = $('activeTaskName');
const pomoDots = $('pomoDots');

// ─── Init ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadAll();
  renderAll();
  setupListeners();
  startStatePolling();
});

async function loadAll() {
  const data = await chrome.storage.local.get(['timerState', 'tasks', 'settings', 'stats']);
  if (data.timerState) timerState = data.timerState;
  if (data.tasks) tasks = data.tasks;
  if (data.settings) settings = { ...getDefaultSettings(), ...data.settings };
  else settings = getDefaultSettings();
  if (data.stats) stats = data.stats;
}

function getDefaultSettings() {
  return {
    focusDuration: 25, shortBreak: 5, longBreak: 15, longBreakAfter: 4,
    ttsEnabled: true, ttsRate: 0.95, ttsPitch: 1.0,
    notificationsEnabled: true, soundEnabled: true, soundVolume: 0.7,
    autoStartBreaks: false, autoStartFocus: false
  };
}

function renderAll() {
  renderTimer();
  renderTasks();
  renderPomoDots();
  renderActiveTask();
}

// ─── Timer Rendering ─────────────────────────────────────────────────
function renderTimer() {
  const { secondsLeft, totalSeconds, mode, running } = timerState;
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  timerDisplay.textContent = `${mins}:${secs}`;

  const modeLabels = { focus: 'FOCUS', shortBreak: 'SHORT BREAK', longBreak: 'LONG BREAK' };
  timerModeLabel.textContent = modeLabels[mode] || 'FOCUS';

  // Ring progress
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1;
  const offset = CIRCUMFERENCE * (1 - progress);
  ringProgress.style.strokeDashoffset = offset;

  // Ring color
  ringProgress.className = 'ring-progress';
  if (mode === 'shortBreak') ringProgress.classList.add('break-mode');
  if (mode === 'longBreak') ringProgress.classList.add('long-break-mode');

  // Start/Pause button
  if (running) {
    startPauseBtnIcon.textContent = '⏸';
    startPauseBtnLabel.textContent = 'PAUSE';
    startPauseBtn.classList.add('paused');
  } else {
    startPauseBtnIcon.textContent = '▶';
    startPauseBtnLabel.textContent = secondsLeft < totalSeconds ? 'RESUME' : 'START';
    startPauseBtn.classList.remove('paused');
  }

  // Mode pills
  document.querySelectorAll('.mode-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.mode === mode);
  });

  // Document title
  document.title = running ? `${mins}:${secs} — FocusFlow` : 'FocusFlow';
}

function renderPomoDots() {
  const count = timerState.pomodoroCount % 4;
  document.querySelectorAll('.pomo-dot').forEach((dot, i) => {
    dot.classList.remove('filled', 'current');
    if (i < count) dot.classList.add('filled');
    else if (i === count && timerState.running && timerState.mode === 'focus') {
      dot.classList.add('current');
    }
  });
}

// ─── Active Task Rendering ────────────────────────────────────────────
function renderActiveTask() {
  const active = tasks.find(t => t.id === timerState.activeTaskId && !t.completed);
  if (active) {
    activeTaskBanner.classList.remove('idle');
    activeTaskName.textContent = active.text;
  } else {
    activeTaskBanner.classList.add('idle');
    activeTaskName.textContent = 'No active task — pick one below';
    if (timerState.activeTaskId) {
      // Task was completed or removed, clear it
      timerState.activeTaskId = null;
    }
  }
}

// ─── Task Rendering ──────────────────────────────────────────────────
function renderTasks() {
  const pending = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);
  const ordered = [...pending, ...done];

  if (ordered.length === 0) {
    emptyState.classList.add('visible');
    taskList.innerHTML = '';
    return;
  }

  emptyState.classList.remove('visible');
  taskList.innerHTML = '';

  ordered.forEach(task => {
    const isActive = task.id === timerState.activeTaskId;
    const div = document.createElement('div');
    div.className = `task-item${task.completed ? ' completed' : ''}${isActive ? ' active-task' : ''}`;
    div.dataset.id = task.id;

    div.innerHTML = `
      <button class="task-check" data-id="${task.id}" title="Complete">
        ${task.completed ? '✓' : ''}
      </button>
      <span class="task-text">${escapeHtml(task.text)}</span>
      ${!task.completed ? `
        <button class="task-focus-btn" data-id="${task.id}">
          ${isActive ? '◎ Active' : '▶ Focus'}
        </button>
      ` : ''}
      <button class="task-delete-btn" data-id="${task.id}" title="Delete">✕</button>
    `;

    taskList.appendChild(div);
  });
}

// ─── Event Listeners ─────────────────────────────────────────────────
function setupListeners() {
  // Timer controls
  startPauseBtn.addEventListener('click', handleStartPause);
  resetBtn.addEventListener('click', handleReset);
  skipBtn.addEventListener('click', handleSkip);

  // Mode pills
  document.querySelectorAll('.mode-pill').forEach(pill => {
    pill.addEventListener('click', () => switchMode(pill.dataset.mode));
  });

  // Add task
  addTaskBtn.addEventListener('click', handleAddTask);
  taskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAddTask();
  });

  // Task list (delegated)
  taskList.addEventListener('click', e => {
    const id = e.target.closest('[data-id]')?.dataset.id;
    if (!id) return;

    if (e.target.classList.contains('task-check')) handleComplete(id);
    else if (e.target.classList.contains('task-focus-btn')) handleSetActive(id);
    else if (e.target.classList.contains('task-delete-btn')) handleDelete(id);
  });

  // Nav
  $('statsBtn').addEventListener('click', () => { showView('statsView'); renderStats(); });
  $('settingsBtn').addEventListener('click', () => { showView('settingsView'); renderSettings(); });
  $('statsBack').addEventListener('click', () => showView('mainView'));
  $('settingsBack').addEventListener('click', () => showView('mainView'));

  // Settings controls
  document.querySelectorAll('.num-btn').forEach(btn => {
    btn.addEventListener('click', () => adjustSetting(btn.dataset.key, btn.dataset.action));
  });
  ['ttsEnabled', 'notificationsEnabled', 'soundEnabled', 'autoStartBreaks', 'autoStartFocus'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('change', () => {
      settings[id] = el.checked;
      saveSettings();
      // Preview the chime when the user turns sound on.
      if (id === 'soundEnabled' && el.checked) {
        sendMsg({ type: 'TEST_SOUND' });
      }
    });
  });
  const ttsRate = $('ttsRate');
  if (ttsRate) ttsRate.addEventListener('input', () => {
    settings.ttsRate = parseFloat(ttsRate.value);
    saveSettings();
  });
  const soundVolume = $('soundVolume');
  if (soundVolume) {
    soundVolume.addEventListener('input', () => {
      settings.soundVolume = parseFloat(soundVolume.value);
      saveSettings();
    });
    // Play a preview on release so the user hears the chosen level.
    soundVolume.addEventListener('change', () => {
      if (settings.soundEnabled) sendMsg({ type: 'TEST_SOUND' });
    });
  }

  $('resetStatsBtn').addEventListener('click', handleResetStats);

  // Listen for SW state updates
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'STATE_UPDATE') {
      timerState = msg.state;
      renderTimer();
      renderPomoDots();
      renderActiveTask();
    }
  });
}

// ─── Timer Actions ────────────────────────────────────────────────────
async function handleStartPause() {
  if (timerState.running) {
    const res = await sendMsg({ type: 'PAUSE_TIMER' });
    if (res?.state) timerState = res.state;
  } else {
    // Check if we need an active task for focus mode
    if (timerState.mode === 'focus' && !timerState.activeTaskId) {
      const pendingTask = tasks.find(t => !t.completed);
      if (pendingTask) {
        timerState.activeTaskId = pendingTask.id;
      }
    }
    const res = await sendMsg({
      type: timerState.secondsLeft < timerState.totalSeconds ? 'RESUME_TIMER' : 'START_TIMER',
      mode: timerState.mode,
      duration: getDuration(timerState.mode),
      taskId: timerState.activeTaskId
    });
    if (res?.state) timerState = res.state;
  }
  renderAll();
}

async function handleReset() {
  const res = await sendMsg({ type: 'RESET_TIMER' });
  if (res?.state) timerState = res.state;
  renderAll();
}

async function handleSkip() {
  const res = await sendMsg({ type: 'SKIP_PHASE' });
  if (res?.state) timerState = res.state;
  renderAll();
}

async function switchMode(mode) {
  if (timerState.running) {
    await sendMsg({ type: 'PAUSE_TIMER' });
  }
  const duration = getDuration(mode);
  timerState = {
    ...timerState,
    running: false,
    mode,
    secondsLeft: duration * 60,
    totalSeconds: duration * 60
  };
  await chrome.storage.local.set({ timerState });
  renderAll();
}

function getDuration(mode) {
  const map = {
    focus: settings.focusDuration || 25,
    shortBreak: settings.shortBreak || 5,
    longBreak: settings.longBreak || 15
  };
  return map[mode] || 25;
}

// ─── Task Actions ─────────────────────────────────────────────────────
async function handleAddTask() {
  const text = taskInput.value.trim();
  if (!text) { taskInput.focus(); return; }

  const task = {
    id: `task_${Date.now()}`,
    text,
    completed: false,
    createdAt: Date.now(),
    pomodorosSpent: 0
  };

  tasks.unshift(task);
  taskInput.value = '';
  await saveTasks();
  renderTasks();
  renderActiveTask();

  // Auto-set as active if none active
  if (!timerState.activeTaskId) {
    await handleSetActive(task.id);
  }
}

async function handleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const item = document.querySelector(`.task-item[data-id="${id}"]`);
  if (item) item.classList.add('completing');

  if (!task.completed) {
    task.completed = true;
    task.completedAt = Date.now();

    // If this was the active task, clear it
    if (timerState.activeTaskId === id) {
      timerState.activeTaskId = null;

      // Notify SW to trigger dopamine alert + TTS
      await sendMsg({ type: 'TASK_COMPLETE', taskId: id, taskName: task.text });

      // Auto-select next task
      const nextTask = tasks.find(t => !t.completed);
      if (nextTask) {
        setTimeout(() => handleSetActive(nextTask.id), 800);
      }
    }
  }

  await saveTasks();
  setTimeout(() => { renderTasks(); renderActiveTask(); }, 400);
}

async function handleSetActive(id) {
  const task = tasks.find(t => t.id === id && !t.completed);
  if (!task) return;

  timerState.activeTaskId = id;
  await chrome.storage.local.set({ timerState });

  // If timer was running, keep it; just update task reference
  if (timerState.running) {
    await sendMsg({ type: 'START_TIMER', mode: timerState.mode, duration: getDuration(timerState.mode), taskId: id });
  }

  // TTS feedback
  if (settings.ttsEnabled) {
    await sendMsg({ type: 'SPEAK', text: `Locked in on: ${task.text}. Let's go.` });
  }

  renderAll();
}

async function handleDelete(id) {
  tasks = tasks.filter(t => t.id !== id);
  if (timerState.activeTaskId === id) {
    timerState.activeTaskId = null;
    await chrome.storage.local.set({ timerState });
  }
  await saveTasks();
  renderTasks();
  renderActiveTask();
}

// ─── Stats ────────────────────────────────────────────────────────────
function renderStats() {
  const s = stats || {};
  $('statPomodoros').textContent = s.totalPomodoros || 0;
  $('statMinutes').textContent = s.totalFocusMinutes || 0;
  $('statStreak').textContent = s.currentStreak || 0;
  $('statTasks').textContent = s.tasksCompleted || 0;
  $('longestStreak').textContent = `${s.longestStreak || 0} days`;
  renderBarChart(s.dailyHistory || []);
}

function renderBarChart(history) {
  const chart = $('barChart');
  chart.innerHTML = '';

  const days = getLast7Days();
  const max = Math.max(...days.map(d => d.pomodoros), 1);

  days.forEach((day, i) => {
    const heightPct = Math.round((day.pomodoros / max) * 100);
    const isToday = i === days.length - 1;
    const item = document.createElement('div');
    item.className = 'bar-item';
    item.innerHTML = `
      <div class="bar-fill ${isToday ? 'today' : ''}" style="height:${heightPct}%"></div>
      <div class="bar-label">${day.label}</div>
    `;
    chart.appendChild(item);
  });
}

function getLast7Days() {
  const history = stats?.dailyHistory || [];
  const result = [];
  const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const found = history.find(h => h.date === dateStr);
    result.push({
      label: i === 0 ? 'Today' : days[d.getDay()],
      pomodoros: found?.pomodoros || 0,
      minutes: found?.minutes || 0
    });
  }
  return result;
}

async function handleResetStats() {
  if (!confirm('Reset all stats? This cannot be undone.')) return;
  stats = {
    totalPomodoros: 0, totalFocusMinutes: 0, tasksCompleted: 0,
    currentStreak: 0, longestStreak: 0, lastActiveDate: null, dailyHistory: []
  };
  await chrome.storage.local.set({ stats });
  renderStats();
}

// ─── Settings ─────────────────────────────────────────────────────────
function renderSettings() {
  const numKeys = ['focusDuration', 'shortBreak', 'longBreak', 'longBreakAfter'];
  numKeys.forEach(key => {
    const el = $(key);
    if (el) el.textContent = settings[key] || getDefaultSettings()[key];
  });

  const boolKeys = ['ttsEnabled', 'notificationsEnabled', 'soundEnabled', 'autoStartBreaks', 'autoStartFocus'];
  boolKeys.forEach(key => {
    const el = $(key);
    if (el) el.checked = settings[key] ?? getDefaultSettings()[key];
  });

  const ttsRate = $('ttsRate');
  if (ttsRate) ttsRate.value = settings.ttsRate || 0.95;

  const soundVolume = $('soundVolume');
  if (soundVolume) soundVolume.value = settings.soundVolume ?? 0.7;
}

function adjustSetting(key, action) {
  const limits = {
    focusDuration: [1, 90], shortBreak: [1, 30],
    longBreak: [5, 60], longBreakAfter: [2, 8]
  };
  const [min, max] = limits[key] || [1, 99];
  const current = settings[key] || getDefaultSettings()[key];
  const next = action === 'inc' ? Math.min(current + 1, max) : Math.max(current - 1, min);
  settings[key] = next;
  const el = $(key);
  if (el) el.textContent = next;
  saveSettings();
}

async function saveSettings() {
  await chrome.storage.local.set({ settings });
}

// ─── Persistence ──────────────────────────────────────────────────────
async function saveTasks() {
  await chrome.storage.local.set({ tasks });
}

// ─── Polling (fallback sync if message missed) ────────────────────────
function startStatePolling() {
  setInterval(async () => {
    const res = await sendMsg({ type: 'GET_STATE' });
    if (res?.state) {
      timerState = res.state;
      renderTimer();
      renderPomoDots();
      renderActiveTask();
    }
    // Also refresh stats in case SW updated them
    const data = await chrome.storage.local.get(['stats', 'tasks']);
    if (data.stats) stats = data.stats;
    if (data.tasks) {
      tasks = data.tasks;
    }
  }, 1000);
}

// ─── Utilities ────────────────────────────────────────────────────────
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $(viewId).classList.add('active');
}

async function sendMsg(msg) {
  try {
    return await chrome.runtime.sendMessage(msg);
  } catch (e) {
    return null;
  }
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}
