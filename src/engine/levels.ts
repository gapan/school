import { getStars, isUnlockAll } from './storage';

export type StageId = 'pick' | 'type' | 'challenge';

export interface StageDef {
  id: StageId;
  icon: string;
  timed: boolean;
}

// Easiest tables first.
export const TABLE_ORDER = [2, 5, 10, 3, 4, 6, 7, 8, 9];

export const STAGES: StageDef[] = [
  { id: 'pick', icon: '🫧', timed: false },
  { id: 'type', icon: '✏️', timed: false },
  { id: 'challenge', icon: '⏱️', timed: true },
];

export const MAX_STARS = 3;

// The final mixed level across every table, stored under this pseudo-table.
export const GRAND = 0;

// Seconds per question in timed stages.
export const TIME_LIMIT = { castle: 10, grand: 8 };

// Each castle has its own color so they are easy to tell apart.
export const CASTLE_COLORS: Record<number, string> = {
  2: '#ff7eb6',
  5: '#9b6dff',
  10: '#3cc8c8',
  3: '#ff9f5a',
  4: '#5bb8ff',
  6: '#7ed36a',
  7: '#f26d8f',
  8: '#b07cff',
  9: '#2fb5a3',
};

export function isCastleUnlocked(table: number): boolean {
  if (isUnlockAll()) return true;
  const i = TABLE_ORDER.indexOf(table);
  if (i <= 0) return i === 0;
  // A castle opens once the "type" stage of the previous one has been passed.
  return getStars(TABLE_ORDER[i - 1], 'type') > 0;
}

export function isGrandUnlocked(): boolean {
  return isUnlockAll() || TABLE_ORDER.every((n) => getStars(n, 'challenge') > 0);
}

export function isStageUnlocked(table: number, stage: StageId): boolean {
  if (table === GRAND) return stage === 'challenge' && isGrandUnlocked();
  if (!isCastleUnlocked(table)) return false;
  if (isUnlockAll()) return true;
  const i = STAGES.findIndex((s) => s.id === stage);
  return i === 0 || getStars(table, STAGES[i - 1].id) > 0;
}

export function castleStars(table: number): number {
  return STAGES.reduce((sum, s) => sum + getStars(table, s.id), 0);
}

// Earlier castles whose "type" stage has been passed; these get mixed into a castle's challenge.
export function passedTablesBefore(table: number): number[] {
  return TABLE_ORDER.slice(0, TABLE_ORDER.indexOf(table)).filter((n) => isUnlockAll() || getStars(n, 'type') > 0);
}
