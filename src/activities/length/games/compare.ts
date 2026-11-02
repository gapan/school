import { t } from '../../../strings';
import { ROUND_SIZE, randInt, shuffle } from '../../../core/stages';
import { MM, abbr, ratio, type Unit } from '../units';
import { mountTapGame, type TapQuestion } from './tapGame';

const PAIRS: [Unit, Unit][] = [
  ['m', 'cm'],
  ['m', 'dm'],
  ['dm', 'cm'],
  ['cm', 'mm'],
  ['dm', 'mm'],
];
const MAX_BIG: Record<Unit, number> = { m: 9, dm: 20, cm: 30, mm: 0 };

// Answers: which side is longer, or both the same.
const LEFT = 0;
const EQUAL = 1;
const RIGHT = 2;

function compareQuestion(): TapQuestion {
  const [big, small] = PAIRS[randInt(0, PAIRS.length - 1)];
  const r = ratio(big, small);
  const b = randInt(1, MAX_BIG[big]);
  // Close calls, plus the trap where the bigger number is the shorter length (3 μ. and 30 εκ.).
  const offsets = [0, 0, r, -r, r / 10 >= 1 ? -(r / 10) * b * 9 : -1, 1];
  let s = b * r + offsets[randInt(0, offsets.length - 1)];
  if (s <= 0) s = b * r;
  const sides = shuffle<[number, Unit]>([
    [b, big],
    [s, small],
  ]);
  const [lv, lu] = sides[0];
  const [rv, ru] = sides[1];
  const left = lv * MM[lu];
  const right = rv * MM[ru];
  const answer = left === right ? EQUAL : left > right ? LEFT : RIGHT;
  const box = (v: number, u: Unit) => `<span class="length-box">${v} <span class="unit">${abbr(u)}</span></span>`;
  return {
    card: `<div class="compare">${box(lv, lu)}<span class="op">?</span>${box(rv, ru)}</div>`,
    options: [
      { label: `${lv} ${abbr(lu)}`, value: LEFT },
      { label: t.length.equal, value: EQUAL },
      { label: `${rv} ${abbr(ru)}`, value: RIGHT },
    ],
    answer,
    explain: `${b} ${abbr(big)} = ${b * r} ${abbr(small)}`,
  };
}

export function mountCompare(root: HTMLElement): () => void {
  const questions = Array.from({ length: ROUND_SIZE }, compareQuestion);
  return mountTapGame(root, { game: 'compare', title: t.length.compare.title, prompt: t.length.comparePrompt, questions });
}
