export interface Sticker {
  emoji: string;
  name: string;
  // Total stars needed to earn it (best stars per stage, so this never goes down).
  stars: number;
  color: string;
}

export const earnedStickers = (list: Sticker[], total: number) => list.filter((s) => total >= s.stars);
export const nextSticker = (list: Sticker[], total: number) => list.find((s) => total < s.stars);

export function stickerBadge(s: Sticker, earned = true): string {
  return earned
    ? `<span class="sticker" style="--bg:${s.color}">${s.emoji}</span>`
    : `<span class="sticker sticker--locked">?</span>`;
}
