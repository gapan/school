import { t } from '../../strings';
import { randInt, shuffle } from '../../core/stages';
import { SLOT, type RoundQuestion } from '../../core/round';

export type Unit = 'm' | 'dm' | 'cm' | 'mm';

export const UNITS: Unit[] = ['m', 'dm', 'cm', 'mm'];

// Size of each unit in millimetres.
export const MM: Record<Unit, number> = { m: 1000, dm: 100, cm: 10, mm: 1 };

export const abbr = (u: Unit) => t.length.units[u];
export const ratio = (big: Unit, small: Unit) => MM[big] / MM[small];

// Largest amount of the bigger unit in a question, keeping every length within 10 m
// and the numbers friendly for a child.
const MAX_BIG: Record<Unit, number> = { m: 10, dm: 20, cm: 30, mm: 0 };

export interface LengthQuestion extends RoundQuestion {
  // Key for the stats, e.g. "m>cm" or "m+cm>cm".
  factKey: string;
}

const num = (n: number) => `<span>${n}</span>`;
const unit = (u: Unit) => `<span class="unit">${abbr(u)}</span>`;
const eq = '<span class="op">=</span>';

// Four answer options: the right one plus the classic slips (a zero too many or too few, or
// forgetting to convert at all).
function choicesFor(answer: number, traps: number[]): number[] {
  const ok = (n: number) => Number.isInteger(n) && n > 0 && n !== answer && n <= 100000;
  const near = shuffle([answer * 10, answer / 10, answer * 100, answer / 100, ...traps]);
  const far = shuffle([answer + 1, answer - 1, answer + 10, answer - 10, answer + 2]);
  const picked = new Set<number>();
  for (const n of [...shuffle(traps), ...near, ...far]) {
    if (picked.size === 3) break;
    if (ok(n)) picked.add(n);
  }
  for (let n = answer + 3; picked.size < 3; n++) picked.add(n);
  return shuffle([answer, ...picked]);
}

// The unit staircase: each step down is ×10. The steps between the two units light up.
export function stairs(from: Unit, to: Unit): string {
  const [hi, lo] = MM[from] > MM[to] ? [from, to] : [to, from];
  const a = UNITS.indexOf(hi);
  const b = UNITS.indexOf(lo);
  const steps = UNITS.map((u, i) => {
    const on = i >= a && i <= b;
    const arrow = i < UNITS.length - 1 ? `<span class="stair-arrow ${i >= a && i < b ? 'stair-arrow--on' : ''}" style="--step:${i}">×10</span>` : '';
    return `<span class="stair ${on ? 'stair--on' : ''}" style="--step:${i}">${abbr(u)}</span>${arrow}`;
  }).join('');
  return `<div class="stairs">${steps}</div><p class="stairs-caption">1 ${abbr(hi)} = ${ratio(hi, lo)} ${abbr(lo)}</p>`;
}

// "3 μ. = ? εκ." or "300 εκ. = ? μ."
export function simpleQuestion(big: Unit, small: Unit, down = Math.random() < 0.5, b = randInt(1, MAX_BIG[big])): LengthQuestion {
  const r = ratio(big, small);
  const s = b * r;
  const [from, to, value, answer] = down ? [big, small, b, s] : [small, big, s, b];
  return {
    factKey: `${from}>${to}`,
    card: `${num(value)}${unit(from)}${eq}${SLOT}${unit(to)}`,
    answer,
    choices: choicesFor(answer, [value]),
    hint: down ? t.length.hintDown(value, abbr(from), abbr(to), r) : t.length.hintUp(value, abbr(from), abbr(to), r),
    hintVisual: stairs(from, to),
    fact: `${value} ${abbr(from)} = ${answer} ${abbr(to)}`,
  };
}

// Mixed units, e.g. "2 μ. 35 εκ. = ? εκ.", "235 εκ. = ? μ. 35 εκ." or "235 εκ. = 2 μ. ? εκ.".
export function mixedQuestion(big: Unit, small: Unit): LengthQuestion {
  const r = ratio(big, small);
  const b = randInt(1, big === 'cm' ? 20 : 9);
  const s = randInt(1, r - 1);
  const total = b * r + s;
  const B = abbr(big);
  const S = abbr(small);
  const kind = randInt(0, 2);
  const visual = stairs(big, small);

  if (kind === 0) {
    return {
      factKey: `${big}+${small}>${small}`,
      card: `${num(b)}${unit(big)}${num(s)}${unit(small)}${eq}${SLOT}${unit(small)}`,
      answer: total,
      // Common slips: adding the numbers, or putting them side by side with the wrong zeros.
      choices: choicesFor(total, [b + s, b * r * 10 + s, b * 10 + s, Number(`${b}0${s}`)]),
      hint: t.length.hintCombine(b, B, s, S, r),
      hintVisual: visual,
      fact: `${b} ${B} ${s} ${S} = ${total} ${S}`,
    };
  }
  const askBig = kind === 1;
  const answer = askBig ? b : s;
  return {
    factKey: `${small}>${big}+${small}`,
    card: `${num(total)}${unit(small)}${eq}${askBig ? SLOT : num(b)}${unit(big)}${askBig ? num(s) : SLOT}${unit(small)}`,
    answer,
    choices: choicesFor(answer, askBig ? [b * 10, b + 1, total - s] : [total, total - r, s + r]),
    hint: t.length.hintSplit(total, B, S, r, b * r, s),
    hintVisual: visual,
    fact: `${total} ${S} = ${b} ${B} ${s} ${S}`,
  };
}
