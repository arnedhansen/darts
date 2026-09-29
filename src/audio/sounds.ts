let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    localStorage.setItem('darts-muted', value ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function loadMuted(): boolean {
  try {
    muted = localStorage.getItem('darts-muted') === '1';
  } catch {
    muted = false;
  }
  return muted;
}

export function isMuted(): boolean {
  return muted;
}

export function resumeAudio() {
  const c = getCtx();
  if (c?.state === 'suspended') void c.resume();
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.08,
  freqEnd?: number,
) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (freqEnd != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), now + duration);
  }
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playTap() {
  tone(420, 0.06, 'triangle', 0.05);
}

export function playConfirm() {
  tone(520, 0.1, 'sine', 0.06);
  setTimeout(() => tone(660, 0.12, 'sine', 0.05), 60);
}

export function playBust() {
  tone(180, 0.22, 'sine', 0.07, 80);
}

export function playWin() {
  const notes = [523, 659, 784, 1046];
  notes.forEach((f, i) => {
    setTimeout(() => tone(f, 0.28, 'sine', 0.07), i * 90);
  });
}
