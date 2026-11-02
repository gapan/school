export const towerHeight = (levelIndex: number) => 34 + levelIndex * 7;

// A ruler-striped tower; taller towers for later levels.
export function towerArt(color: string, height: number, locked = false): string {
  const fill = locked ? '#c9d6e3' : color;
  const top = 100 - height;
  let ticks = '';
  for (let y = 96; y > top + 6; y -= 8) {
    const long = (96 - y) % 24 === 0;
    ticks += `<line x1="44" y1="${y}" x2="${long ? 58 : 51}" y2="${y}" stroke="#fff" stroke-width="2" opacity=".8"/>`;
  }
  return `
<svg class="castle-art" viewBox="0 0 120 110" aria-hidden="true">
  <rect x="40" y="${top}" width="40" height="${height}" rx="4" fill="${fill}"/>
  <rect x="62" y="${top}" width="18" height="${height}" rx="4" fill="#000" opacity=".1"/>
  ${ticks}
  <polygon points="34,${top + 2} 60,${top - 20} 86,${top + 2}" fill="${fill}"/>
  <polygon points="60,${top - 20} 86,${top + 2} 60,${top + 2}" fill="#000" opacity=".12"/>
  <circle cx="60" cy="${top - 24}" r="4" fill="#ffd23f"/>
  <rect x="14" y="100" width="92" height="6" rx="3" fill="#000" opacity=".08"/>
</svg>`;
}
