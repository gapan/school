import { totalStars } from './storage';

export interface Sticker {
  emoji: string;
  name: string;
  // Total stars needed to earn it (best stars per stage, so this never goes down).
  stars: number;
  color: string;
}

// The last sticker needs every star in the game: 9 castles × 9 + 3 for the grand challenge.
export const STICKERS: Sticker[] = [
  { emoji: '🎀', name: 'Φιόγκος', stars: 1, color: '#ffd6e8' },
  { emoji: '🌸', name: 'Λουλούδι', stars: 3, color: '#ffe0f0' },
  { emoji: '🦋', name: 'Πεταλούδα', stars: 6, color: '#dcefff' },
  { emoji: '🧁', name: 'Κεκάκι', stars: 9, color: '#fff0d6' },
  { emoji: '🐱', name: 'Γατούλα', stars: 12, color: '#ffe9d6' },
  { emoji: '🐴', name: 'Αλογάκι', stars: 15, color: '#f3e2d3' },
  { emoji: '🌈', name: 'Ουράνιο τόξο', stars: 19, color: '#e4f7ff' },
  { emoji: '🎂', name: 'Τούρτα', stars: 23, color: '#ffe3ec' },
  { emoji: '🐬', name: 'Δελφίνι', stars: 27, color: '#d9f4f7' },
  { emoji: '👗', name: 'Φόρεμα', stars: 31, color: '#e9ddff' },
  { emoji: '🦄', name: 'Μονόκερος', stars: 36, color: '#f6e0ff' },
  { emoji: '💎', name: 'Διαμάντι', stars: 42, color: '#dff3ff' },
  { emoji: '🏰', name: 'Κάστρο', stars: 48, color: '#ffe6f2' },
  { emoji: '🎠', name: 'Καρουζέλ', stars: 55, color: '#fff3c4' },
  { emoji: '🦢', name: 'Κύκνος', stars: 62, color: '#eef2ff' },
  { emoji: '🪄', name: 'Μαγικό ραβδί', stars: 70, color: '#efe2ff' },
  { emoji: '🌟', name: 'Αστέρι', stars: 78, color: '#fff6c9' },
  { emoji: '👑', name: 'Κορώνα', stars: 84, color: '#ffefb0' },
];

export function earnedStickers(total = totalStars()): Sticker[] {
  return STICKERS.filter((s) => total >= s.stars);
}

export function nextSticker(total = totalStars()): Sticker | undefined {
  return STICKERS.find((s) => total < s.stars);
}

export function stickerBadge(s: Sticker, earned = true): string {
  return earned
    ? `<span class="sticker" style="--bg:${s.color}">${s.emoji}</span>`
    : `<span class="sticker sticker--locked">?</span>`;
}
