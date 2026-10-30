import { t } from '../strings';
import { mascot } from '../ui/mascot';
import { castleArt, starsRow } from '../ui/castle';
import { CASTLE_COLORS, GRAND, MAX_STARS, STAGES, TABLE_ORDER, castleStars, isCastleUnlocked, isGrandUnlocked } from '../engine/levels';
import { getStars, totalStars } from '../engine/storage';
import { soundToggle } from '../ui/soundToggle';
import { STICKERS, earnedStickers } from '../engine/stickers';

export function renderHome(): string {
  const castles = TABLE_ORDER.map((n) => {
    const unlocked = isCastleUnlocked(n);
    const inner = `
      ${castleArt(CASTLE_COLORS[n], `×${n}`, !unlocked)}
      <span class="castle-name">${t.castle(n)}</span>
      ${unlocked ? `<span class="castle-stars">⭐ ${castleStars(n)}/${STAGES.length * MAX_STARS}</span>` : `<span class="lock">🔒</span>`}`;
    return unlocked
      ? `<a class="castle-card" href="#/castle/${n}">${inner}</a>`
      : `<div class="castle-card castle-card--locked" aria-label="${t.locked}">${inner}</div>`;
  }).join('');

  const grandOpen = isGrandUnlocked();
  const grandInner = `
    ${castleArt('#ffb800', '👑', !grandOpen)}
    <span class="grand-text">
      <strong>${t.grandChallenge}</strong>
      <small>${grandOpen ? t.grandSubtitle : t.grandLocked}</small>
      ${grandOpen ? starsRow(getStars(GRAND, 'challenge'), MAX_STARS) : `<span class="lock">🔒</span>`}
    </span>`;
  const grand = grandOpen
    ? `<a class="castle-card castle-card--grand" href="#/play/grand/challenge">${grandInner}</a>`
    : `<div class="castle-card castle-card--grand castle-card--locked">${grandInner}</div>`;

  return `
    <header class="topbar">
      <h1 class="title">${t.appTitle}</h1>
      <div class="star-total" aria-label="${t.totalStars}">⭐ ${totalStars()}</div>
      ${soundToggle()}
    </header>
    <section class="hero">
      ${mascot('happy', 140)}
      <div class="hero-side">
        <p class="bubble">${t.greeting}</p>
        <a class="btn btn--alt album-btn" href="#/album">📒 ${t.albumButton} · ${earnedStickers().length}/${STICKERS.length}</a>
      </div>
    </section>
    <section class="map">${castles}${grand}</section>
    <footer class="home-footer"><a class="parents-link" href="#/parents">👪 ${t.parentsLink}</a></footer>
  `;
}
