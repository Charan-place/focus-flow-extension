// FocusFlow Content Script — On-Page Alert Overlay

(function() {
  'use strict';

  // Prevent double injection
  if (window.__focusFlowInjected) return;
  window.__focusFlowInjected = true;

  // Inject styles
  const style = document.createElement('style');
  style.id = 'focusflow-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap');

    #focusflow-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 2147483647;
      pointer-events: none;
      font-family: 'Space Grotesk', system-ui, sans-serif;
    }

    .ff-alert {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      pointer-events: all;
      min-width: 420px;
      max-width: 520px;
      border-radius: 24px;
      padding: 40px 44px;
      text-align: center;
      animation: ffPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      box-shadow: 0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
    }

    .ff-alert.success {
      background: linear-gradient(135deg, #0f1923 0%, #1a2a1a 100%);
      border: 1px solid rgba(74, 222, 128, 0.3);
    }
    .ff-alert.focus {
      background: linear-gradient(135deg, #0f1923 0%, #1a1a2e 100%);
      border: 1px solid rgba(96, 165, 250, 0.3);
    }
    .ff-alert.victory {
      background: linear-gradient(135deg, #1a1208 0%, #1a0f08 100%);
      border: 1px solid rgba(251, 191, 36, 0.4);
    }

    .ff-alert-icon {
      font-size: 56px;
      display: block;
      margin-bottom: 16px;
      animation: ffBounce 0.6s ease 0.3s both;
    }

    .ff-alert-title {
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }

    .ff-alert.success .ff-alert-title { color: #4ade80; }
    .ff-alert.focus .ff-alert-title { color: #60a5fa; }
    .ff-alert.victory .ff-alert-title { color: #fbbf24; }

    .ff-alert-body {
      font-size: 15px;
      color: rgba(255,255,255,0.7);
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .ff-pomodoro-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 24px;
    }

    .ff-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      transition: all 0.3s;
    }
    .ff-dot.filled { background: #4ade80; box-shadow: 0 0 8px #4ade80; }
    .ff-dot.pulse { animation: ffPulse 1s ease infinite; }

    .ff-close-btn {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      color: white;
      padding: 12px 32px;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      letter-spacing: 0.5px;
      transition: all 0.2s;
      font-family: inherit;
    }
    .ff-close-btn:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-1px);
    }

    .ff-confetti-piece {
      position: fixed;
      width: 10px;
      height: 10px;
      pointer-events: none;
      border-radius: 2px;
      animation: ffFall linear forwards;
    }

    .ff-streak-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(251, 191, 36, 0.15);
      border: 1px solid rgba(251, 191, 36, 0.3);
      color: #fbbf24;
      padding: 6px 14px;
      border-radius: 50px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
    }

    @keyframes ffPop {
      from { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
      to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    @keyframes ffBounce {
      0% { transform: scale(0); }
      60% { transform: scale(1.3); }
      100% { transform: scale(1); }
    }
    @keyframes ffPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
    @keyframes ffFall {
      0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    @keyframes ffFadeOut {
      to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    }

    .ff-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(6px);
      animation: ffFadeIn 0.3s ease forwards;
      pointer-events: all;
    }

    @keyframes ffFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'focusflow-overlay';
  document.body.appendChild(overlay);

  // ─── Alert Renderer ───────────────────────────────────────────────
  function showAlert({ alertType, title, body, pomodoroCount }) {
    // Clear existing
    overlay.innerHTML = '';

    const backdrop = document.createElement('div');
    backdrop.className = 'ff-backdrop';
    overlay.appendChild(backdrop);

    const alert = document.createElement('div');
    alert.className = `ff-alert ${alertType}`;

    const icons = {
      success: '🔥',
      focus: '⚡',
      victory: '🏆'
    };

    let pomoDots = '';
    if (pomodoroCount !== undefined) {
      const filled = pomodoroCount % 4 || 4;
      const dots = Array.from({ length: 4 }, (_, i) =>
        `<div class="ff-dot ${i < filled ? 'filled' : ''} ${i === filled - 1 ? 'pulse' : ''}"></div>`
      ).join('');
      pomoDots = `<div class="ff-pomodoro-dots">${dots}</div>`;
    }

    const streakBadge = alertType === 'victory'
      ? `<div class="ff-streak-badge">🔥 Task Crushed!</div>` : '';

    alert.innerHTML = `
      <span class="ff-alert-icon">${icons[alertType] || '⏰'}</span>
      ${streakBadge}
      <div class="ff-alert-title">${title}</div>
      <div class="ff-alert-body">${body}</div>
      ${pomoDots}
      <button class="ff-close-btn" id="ff-dismiss">Got it →</button>
    `;

    overlay.appendChild(alert);

    // Confetti for victory/success
    if (alertType === 'victory' || alertType === 'success') {
      spawnConfetti();
    }

    // Dismiss
    const dismiss = () => {
      alert.style.animation = 'ffFadeOut 0.3s ease forwards';
      backdrop.style.animation = 'ffFadeIn 0.3s ease reverse forwards';
      setTimeout(() => { overlay.innerHTML = ''; }, 300);
    };

    document.getElementById('ff-dismiss')?.addEventListener('click', dismiss);
    backdrop.addEventListener('click', dismiss);

    // Auto-dismiss after 8 seconds
    setTimeout(dismiss, 8000);
  }

  // ─── Confetti ─────────────────────────────────────────────────────
  function spawnConfetti() {
    const colors = ['#4ade80', '#60a5fa', '#fbbf24', '#f472b6', '#a78bfa', '#fb923c'];
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        const piece = document.createElement('div');
        piece.className = 'ff-confetti-piece';
        piece.style.cssText = `
          left: ${Math.random() * 100}vw;
          top: -20px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          width: ${6 + Math.random() * 8}px;
          height: ${6 + Math.random() * 8}px;
          animation-duration: ${1.5 + Math.random() * 2}s;
          animation-delay: ${Math.random() * 0.5}s;
          border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        `;
        overlay.appendChild(piece);
        setTimeout(() => piece.remove(), 3500);
      }, i * 30);
    }
  }

  // ─── Message Listener ─────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SHOW_ALERT') {
      showAlert(msg);
    }
  });

})();
