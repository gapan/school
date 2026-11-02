import { t } from '../../strings';
import type { Mood } from '../../ui/mascot';

// Blip, a small friendly alien and the guide of the length activity, as an inline SVG string.
export function blip(mood: Mood, size: number): string {
  const eyes =
    mood === 'cheer' || mood === 'eat'
      ? `<path d="M64 98 q12 -13 24 0" class="b-line"/><path d="M112 98 q12 -13 24 0" class="b-line"/>`
      : `<ellipse cx="76" cy="96" rx="14" ry="17" fill="#1b2a4a"/><ellipse cx="124" cy="96" rx="14" ry="17" fill="#1b2a4a"/>
         <circle cx="81" cy="89" r="5" fill="#fff"/><circle cx="129" cy="89" r="5" fill="#fff"/>
         <circle cx="71" cy="103" r="2.2" fill="#fff" opacity=".7"/><circle cx="119" cy="103" r="2.2" fill="#fff" opacity=".7"/>`;
  const brow = mood === 'think' ? `<path d="M110 72 q14 -8 28 0" class="b-line"/>` : '';
  const mouth = {
    happy: `<path d="M86 124 q14 12 28 0" class="b-line"/>`,
    cheer: `<path d="M82 120 q18 22 36 0 z" fill="#2b3f8a" stroke="#1b2a4a" stroke-width="3" stroke-linejoin="round"/><path d="M92 128 q8 6 16 0" fill="#ff8fbf"/>`,
    think: `<path d="M90 127 q10 -4 20 0" class="b-line"/>`,
    eat: `<ellipse cx="100" cy="127" rx="12" ry="10" fill="#2b3f8a" stroke="#1b2a4a" stroke-width="3"/>`,
  }[mood];

  return `
<svg class="mascot mascot--${mood}" width="${size}" height="${size}" viewBox="0 0 200 200" overflow="visible" role="img" aria-label="${t.length.mascotName}">
  <style>.b-line{fill:none;stroke:#1b2a4a;stroke-width:4;stroke-linecap:round}</style>
  <ellipse cx="100" cy="193" rx="58" ry="6" fill="#000" opacity=".08"/>
  <path d="M78 52 Q70 30 58 18" fill="none" stroke="#3f8fd9" stroke-width="5" stroke-linecap="round"/>
  <path d="M122 52 Q130 30 142 18" fill="none" stroke="#3f8fd9" stroke-width="5" stroke-linecap="round"/>
  <circle cx="57" cy="16" r="9" fill="#ffd23f"/><circle cx="54" cy="13" r="3" fill="#fff" opacity=".7"/>
  <circle cx="143" cy="16" r="9" fill="#ffd23f"/><circle cx="140" cy="13" r="3" fill="#fff" opacity=".7"/>
  <ellipse cx="58" cy="168" rx="13" ry="9" fill="#3f8fd9" transform="rotate(-25 58 168)"/>
  <ellipse cx="142" cy="168" rx="13" ry="9" fill="#3f8fd9" transform="rotate(25 142 168)"/>
  <ellipse cx="100" cy="160" rx="48" ry="32" fill="#4f9de8"/>
  <ellipse cx="100" cy="166" rx="28" ry="19" fill="#bfe3ff"/>
  <ellipse cx="80" cy="190" rx="13" ry="7" fill="#3f8fd9"/>
  <ellipse cx="120" cy="190" rx="13" ry="7" fill="#3f8fd9"/>
  <path d="M42 92 Q22 84 26 108 Q34 116 44 110 Z" fill="#3f8fd9"/>
  <path d="M158 92 Q178 84 174 108 Q166 116 156 110 Z" fill="#3f8fd9"/>
  <ellipse cx="100" cy="100" rx="60" ry="52" fill="#5cb0f5"/>
  <circle cx="84" cy="60" r="5" fill="#4f9de8"/><circle cx="100" cy="54" r="6" fill="#4f9de8"/><circle cx="116" cy="60" r="5" fill="#4f9de8"/>
  ${eyes}
  ${brow}
  <circle cx="58" cy="116" r="8" fill="#ff8fbf" opacity=".5"/>
  <circle cx="142" cy="116" r="8" fill="#ff8fbf" opacity=".5"/>
  ${mouth}
</svg>`;
}
