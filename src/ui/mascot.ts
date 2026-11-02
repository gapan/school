import { t } from '../strings';

export type Mood = 'happy' | 'cheer' | 'think' | 'eat';
export type MascotFn = (mood: Mood, size: number) => string;

const DIR = './mascots';

// A mascot drawn as image files in public/mascots/: <name>.svg, plus optional
// <name>-cheer.svg, <name>-think.svg and <name>-eat.svg, used for those moods when present.
export function fileMascot(name: string, label: string): MascotFn {
  const fallback = `${DIR}/${name}.svg`;
  return (mood, size) => {
    const src = mood === 'happy' ? fallback : `${DIR}/${name}-${mood}.svg`;
    return `<img class="mascot mascot--${mood}" src="${src}" width="${size}" height="${size}" alt="${label}"
      onerror="if (!this.src.endsWith('/${name}.svg')) this.src='${fallback}'">`;
  };
}

// The giraffe guides the class and activity pickers; activities bring their own mascot.
const menuMascot = fileMascot('menu', t.menuMascotName);
let current: MascotFn = menuMascot;

export function setMascot(fn: MascotFn = menuMascot): void {
  current = fn;
}

export function mascot(mood: Mood = 'happy', size = 160): string {
  return current(mood, size);
}
