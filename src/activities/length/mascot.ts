import { t } from '../../strings';
import type { Mood } from '../../ui/mascot';

// The length mascot is a picture in public/mascots/. An optional picture per mood
// (length-cheer.svg, length-think.svg, length-eat.svg) is used when present, otherwise length.svg.
const DIR = './mascots';

export function lengthMascot(mood: Mood, size: number): string {
  const fallback = `${DIR}/length.svg`;
  const src = mood === 'happy' ? fallback : `${DIR}/length-${mood}.svg`;
  return `<img class="mascot mascot--${mood}" src="${src}" width="${size}" height="${size}" alt="${t.length.mascotName}"
    onerror="if (!this.src.endsWith('/length.svg')) this.src='${fallback}'">`;
}
