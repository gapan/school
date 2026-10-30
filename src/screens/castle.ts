import { MULT } from '../routes';
import { t } from '../strings';
import { mascot } from '../ui/mascot';
import { castleArt, starsRow } from '../ui/castle';
import { CASTLE_COLORS, MAX_STARS, STAGES, isStageUnlocked } from '../engine/levels';
import { getStars } from '../engine/storage';

export function renderCastle(table: number): string {
  const color = CASTLE_COLORS[table];
  const stages = STAGES.map((s, i) => {
    const unlocked = isStageUnlocked(table, s.id);
    const text = t.stages[s.id];
    const inner = `
      <span class="stage-num" style="background:${color}">${i + 1}</span>
      <span class="stage-icon">${s.icon}</span>
      <span class="stage-text">
        <strong>${text.title}</strong>
        <small>${text.subtitle}</small>
      </span>
      ${unlocked ? starsRow(getStars(table, s.id), MAX_STARS) : `<span class="lock">🔒</span>`}`;
    return unlocked
      ? `<a class="stage-card" href="${MULT}/play/${table}/${s.id}">${inner}</a>`
      : `<div class="stage-card stage-card--locked">${inner}</div>`;
  }).join('');

  return `
    <header class="topbar">
      <a class="btn btn--small" href="${MULT}">← ${t.back}</a>
      <h1 class="title">${t.castle(table)}</h1>
    </header>
    <section class="castle-hero">
      <div class="castle-big">${castleArt(color, `×${table}`)}</div>
      <div class="hero hero--compact">
        ${mascot('happy', 90)}
        <p class="bubble">${t.castleGreeting}</p>
      </div>
    </section>
    <section class="stages">${stages}</section>
  `;
}
