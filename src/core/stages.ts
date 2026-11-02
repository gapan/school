import type { Progress } from './storage';

// Every level of an activity has the same three stages.
export type StageId = 'pick' | 'type' | 'challenge';

export interface StageDef {
  id: StageId;
  icon: string;
  timed: boolean;
}

export const STAGES: StageDef[] = [
  { id: 'pick', icon: '🫧', timed: false },
  { id: 'type', icon: '✏️', timed: false },
  { id: 'challenge', icon: '⏱️', timed: true },
];

export const isStageId = (id: string | undefined): id is StageId => STAGES.some((s) => s.id === id);

export const MAX_STARS = 3;
export const ROUND_SIZE = 10;

export function starsFor(firstTryCorrect: number): number {
  if (firstTryCorrect >= 9) return 3;
  if (firstTryCorrect >= 7) return 2;
  if (firstTryCorrect >= 5) return 1;
  return 0;
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

// Removes and returns a random item, favouring items with a higher weight.
export function takeWeighted<T extends { weight: number }>(pool: T[]): T {
  let r = Math.random() * pool.reduce((sum, f) => sum + f.weight, 0);
  const i = pool.findIndex((f) => (r -= f.weight) <= 0);
  return pool.splice(i < 0 ? pool.length - 1 : i, 1)[0];
}

// Unlock rules shared by the activities: levels open in order, each once the previous level's
// "type" stage is passed; the grand challenge opens once every level's challenge is passed.
export function levelRules<L extends string | number>(progress: Progress, order: L[], grand: L) {
  const isLevelUnlocked = (level: L): boolean => {
    if (progress.isUnlockAll()) return true;
    const i = order.indexOf(level);
    if (i <= 0) return i === 0;
    return progress.getStars(order[i - 1], 'type') > 0;
  };
  const isGrandUnlocked = () => progress.isUnlockAll() || order.every((l) => progress.getStars(l, 'challenge') > 0);
  return {
    isLevelUnlocked,
    isGrandUnlocked,
    isStageUnlocked(level: L, stage: StageId): boolean {
      if (level === grand) return stage === 'challenge' && isGrandUnlocked();
      if (!isLevelUnlocked(level)) return false;
      if (progress.isUnlockAll()) return true;
      const i = STAGES.findIndex((s) => s.id === stage);
      return i === 0 || progress.getStars(level, STAGES[i - 1].id) > 0;
    },
    levelStars: (level: L) => STAGES.reduce((sum, s) => sum + progress.getStars(level, s.id), 0),
    // Earlier levels whose "type" stage has been passed; these get mixed into a level's challenge.
    passedBefore: (level: L) =>
      order.slice(0, order.indexOf(level)).filter((l) => progress.isUnlockAll() || progress.getStars(l, 'type') > 0),
  };
}
