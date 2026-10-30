import { t } from '../strings';

export type Mood = 'happy' | 'cheer' | 'think';

const SKIN = '#ffdcc4';
const HAIR = '#8b4a2b';

// The princess mascot, as an inline SVG string.
export function mascot(mood: Mood = 'happy', size = 160): string {
  const eyes =
    mood === 'cheer'
      ? `<path d="M77 101 q7 -8 14 0" class="m-line"/><path d="M109 101 q7 -8 14 0" class="m-line"/>`
      : `<ellipse cx="84" cy="101" rx="6" ry="8" fill="#3b2416"/><ellipse cx="116" cy="101" rx="6" ry="8" fill="#3b2416"/>
         <circle cx="86" cy="98" r="2.4" fill="#fff"/><circle cx="118" cy="98" r="2.4" fill="#fff"/>
         <path d="M76 92 l-4 -3 M124 92 l4 -3" class="m-line m-thin"/>`;
  const mouth = {
    happy: `<path d="M91 118 q9 8 18 0" class="m-line"/>`,
    cheer: `<path d="M88 115 q12 15 24 0 z" fill="#d9456f" stroke="#3b2416" stroke-width="3" stroke-linejoin="round"/>`,
    think: `<path d="M94 120 q6 -3 12 0" class="m-line"/>`,
  }[mood];

  return `
<svg class="mascot mascot--${mood}" width="${size}" height="${size}" viewBox="0 0 200 200" role="img" aria-label="${t.mascotName}">
  <style>.m-line{fill:none;stroke:#3b2416;stroke-width:3.5;stroke-linecap:round}.m-thin{stroke-width:2.5}</style>
  <ellipse cx="100" cy="196" rx="58" ry="5" fill="#000" opacity=".08"/>
  <path d="M54 100 C48 44 152 44 146 100 L154 164 Q100 178 46 164 Z" fill="${HAIR}"/>
  <path d="M74 150 L126 150 L158 198 L42 198 Z" fill="#ff7eb6"/>
  <path d="M60 182 Q100 192 140 182 L146 192 Q100 202 54 192 Z" fill="#fff" opacity=".45"/>
  <rect x="92" y="122" width="16" height="18" rx="6" fill="${SKIN}"/>
  <path d="M76 138 Q100 128 124 138 L128 154 L72 154 Z" fill="#ff5fa2"/>
  <circle cx="72" cy="144" r="12" fill="#ffb3d9"/>
  <circle cx="128" cy="144" r="12" fill="#ffb3d9"/>
  <circle cx="100" cy="140" r="4" fill="#7ad3ff" stroke="#fff" stroke-width="1.5"/>
  <ellipse cx="100" cy="96" rx="40" ry="42" fill="${SKIN}"/>
  <path d="M59 96 C56 54 144 54 141 96 C130 76 114 70 100 80 C86 70 70 76 59 96 Z" fill="${HAIR}"/>
  ${eyes}
  <circle cx="74" cy="113" r="7" fill="#ff8fb3" opacity=".5"/>
  <circle cx="126" cy="113" r="7" fill="#ff8fb3" opacity=".5"/>
  ${mouth}
  <polygon points="78,64 83,42 92,56 100,34 108,56 117,42 122,64" fill="#ffd23f" stroke="#e8a900" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="100" cy="54" r="4.5" fill="#ff5fa2"/>
  <circle cx="86" cy="58" r="3" fill="#7ad3ff"/>
  <circle cx="114" cy="58" r="3" fill="#7ad3ff"/>
</svg>`;
}
