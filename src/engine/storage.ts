import type { StageId } from './levels';

const KEY = 'multiplication-kingdom:v1';

export interface FactStats {
  right: number;
  wrong: number;
}

interface Progress {
  // Best stars per stage, keyed as "<table>-<stage>".
  stars: Record<string, number>;
  // First-try results per fact, keyed as "<table>x<multiplier>" (for the parent corner).
  facts: Record<string, FactStats>;
  sound: boolean;
  unlockAll: boolean;
}

const defaults = (): Progress => ({ stars: {}, facts: {}, sound: true, unlockAll: false });

let cache: Progress | null = null;

function load(): Progress {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = { ...defaults(), ...(raw ? (JSON.parse(raw) as Partial<Progress>) : {}) };
  } catch {
    cache = defaults();
  }
  return cache;
}

function save(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Storage unavailable (private mode etc.): progress lasts for this visit only.
  }
}

export function getStars(table: number, stage: StageId): number {
  return load().stars[`${table}-${stage}`] ?? 0;
}

export function recordStars(table: number, stage: StageId, stars: number): void {
  const p = load();
  const key = `${table}-${stage}`;
  p.stars[key] = Math.max(p.stars[key] ?? 0, stars);
  save(p);
}

export function totalStars(): number {
  return Object.values(load().stars).reduce((a, b) => a + b, 0);
}

export function recordFact(table: number, mult: number, firstTry: boolean): void {
  const p = load();
  const key = `${table}x${mult}`;
  const f = (p.facts[key] ??= { right: 0, wrong: 0 });
  if (firstTry) f.right++;
  else f.wrong++;
  save(p);
}

export function isSoundOn(): boolean {
  return load().sound;
}

export function setSound(on: boolean): void {
  const p = load();
  p.sound = on;
  save(p);
}

export function getFactStats(table: number, mult: number): FactStats {
  return load().facts[`${table}x${mult}`] ?? { right: 0, wrong: 0 };
}

export function isUnlockAll(): boolean {
  return load().unlockAll;
}

export function setUnlockAll(on: boolean): void {
  const p = load();
  p.unlockAll = on;
  save(p);
}

// Start from scratch: clears stars, stickers and fact stats, keeps the sound setting.
export function resetProgress(): void {
  const p = load();
  cache = { ...defaults(), sound: p.sound };
  save(cache);
}
