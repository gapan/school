import { t } from '../strings';
import { mascot } from '../ui/mascot';
import { STICKERS, earnedStickers, nextSticker, stickerBadge } from '../engine/stickers';
import { totalStars } from '../engine/storage';

export function renderAlbum(): string {
  const total = totalStars();
  const next = nextSticker(total);
  const cells = STICKERS.map((s) => {
    const earned = total >= s.stars;
    return `
      <div class="album-cell ${earned ? '' : 'album-cell--locked'}">
        ${stickerBadge(s, earned)}
        <span class="album-name">${earned ? s.name : `⭐ ${s.stars}`}</span>
      </div>`;
  }).join('');

  return `
    <header class="topbar">
      <a class="btn btn--small" href="#/">← ${t.back}</a>
      <h1 class="title">${t.album}</h1>
      <div class="star-total">⭐ ${total}</div>
    </header>
    <section class="hero">
      ${mascot('happy', 100)}
      <p class="bubble">
        <strong>${t.stickerCount(earnedStickers(total).length, STICKERS.length)}</strong><br>
        ${next ? t.nextSticker(next.stars - total) : t.allStickers}
      </p>
    </section>
    <section class="album">${cells}</section>
  `;
}
