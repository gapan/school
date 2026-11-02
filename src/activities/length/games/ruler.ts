import { t } from '../../../strings';
import { ROUND_SIZE, randInt, shuffle } from '../../../core/stages';
import { abbr } from '../units';
import { mountTapGame, type TapQuestion } from './tapGame';

const RULER_CM = 10;
const PX_PER_CM = 30;
const PENCIL_COLORS = ['#ff7eb6', '#4c7bf0', '#2fc4b2', '#ff9f5a', '#8a6cf0', '#f2c230'];

// A 10 cm ruler with a pencil lying on it from 0 to `mm` millimetres.
function rulerSvg(mm: number, color: string): string {
  const x0 = 15;
  let ticks = '';
  for (let i = 0; i <= RULER_CM * 10; i++) {
    const x = x0 + (i * PX_PER_CM) / 10;
    const h = i % 10 === 0 ? 18 : i % 5 === 0 ? 12 : 7;
    ticks += `<line x1="${x}" y1="58" x2="${x}" y2="${58 + h}" stroke="#1f3d5c" stroke-width="${i % 10 === 0 ? 1.6 : 0.8}"/>`;
    if (i % 10 === 0) ticks += `<text x="${x}" y="92" text-anchor="middle" font-size="11" fill="#1f3d5c">${i / 10}</text>`;
  }
  const end = x0 + (mm * PX_PER_CM) / 10;
  const tip = Math.min(14, end - x0 - 8);
  return `
<svg class="ruler" viewBox="0 0 330 100" role="img" aria-label="${t.length.ruler.title}">
  <rect x="2" y="56" width="326" height="42" rx="5" fill="#fff3c4" stroke="#e0c46c"/>
  ${ticks}
  <rect x="${x0}" y="30" width="${end - x0 - tip}" height="18" fill="${color}"/>
  <rect x="${x0}" y="30" width="7" height="18" fill="#f5a6b8"/>
  <polygon points="${end - tip},30 ${end},39 ${end - tip},48" fill="#f3d9a4"/>
  <polygon points="${end - 4},37 ${end},39 ${end - 4},41" fill="#333"/>
  <line x1="${x0}" y1="26" x2="${x0}" y2="56" stroke="#1f3d5c" stroke-dasharray="2 2"/>
  <line x1="${end}" y1="26" x2="${end}" y2="56" stroke="#1f3d5c" stroke-dasharray="2 2"/>
</svg>`;
}

function rulerQuestion(): TapQuestion {
  // Whole or half centimetres, so the length can be read off the long and middle ticks.
  const mm = randInt(2, RULER_CM * 2) * 5;
  const wholeCm = mm % 10 === 0;
  const inCm = wholeCm && Math.random() < 0.5;
  const unit = inCm ? 'cm' : 'mm';
  const answer = inCm ? mm / 10 : mm;
  const wrong = inCm ? [answer + 1, answer - 1, answer * 10] : [mm + 10, mm - 10, mm / 10, mm + 5, mm - 5];
  const options = new Set<number>([answer]);
  for (const n of shuffle(wrong)) {
    if (options.size < 4 && Number.isInteger(n) && n > 0) options.add(n);
  }
  const cm = Math.floor(mm / 10);
  const explain = wholeCm ? `${cm} ${abbr('cm')} = ${mm} ${abbr('mm')}` : `${cm} ${abbr('cm')} ${mm % 10} ${abbr('mm')} = ${mm} ${abbr('mm')}`;
  return {
    card: `${rulerSvg(mm, PENCIL_COLORS[randInt(0, PENCIL_COLORS.length - 1)])}<p class="picture-q"><span>?</span> <span class="unit">${abbr(unit)}</span></p>`,
    options: shuffle([...options]).map((n) => ({ label: `${n} ${abbr(unit)}`, value: n })),
    answer,
    explain,
  };
}

export function mountRuler(root: HTMLElement): () => void {
  const questions = Array.from({ length: ROUND_SIZE }, rulerQuestion);
  return mountTapGame(root, { game: 'ruler', title: t.length.ruler.title, prompt: t.length.rulerPrompt, questions });
}
