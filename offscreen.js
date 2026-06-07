// FocusFlow Offscreen Audio Player
// Service workers can't play audio. This hidden document does it for them.

const SOUND_FILES = {
  focusComplete: 'sounds/focus-complete.wav',
  breakComplete: 'sounds/break-complete.wav',
  victory: 'sounds/victory.wav'
};

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.target !== 'offscreen' || msg.type !== 'PLAY_SOUND') return;

  const file = SOUND_FILES[msg.sound];
  if (!file) return;

  const audio = new Audio(chrome.runtime.getURL(file));
  audio.volume = typeof msg.volume === 'number' ? msg.volume : 1.0;
  audio.play().catch((e) => console.warn('FocusFlow audio play failed:', e));
});
