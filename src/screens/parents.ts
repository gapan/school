import { MULT } from '../routes';
import { t } from '../strings';
import { TABLE_ORDER } from '../engine/levels';
import { getFactStats, isUnlockAll, resetProgress, setUnlockAll, type FactStats } from '../engine/storage';

const ROWS = [...TABLE_ORDER].sort((a, b) => a - b);
const COLS = Array.from({ length: 10 }, (_, i) => i + 1);

// 3 × 5 and 5 × 3 are the same fact, so combine the stats of both orders.
function combined(a: number, b: number): FactStats {
  const x = getFactStats(a, b);
  if (a === b) return x;
  const y = getFactStats(b, a);
  return { right: x.right + y.right, wrong: x.wrong + y.wrong };
}

function level(f: FactStats): 'none' | 'good' | 'ok' | 'weak' {
  const total = f.right + f.wrong;
  if (!total) return 'none';
  const rate = f.right / total;
  return rate >= 0.8 ? 'good' : rate >= 0.5 ? 'ok' : 'weak';
}

function masteryGrid(): string {
  const head = `<span></span>${COLS.map((c) => `<span class="grid-head">${c}</span>`).join('')}`;
  const rows = ROWS.map((r) => {
    const cells = COLS.map((c) => {
      const f = combined(r, c);
      return `<span class="grid-cell grid-cell--${level(f)}" title="${r} × ${c}: ✓${f.right} ✗${f.wrong}">${r * c}</span>`;
    }).join('');
    return `<span class="grid-head">×${r}</span>${cells}`;
  }).join('');
  const legend = (['good', 'ok', 'weak', 'none'] as const)
    .map((k) => `<span class="legend-item"><span class="grid-cell grid-cell--${k}"></span>${t.legend[k]}</span>`)
    .join('');
  return `<div class="mastery-grid">${head}${rows}</div><div class="legend">${legend}</div>`;
}

function hardestFacts(): string {
  const seen = new Set<string>();
  const facts: { a: number; b: number; f: FactStats }[] = [];
  for (const a of ROWS) {
    for (const b of COLS) {
      const key = [a, b].sort((x, y) => x - y).join('x');
      if (seen.has(key)) continue;
      seen.add(key);
      const f = combined(a, b);
      if (f.wrong > 0) facts.push({ a, b, f });
    }
  }
  facts.sort((x, y) => y.f.wrong / (y.f.right + y.f.wrong) - x.f.wrong / (x.f.right + x.f.wrong) || y.f.wrong - x.f.wrong);
  if (!facts.length) return `<p class="muted">${t.noData}</p>`;
  return `<ol class="hardest">${facts
    .slice(0, 5)
    .map(({ a, b, f }) => `<li><strong>${a} × ${b} = ${a * b}</strong><span>${t.hardestRow(f.wrong, f.right + f.wrong)}</span></li>`)
    .join('')}</ol>`;
}

function dashboard(): string {
  return `
    <section class="panel">
      <h2>${t.masteryTitle}</h2>
      <p class="muted">${t.masteryHint}</p>
      ${masteryGrid()}
    </section>
    <section class="panel">
      <h2>${t.hardest}</h2>
      ${hardestFacts()}
    </section>
    <section class="panel">
      <h2>${t.settings}</h2>
      <label class="setting">
        <span><strong>${t.unlockAll}</strong><small>${t.unlockAllHint}</small></span>
        <input type="checkbox" class="switch" data-setting="unlock-all" ${isUnlockAll() ? 'checked' : ''}>
      </label>
      <div class="setting setting--danger">
        <span><strong>${t.reset}</strong><small>${t.resetHint}</small></span>
        <div class="reset-area">
          <button class="btn btn--danger btn--small" data-action="reset-ask">${t.reset}</button>
        </div>
      </div>
    </section>`;
}

// Mounts the parent corner behind a simple grown-up gate.
export function mountParents(root: HTMLElement): void {
  const a = 12 + Math.floor(Math.random() * 8);
  const b = 3 + Math.floor(Math.random() * 7);

  root.innerHTML = `
    <main class="screen">
      <header class="topbar">
        <a class="btn btn--small" href="${MULT}">← ${t.back}</a>
        <h1 class="title">${t.parentsTitle}</h1>
      </header>
      <div class="parents-body">
        <form class="panel gate">
          <p>${t.gatePrompt}</p>
          <p class="gate-q">${a} × ${b} =</p>
          <input class="gate-input" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" required>
          <button class="btn" type="submit">${t.gateSubmit}</button>
          <p class="gate-error" hidden>${t.gateWrong}</p>
        </form>
      </div>
    </main>`;

  const body = root.querySelector<HTMLElement>('.parents-body')!;
  const form = root.querySelector<HTMLFormElement>('.gate')!;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector<HTMLInputElement>('.gate-input')!;
    if (Number(input.value) === a * b) {
      body.innerHTML = dashboard();
    } else {
      form.querySelector<HTMLElement>('.gate-error')!.hidden = false;
      input.value = '';
    }
  });

  body.addEventListener('change', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.dataset.setting === 'unlock-all') setUnlockAll(el.checked);
  });

  body.addEventListener('click', (e) => {
    const action = (e.target as HTMLElement).closest<HTMLElement>('[data-action]')?.dataset.action;
    const area = body.querySelector<HTMLElement>('.reset-area');
    if (!area) return;
    if (action === 'reset-ask') {
      area.innerHTML = `
        <p class="reset-confirm">${t.resetConfirm}</p>
        <button class="btn btn--danger btn--small" data-action="reset-yes">${t.resetYes}</button>
        <button class="btn btn--alt btn--small" data-action="reset-no">${t.resetNo}</button>`;
    } else if (action === 'reset-no') {
      area.innerHTML = `<button class="btn btn--danger btn--small" data-action="reset-ask">${t.reset}</button>`;
    } else if (action === 'reset-yes') {
      resetProgress();
      body.innerHTML = `<p class="panel reset-done">✅ ${t.resetDone}</p>` + dashboard();
    }
  });
}
