import { isSoundOn } from './storage';

// Sound effects are synthesized with Web Audio, so there are no files to load.
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (!isSoundOn()) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, delay: number, duration: number, type: OscillatorType = 'sine', volume = 0.18): void {
  const ac = audio();
  if (!ac) return;
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sfx = {
  tap: () => tone(700, 0, 0.06, 'triangle', 0.08),
  correct: () => {
    tone(784, 0, 0.15);
    tone(1047, 0.1, 0.25);
    tone(1568, 0.2, 0.2, 'sine', 0.06);
  },
  // Deliberately soft: a mistake should not sound like a punishment.
  wrong: () => {
    tone(330, 0, 0.14, 'triangle', 0.12);
    tone(262, 0.12, 0.2, 'triangle', 0.12);
  },
  star: (i: number) => tone(880 + i * 220, 0, 0.25, 'sine', 0.14),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3)),
  unlock: () => [784, 1047, 1319, 1568].forEach((f, i) => tone(f, i * 0.08, 0.35, 'triangle', 0.12)),
};
