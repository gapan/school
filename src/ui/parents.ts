import { t } from '../strings';
import type { FactStats, Progress } from '../core/storage';

export type Mastery = 'none' | 'good' | 'ok' | 'weak';

export function mastery(f: FactStats): Mastery {
  const total = f.right + f.wrong;
  if (!total) return 'none';
  const rate = f.right / total;
  return rate >= 0.8 ? 'good' : rate >= 0.5 ? 'ok' : 'weak';
}

export function masteryLegend(): string {
  const items = (['good', 'ok', 'weak', 'none'] as const)
    .map((k) => `<span class="legend-item"><span class="grid-cell grid-cell--${k}"></span>${t.legend[k]}</span>`)
    .join('');
  return `<div class="legend">${items}</div>`;
}

// The (up to) five facts with the highest share of wrong answers.
export function hardestList(facts: { label: string; f: FactStats }[]): string {
  const missed = facts.filter((x) => x.f.wrong > 0);
  const rate = (f: FactStats) => f.wrong / (f.right + f.wrong);
  missed.sort((x, y) => rate(y.f) - rate(x.f) || y.f.wrong - x.f.wrong);
  if (!missed.length) return `<p class="muted">${t.noData}</p>`;
  return `<ol class="hardest">${missed
    .slice(0, 5)
    .map(({ label, f }) => `<li><strong>${label}</strong><span>${t.hardestRow(f.wrong, f.right + f.wrong)}</span></li>`)
    .join('')}</ol>`;
}

export interface ParentsConfig {
  backHref: string;
  progress: Progress;
  // The activity's own statistics panels.
  stats: () => string;
  unlockAll: string;
  unlockAllHint: string;
  resetHint: string;
}

function dashboard(cfg: ParentsConfig): string {
  return `
    ${cfg.stats()}
    <section class="panel">
      <h2>${t.settings}</h2>
      <label class="setting">
        <span><strong>${cfg.unlockAll}</strong><small>${cfg.unlockAllHint}</small></span>
        <input type="checkbox" class="switch" data-setting="unlock-all" ${cfg.progress.isUnlockAll() ? 'checked' : ''}>
      </label>
      <div class="setting setting--danger">
        <span><strong>${t.reset}</strong><small>${cfg.resetHint}</small></span>
        <div class="reset-area">
          <button class="btn btn--danger btn--small" data-action="reset-ask">${t.reset}</button>
        </div>
      </div>
    </section>`;
}

// Mounts an activity's parent corner behind a simple grown-up gate.
export function mountParents(root: HTMLElement, cfg: ParentsConfig): void {
  const a = 12 + Math.floor(Math.random() * 8);
  const b = 3 + Math.floor(Math.random() * 7);

  root.innerHTML = `
    <main class="screen">
      <header class="topbar">
        <a class="btn btn--small" href="${cfg.backHref}">← ${t.back}</a>
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
      body.innerHTML = dashboard(cfg);
    } else {
      form.querySelector<HTMLElement>('.gate-error')!.hidden = false;
      input.value = '';
    }
  });

  body.addEventListener('change', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.dataset.setting === 'unlock-all') cfg.progress.setUnlockAll(el.checked);
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
      cfg.progress.reset();
      body.innerHTML = `<p class="panel reset-done">✅ ${t.resetDone}</p>` + dashboard(cfg);
    }
  });
}
