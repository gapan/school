import { t } from '../../../strings';
import { hardestList, mastery, masteryLegend, mountParents } from '../../../ui/parents';
import type { FactStats } from '../../../core/storage';
import { MULT, TABLE_ORDER, progress } from '../levels';
import { factKey } from '../questions';

const ROWS = [...TABLE_ORDER].sort((a, b) => a - b);
const COLS = Array.from({ length: 10 }, (_, i) => i + 1);

// 3 × 5 and 5 × 3 are the same fact, so combine the stats of both orders.
function combined(a: number, b: number): FactStats {
  const x = progress.getFact(factKey(a, b));
  if (a === b) return x;
  const y = progress.getFact(factKey(b, a));
  return { right: x.right + y.right, wrong: x.wrong + y.wrong };
}

function masteryGrid(): string {
  const head = `<span></span>${COLS.map((c) => `<span class="grid-head">${c}</span>`).join('')}`;
  const rows = ROWS.map((r) => {
    const cells = COLS.map((c) => {
      const f = combined(r, c);
      return `<span class="grid-cell grid-cell--${mastery(f)}" title="${r} × ${c}: ✓${f.right} ✗${f.wrong}">${r * c}</span>`;
    }).join('');
    return `<span class="grid-head">×${r}</span>${cells}`;
  }).join('');
  return `<div class="mastery-grid">${head}${rows}</div>${masteryLegend()}`;
}

function hardestFacts(): string {
  const seen = new Set<string>();
  const facts: { label: string; f: FactStats }[] = [];
  for (const a of ROWS) {
    for (const b of COLS) {
      const key = [a, b].sort((x, y) => x - y).join('x');
      if (seen.has(key)) continue;
      seen.add(key);
      facts.push({ label: `${a} × ${b} = ${a * b}`, f: combined(a, b) });
    }
  }
  return hardestList(facts);
}

export function mountMultiplicationParents(root: HTMLElement): void {
  mountParents(root, {
    backHref: MULT,
    progress,
    unlockAll: t.unlockAll,
    unlockAllHint: t.unlockAllHint,
    resetHint: t.resetHint,
    stats: () => `
      <section class="panel">
        <h2>${t.masteryTitle}</h2>
        <p class="muted">${t.masteryHint}</p>
        ${masteryGrid()}
      </section>
      <section class="panel">
        <h2>${t.hardest}</h2>
        ${hardestFacts()}
      </section>`,
  });
}
