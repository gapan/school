import { t } from '../../strings';
import { ROUND_SIZE, shuffle, takeWeighted } from '../../core/stages';
import { SLOT, type RoundQuestion } from '../../core/round';
import { progress } from './levels';

export interface Question extends RoundQuestion {
  table: number;
  mult: number;
  // Factors in the order shown (sometimes swapped, e.g. 4 × 3 for the table of 3).
  a: number;
  b: number;
}

export const factKey = (table: number, mult: number) => `${table}x${mult}`;

// One round covers every multiplier 1–10 exactly once, in random order.
export function makeRound(table: number): Question[] {
  const mults = shuffle(Array.from({ length: ROUND_SIZE }, (_, i) => i + 1));
  return mults.map((mult) => makeQuestion(table, mult));
}

function makeQuestion(table: number, mult: number): Question {
  const swap = Math.random() < 0.5;
  const a = swap ? mult : table;
  const b = swap ? table : mult;
  const answer = table * mult;
  return {
    table,
    mult,
    a,
    b,
    answer,
    card: `<span>${a}</span><span class="op">×</span><span>${b}</span><span class="op">=</span>${SLOT}`,
    choices: choicesFor(table, mult, answer),
    hint: a === 1 || b === 1 ? t.hintOne : t.hint(a, b),
    fact: `${a} × ${b} = ${answer}`,
  };
}

// A mixed round for timed stages. Roughly half the questions come from the `focus` tables,
// and facts the player has missed before are more likely to come up.
export function makeMixedRound(focus: number[], others: number[]): Question[] {
  const pool: { table: number; mult: number; weight: number }[] = [];
  const boost = Math.max(1, others.length / focus.length);
  for (const table of [...focus, ...others]) {
    for (let mult = 2; mult <= 10; mult++) {
      const { wrong } = progress.getFact(factKey(table, mult));
      pool.push({ table, mult, weight: (1 + wrong) * (focus.includes(table) ? boost : 1) });
    }
  }

  const picked: Question[] = [];
  while (picked.length < ROUND_SIZE && pool.length) {
    const f = takeWeighted(pool);
    picked.push(makeQuestion(f.table, f.mult));
    // 3 × 5 and 5 × 3 are the same fact, so don't ask both.
    const twin = pool.findIndex((g) => g.table === f.mult && g.mult === f.table);
    if (twin >= 0) pool.splice(twin, 1);
  }
  return picked;
}

// Four answer options: the right one plus three believable mistakes.
function choicesFor(table: number, mult: number, answer: number): number[] {
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
