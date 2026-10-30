import { MULT } from '../routes';
import { t } from '../strings';
import { mascot } from '../ui/mascot';
import { MAX_STARS } from '../engine/levels';
import { stickerBadge, type Sticker } from '../engine/stickers';

export interface RoundResult {
  continueHref: string;
  stars: number;
  firstTry: number;
  total: number;
  unlocked: string[];
  newStickers: Sticker[];
}

export function renderResults(r: RoundResult): string {
  let stars = '';
  for (let i = 0; i < MAX_STARS; i++) {
    stars += `<span class="big-star ${i < r.stars ? 'big-star--on' : ''}" style="--i:${i}">★</span>`;
  }
  const stickers = r.newStickers.length
    ? `<a class="new-sticker" href="${MULT}/album">
        <span class="new-sticker-title">🎉 ${t.newSticker}</span>
        <span class="new-sticker-list">${r.newStickers.map((s) => stickerBadge(s)).join('')}</span>
        <span>${r.newStickers.map((s) => s.name).join(', ')}</span>
      </a>`
    : '';
  const unlocked = r.unlocked.map((msg) => `<p class="unlock-banner">🔓 ${msg}</p>`).join('');

  return `
    <section class="results">
      ${mascot(r.stars > 0 ? 'cheer' : 'think', 150)}
      <div class="big-stars">${stars}</div>
      <h2 class="results-title">${t.resultMessages[r.stars]}</h2>
      <p class="results-score">${t.score(r.firstTry, r.total)}</p>
      ${stickers}
      ${unlocked}
      <div class="results-actions">
        <button class="btn btn--alt" data-action="replay">↻ ${t.playAgain}</button>
        <a class="btn" href="${r.continueHref}">${t.continue} →</a>
      </div>
    </section>
  `;
}
