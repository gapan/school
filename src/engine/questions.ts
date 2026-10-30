import { getFactStats } from './storage';

export interface Question {
  table: number;
  mult: number;
  // Factors in the order shown (sometimes swapped, e.g. 4 × 3 for the table of 3).
  a: number;
  b: number;
  answer: number;
}

export const ROUND_SIZE = 10;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// One round covers every multiplier 1–10 exactly once, in random order.
export function makeRound(table: number): Question[] {
  const mults = shuffle(Array.from({ length: ROUND_SIZE }, (_, i) => i + 1));
  return mults.map((mult) => makeQuestion(table, mult));
}

function makeQuestion(table: number, mult: number): Question {
  const swap = Math.random() < 0.5;
  return { table, mult, a: swap ? mult : table, b: swap ? table : mult, answer: table * mult };
}

// A mixed round for timed stages. Roughly half the questions come from the `focus` tables,
// and facts the player has missed before are more likely to come up.
export function makeMixedRound(focus: number[], others: number[]): Question[] {
  const pool: { table: number; mult: number; weight: number }[] = [];
  const boost = Math.max(1, others.length / focus.length);
  for (const table of [...focus, ...others]) {
    for (let mult = 2; mult <= 10; mult++) {
      const { wrong } = getFactStats(table, mult);
      pool.push({ table, mult, weight: (1 + wrong) * (focus.includes(table) ? boost : 1) });
    }
  }

  const picked: Question[] = [];
  while (picked.length < ROUND_SIZE && pool.length) {
    let r = Math.random() * pool.reduce((sum, f) => sum + f.weight, 0);
    const i = pool.findIndex((f) => (r -= f.weight) <= 0);
    const [f] = pool.splice(i < 0 ? pool.length - 1 : i, 1);
    picked.push(makeQuestion(f.table, f.mult));
    // 3 × 5 and 5 × 3 are the same fact, so don't ask both.
    const twin = pool.findIndex((g) => g.table === f.mult && g.mult === f.table);
    if (twin >= 0) pool.splice(twin, 1);
  }
  return picked;
}

// Four answer options: the right one plus three believable mistakes.
export function choicesFor(q: Question): number[] {
  const { table, mult, answer } = q;
  const valid = (n: number) => n > 0 && n !== answer;
  // Neighbouring facts are the most common mix-ups, so prefer those.
  const near = shuffle([table * (mult + 1), table * (mult - 1), (table + 1) * mult, (table - 1) * mult]);
  const far = shuffle([answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10]);

  const picked = new Set<number>();
  for (const n of [...near, ...far]) {
    if (picked.size === 3) break;
    if (valid(n)) picked.add(n);
  }
  for (let n = answer + 3; picked.size < 3; n++) picked.add(n);
  return shuffle([answer, ...picked]);
}

export function starsFor(firstTryCorrect: number): number {
  if (firstTryCorrect >= 9) return 3;
  if (firstTryCorrect >= 7) return 2;
  if (firstTryCorrect >= 5) return 1;
  return 0;
}
