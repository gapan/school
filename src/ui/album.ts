import { t } from '../strings';
import { mascot } from './mascot';
import { earnedStickers, nextSticker, stickerBadge, type Sticker } from '../core/stickers';

export function renderAlbum(stickers: Sticker[], total: number, backHref: string, complete = t.allStickers): string {
  const next = nextSticker(stickers, total);
  const cells = stickers.map((s) => {
    const earned = total >= s.stars;
    return `
      <div class="album-cell ${earned ? '' : 'album-cell--locked'}">
        ${stickerBadge(s, earned)}
        <span class="album-name">${earned ? s.name : `⭐ ${s.stars}`}</span>
      </div>`;
  }).join('');

  return `
    <header class="topbar">
      <a class="btn btn--small" href="${backHref}">← ${t.back}</a>
      <h1 class="title">${t.album}</h1>
      <div class="star-total">⭐ ${total}</div>
    </header>
    <section class="hero">
      ${mascot('happy', 100)}
      <p class="bubble">
        <strong>${t.stickerCount(earnedStickers(stickers, total).length, stickers.length)}</strong><br>
        ${next ? t.nextSticker(next.stars - total) : complete}
      </p>
    </section>
    <section class="album">${cells}</section>
  `;
}
