import { t } from '../strings';
import { mascot } from './mascot';
import { starsRow } from './widgets';
import { MAX_STARS, STAGES, type StageId } from '../core/stages';

// A level's screen: its picture and the list of its three stages.
export function renderLevel(opts: {
  title: string;
  backHref: string;
  art: string;
  color: string;
  greeting: string;
  stageHref: (stage: StageId) => string;
  isUnlocked: (stage: StageId) => boolean;
  stars: (stage: StageId) => number;
}): string {
  const stages = STAGES.map((s, i) => {
    const unlocked = opts.isUnlocked(s.id);
    const text = t.stages[s.id];
    const inner = `
      <span class="stage-num" style="background:${opts.color}">${i + 1}</span>
      <span class="stage-icon">${s.icon}</span>
      <span class="stage-text">
        <strong>${text.title}</strong>
        <small>${text.subtitle}</small>
      </span>
      ${unlocked ? starsRow(opts.stars(s.id), MAX_STARS) : `<span class="lock">🔒</span>`}`;
    return unlocked
      ? `<a class="stage-card" href="${opts.stageHref(s.id)}">${inner}</a>`
      : `<div class="stage-card stage-card--locked">${inner}</div>`;
  }).join('');

  return `
    <header class="topbar">
      <a class="btn btn--small" href="${opts.backHref}">← ${t.back}</a>
      <h1 class="title">${opts.title}</h1>
    </header>
    <section class="castle-hero">
      <div class="castle-big">${opts.art}</div>
      <div class="hero hero--compact">
        ${mascot('happy', 90)}
        <p class="bubble">${opts.greeting}</p>
      </div>
    </section>
    <section class="stages">${stages}</section>
  `;
}
