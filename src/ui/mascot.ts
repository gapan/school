import { t } from '../strings';

export type Mood = 'happy' | 'cheer' | 'think' | 'eat';

// Kapi the capybara, as an inline SVG string.
export function mascot(mood: Mood = 'happy', size = 160): string {
  const eyes =
    mood === 'cheer' || mood === 'eat'
      ? `<path d="M70 88 q8 -9 16 0" class="m-line"/><path d="M114 88 q8 -9 16 0" class="m-line"/>`
      : `<circle cx="78" cy="88" r="7" fill="#2b1a10"/><circle cx="122" cy="88" r="7" fill="#2b1a10"/>
         <circle cx="80.5" cy="85.5" r="2.4" fill="#fff"/><circle cx="124.5" cy="85.5" r="2.4" fill="#fff"/>`;
  const mouth = {
    happy: `<path d="M88 128 q12 10 24 0" class="m-line"/>`,
    cheer: `<path d="M86 126 q14 16 28 0 z" fill="#d9456f" stroke="#3b2416" stroke-width="3" stroke-linejoin="round"/>`,
    think: `<path d="M92 130 h16" class="m-line"/>`,
    eat: `<ellipse cx="100" cy="131" rx="13" ry="10" fill="#5a2a1a" stroke="#3b2416" stroke-width="3"/>`,
  }[mood];

  return `
<svg class="mascot mascot--${mood}" width="${size}" height="${size}" viewBox="0 0 200 200" role="img" aria-label="${t.mascotName}">
  <style>.m-line{fill:none;stroke:#3b2416;stroke-width:4;stroke-linecap:round}</style>
  <ellipse cx="100" cy="192" rx="62" ry="6" fill="#000" opacity=".08"/>
  <ellipse cx="100" cy="155" rx="68" ry="40" fill="#a06b46"/>
  <ellipse cx="62" cy="186" rx="14" ry="8" fill="#8a5a3b"/>
  <ellipse cx="138" cy="186" rx="14" ry="8" fill="#8a5a3b"/>
  <ellipse cx="60" cy="58" rx="13" ry="11" fill="#8a5a3b"/>
  <ellipse cx="140" cy="58" rx="13" ry="11" fill="#8a5a3b"/>
  <ellipse cx="100" cy="98" rx="56" ry="50" fill="#b8835a"/>
  <ellipse cx="100" cy="120" rx="36" ry="25" fill="#9a6646"/>
  <ellipse cx="89" cy="113" rx="4.5" ry="3.2" fill="#3b2416"/>
  <ellipse cx="111" cy="113" rx="4.5" ry="3.2" fill="#3b2416"/>
  ${mouth}
  ${eyes}
  <circle cx="62" cy="108" r="9" fill="#ff8fbf" opacity=".55"/>
  <circle cx="138" cy="108" r="9" fill="#ff8fbf" opacity=".55"/>
  <circle cx="100" cy="38" r="17" fill="#ffa43a"/>
  <circle cx="94" cy="32" r="5" fill="#fff" opacity=".35"/>
  <path d="M100 22 q10 -10 18 -4 q-8 8 -18 4 z" fill="#5fbf4a"/>
</svg>`;
}
