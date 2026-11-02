import { createProgress } from '../../core/storage';
import { levelRules } from '../../core/stages';

// Every multiplication screen lives under this hash prefix (see catalog.ts).
export const MULT = '#/math/multiplication';

export const progress = createProgress('multiplication-kingdom:v1');

// Easiest tables first.
export const TABLE_ORDER = [2, 5, 10, 3, 4, 6, 7, 8, 9];

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

export const {
  isLevelUnlocked: isCastleUnlocked,
  isGrandUnlocked,
  isStageUnlocked,
  levelStars: castleStars,
  passedBefore: passedTablesBefore,
} = levelRules(progress, TABLE_ORDER, GRAND);
