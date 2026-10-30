// A small castle illustration, tinted per times table.
export function castleArt(color: string, label: string, locked = false): string {
  const fill = locked ? '#cfc6dc' : color;
  return `
<svg class="castle-art" viewBox="0 0 120 110" aria-hidden="true">
  <rect x="14" y="40" width="22" height="60" rx="3" fill="${fill}"/>
  <rect x="84" y="40" width="22" height="60" rx="3" fill="${fill}"/>
  <polygon points="10,42 25,14 40,42" fill="${fill}"/>
  <polygon points="80,42 95,14 110,42" fill="${fill}"/>
  <polygon points="10,42 25,14 40,42 80,42 95,14 110,42" fill="#000" opacity=".15"/>
  <rect x="32" y="52" width="56" height="48" rx="3" fill="${fill}"/>
  <rect x="32" y="52" width="56" height="48" rx="3" fill="#fff" opacity=".18"/>
  <line x1="60" y1="52" x2="60" y2="24" stroke="#7a5a8c" stroke-width="2.5"/>
  <polygon points="60,24 78,30 60,36" fill="#ffd23f"/>
  <path d="M48 100 v-16 a12 12 0 0 1 24 0 v16 z" fill="#fff" opacity=".85"/>
  <text x="60" y="97" text-anchor="middle" font-size="15" font-weight="700" fill="${locked ? '#9a8fae' : color}">${label}</text>
  <circle cx="25" cy="58" r="4" fill="#fff" opacity=".8"/>
  <circle cx="95" cy="58" r="4" fill="#fff" opacity=".8"/>
</svg>`;
}

export function starsRow(earned: number, max: number): string {
  let out = '';
  for (let i = 0; i < max; i++) {
    out += `<span class="star ${i < earned ? 'star--on' : ''}">★</span>`;
  }
  return `<span class="stars" aria-label="${earned} / ${max}">${out}</span>`;
}
