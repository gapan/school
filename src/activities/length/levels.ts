import { createProgress } from '../../core/storage';
import { levelRules } from '../../core/stages';
import type { Unit } from './units';

// Every length screen lives under this hash prefix (see catalog.ts).
export const LEN = '#/math/length';

export const progress = createProgress('school:length:v1');

export type LevelId = 'm-cm' | 'cm-mm' | 'dm' | 'mm' | 'all' | 'mixed' | 'grand';

export interface LevelDef {
  id: LevelId;
  // Unit pairs (bigger unit first) this level converts between.
  pairs: [Unit, Unit][];
  // Mixed-unit questions such as "2 μ. 35 εκ. = ? εκ.".
  mixed?: boolean;
  color: string;
}

const ALL_PAIRS: [Unit, Unit][] = [
  ['m', 'dm'],
  ['m', 'cm'],
  ['m', 'mm'],
  ['dm', 'cm'],
  ['dm', 'mm'],
  ['cm', 'mm'],
];

// Mixed units only combine neighbours that children meet in school.
export const MIXED_PAIRS: [Unit, Unit][] = [
  ['m', 'cm'],
  ['m', 'dm'],
  ['dm', 'cm'],
  ['cm', 'mm'],
];

// Easiest first: metres and centimetres are the units children know best.
export const LEVELS: LevelDef[] = [
  { id: 'm-cm', pairs: [['m', 'cm']], color: '#22a6e0' },
  { id: 'cm-mm', pairs: [['cm', 'mm']], color: '#4c7bf0' },
  { id: 'dm', pairs: [['dm', 'cm'], ['m', 'dm']], color: '#2fc4b2' },
  { id: 'mm', pairs: [['m', 'mm'], ['dm', 'mm']], color: '#8a6cf0' },
  { id: 'all', pairs: ALL_PAIRS, color: '#ff9f5a' },
  { id: 'mixed', pairs: [], mixed: true, color: '#f26d8f' },
];

export const GRAND_LEVEL: LevelDef = { id: 'grand', pairs: ALL_PAIRS, mixed: true, color: '#ffb800' };

export const LEVEL_ORDER = LEVELS.map((l) => l.id);
export const levelById = (id: string | undefined) => [...LEVELS, GRAND_LEVEL].find((l) => l.id === id);

// Seconds per question in timed stages (conversions take longer than times tables).
export const TIME_LIMIT = { level: 15, grand: 12 };

export const { isLevelUnlocked, isGrandUnlocked, isStageUnlocked, levelStars, passedBefore } = levelRules(
  progress,
  LEVEL_ORDER,
  'grand',
);
