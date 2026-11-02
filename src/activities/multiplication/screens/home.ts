import { t } from '../../../strings';
import { mascot } from '../../../ui/mascot';
import { starsRow } from '../../../ui/widgets';
import { soundToggle } from '../../../ui/soundToggle';
import { MAX_STARS, STAGES } from '../../../core/stages';
import { earnedStickers } from '../../../core/stickers';
import { castleArt } from '../castleArt';
import { CASTLE_COLORS, GRAND, MULT, TABLE_ORDER, castleStars, isCastleUnlocked, isGrandUnlocked, progress } from '../levels';
import { STICKERS } from '../stickers';

export function renderHome(): string {
  const castles = TABLE_ORDER.map((n) => {
    const unlocked = isCastleUnlocked(n);
    const inner = `
      ${castleArt(CASTLE_COLORS[n], `×${n}`, !unlocked)}
      <span class="castle-name">${t.castle(n)}</span>
      ${unlocked ? `<span class="castle-stars">⭐ ${castleStars(n)}/${STAGES.length * MAX_STARS}</span>` : `<span class="lock">🔒</span>`}`;
    return unlocked
      ? `<a class="castle-card" href="${MULT}/castle/${n}">${inner}</a>`
      : `<div class="castle-card castle-card--locked" aria-label="${t.locked}">${inner}</div>`;
  }).join('');

  const grandOpen = isGrandUnlocked();
  const grandInner = `
    ${castleArt('#ffb800', '👑', !grandOpen)}
    <span class="grand-text">
      <strong>${t.grandChallenge}</strong>
      <small>${grandOpen ? t.grandSubtitle : t.grandLocked}</small>
      ${grandOpen ? starsRow(progress.getStars(GRAND, 'challenge'), MAX_STARS) : `<span class="lock">🔒</span>`}
    </span>`;
  const grand = grandOpen
    ? `<a class="castle-card castle-card--grand" href="${MULT}/play/grand/challenge">${grandInner}</a>`
    : `<div class="castle-card castle-card--grand castle-card--locked">${grandInner}</div>`;

  return `
    <header class="topbar topbar--home">
      <a class="icon-btn icon-btn--back" href="#/math" aria-label="${t.back}">←</a>
      <h1 class="title">${t.appTitle}</h1>
      <div class="star-total" aria-label="${t.totalStars}">⭐ ${progress.totalStars()}</div>
      ${soundToggle()}
    </header>
    <section class="hero">
      ${mascot('happy', 140)}
      <div class="hero-side">
        <p class="bubble">${t.greeting}</p>
        <div class="hero-buttons">
          <a class="btn btn--alt album-btn" href="${MULT}/album">📒 ${t.albumButton} · ${earnedStickers(STICKERS, progress.totalStars()).length}/${STICKERS.length}</a>
          <a class="btn btn--games album-btn" href="${MULT}/games">🎮 ${t.gamesButton}</a>
        </div>
      </div>
    </section>
    <section class="map">${castles}${grand}</section>
    <footer class="home-footer"><a class="parents-link" href="${MULT}/parents">👪 ${t.parentsLink}</a></footer>
  `;
}
