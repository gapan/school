import { t } from '../../../strings';
import { mascot } from '../../../ui/mascot';
import { starsRow } from '../../../ui/widgets';
import { soundToggle } from '../../../ui/soundToggle';
import { MAX_STARS, STAGES } from '../../../core/stages';
import { earnedStickers } from '../../../core/stickers';
import { towerArt, towerHeight } from '../art';
import { GRAND_LEVEL, LEN, LEVELS, isGrandUnlocked, isLevelUnlocked, levelStars, progress } from '../levels';
import { STICKERS } from '../stickers';

export function renderLengthHome(): string {
  const towers = LEVELS.map((level, i) => {
    const unlocked = isLevelUnlocked(level.id);
    const text = t.length.levels[level.id];
    const inner = `
      ${towerArt(level.color, towerHeight(i), !unlocked)}
      <span class="castle-name">${text.title}</span>
      ${unlocked ? `<span class="castle-stars">⭐ ${levelStars(level.id)}/${STAGES.length * MAX_STARS}</span>` : `<span class="lock">🔒</span>`}`;
    return unlocked
      ? `<a class="castle-card" href="${LEN}/level/${level.id}">${inner}</a>`
      : `<div class="castle-card castle-card--locked" aria-label="${t.locked}">${inner}</div>`;
  }).join('');

  const grandOpen = isGrandUnlocked();
  const grandInner = `
    ${towerArt(GRAND_LEVEL.color, 72, !grandOpen)}
    <span class="grand-text">
      <strong>${t.length.levels.grand.title}</strong>
      <small>${grandOpen ? t.length.grandSubtitle : t.length.grandLocked}</small>
      ${grandOpen ? starsRow(progress.getStars('grand', 'challenge'), MAX_STARS) : `<span class="lock">🔒</span>`}
    </span>`;
  const grand = grandOpen
    ? `<a class="castle-card castle-card--grand" href="${LEN}/play/grand/challenge">${grandInner}</a>`
    : `<div class="castle-card castle-card--grand castle-card--locked">${grandInner}</div>`;

  return `
    <header class="topbar topbar--home">
      <a class="icon-btn icon-btn--back" href="#/math" aria-label="${t.back}">←</a>
      <h1 class="title">${t.activities.length.title}</h1>
      <div class="star-total" aria-label="${t.totalStars}">⭐ ${progress.totalStars()}</div>
      ${soundToggle()}
    </header>
    <section class="hero">
      ${mascot('happy', 140)}
      <div class="hero-side">
        <p class="bubble">${t.length.greeting}</p>
        <div class="hero-buttons">
          <a class="btn btn--alt album-btn" href="${LEN}/album">📒 ${t.albumButton} · ${earnedStickers(STICKERS, progress.totalStars()).length}/${STICKERS.length}</a>
          <a class="btn btn--games album-btn" href="${LEN}/games">🎮 ${t.gamesButton}</a>
        </div>
      </div>
    </section>
    <section class="map">${towers}${grand}</section>
    <footer class="home-footer"><a class="parents-link" href="${LEN}/parents">👪 ${t.parentsLink}</a></footer>
  `;
}
