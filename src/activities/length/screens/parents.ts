import { t } from '../../../strings';
import { hardestList, mastery, masteryLegend, mountParents } from '../../../ui/parents';
import type { FactStats } from '../../../core/storage';
import { LEN, MIXED_PAIRS, progress } from '../levels';
import { UNITS, abbr } from '../units';

const percent = (f: FactStats) => (f.right + f.wrong ? `${Math.round((100 * f.right) / (f.right + f.wrong))}%` : '–');

// Rows: from which unit; columns: to which unit.
function conversionGrid(): string {
  const head = `<span></span>${UNITS.map((u) => `<span class="grid-head">${abbr(u)}</span>`).join('')}`;
  const rows = UNITS.map((from) => {
    const cells = UNITS.map((to) => {
      if (from === to) return '<span></span>';
      const f = progress.getFact(`${from}>${to}`);
      return `<span class="grid-cell grid-cell--${mastery(f)}" title="${abbr(from)} → ${abbr(to)}: ✓${f.right} ✗${f.wrong}">${percent(f)}</span>`;
    }).join('');
    return `<span class="grid-head">${abbr(from)}</span>${cells}`;
  }).join('');
  return `<div class="mastery-grid mastery-grid--units">${head}${rows}</div>`;
}

// Each mixed pair in both directions, e.g. "μ. εκ. → εκ." and "εκ. → μ. εκ.".
function mixedFacts(): { label: string; key: string }[] {
  return MIXED_PAIRS.flatMap(([big, small]) => {
    const both = `${abbr(big)} ${abbr(small)}`;
    return [
      { label: `${both} → ${abbr(small)}`, key: `${big}+${small}>${small}` },
      { label: `${abbr(small)} → ${both}`, key: `${small}>${big}+${small}` },
    ];
  });
}

function mixedList(): string {
  return `<ul class="mixed-stats">${mixedFacts()
    .map(({ label, key }) => {
      const f = progress.getFact(key);
      return `<li><span>${label}</span><span class="grid-cell grid-cell--${mastery(f)}">${percent(f)}</span></li>`;
    })
    .join('')}</ul>`;
}

function hardest(): string {
  const simple = UNITS.flatMap((from) =>
    UNITS.filter((to) => to !== from).map((to) => ({ label: `${abbr(from)} → ${abbr(to)}`, f: progress.getFact(`${from}>${to}`) })),
  );
  const mixed = mixedFacts().map(({ label, key }) => ({ label, f: progress.getFact(key) }));
  return hardestList([...simple, ...mixed]);
}

export function mountLengthParents(root: HTMLElement): void {
  mountParents(root, {
    backHref: LEN,
    progress,
    unlockAll: t.length.unlockAll,
    unlockAllHint: t.length.unlockAllHint,
    resetHint: t.length.resetHint,
    stats: () => `
      <section class="panel">
        <h2>${t.length.masteryTitle}</h2>
        <p class="muted">${t.length.masteryHint}</p>
        ${conversionGrid()}
        <h3>${t.length.mixedTitle}</h3>
        ${mixedList()}
        ${masteryLegend()}
      </section>
      <section class="panel">
        <h2>${t.hardest}</h2>
        ${hardest()}
      </section>`,
  });
}
