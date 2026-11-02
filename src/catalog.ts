import { t } from './strings';
import { routeMultiplication } from './activities/multiplication';
import { routeLength } from './activities/length';
import { blip } from './activities/length/mascot';
import type { MascotFn } from './ui/mascot';

// An activity draws its own screens for every hash below #/<subject>/<activity>.
export interface Activity {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  route: (app: HTMLElement, parts: string[]) => (() => void) | void;
  // Optional look of its own: a `data-theme` value for styles.css and a mascot.
  theme?: string;
  mascot?: MascotFn;
}

export interface Subject {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  activities: Activity[];
}

// Add a new class or activity here and it shows up in the pickers.
export const SUBJECTS: Subject[] = [
  {
    id: 'math',
    icon: '🔢',
    ...t.subjects.math,
    activities: [
      { id: 'multiplication', icon: '🏰', ...t.activities.multiplication, route: routeMultiplication },
      { id: 'length', icon: '📏', ...t.activities.length, route: routeLength, theme: 'length', mascot: blip },
    ],
  },
];

export const findSubject = (id: string | undefined) => SUBJECTS.find((s) => s.id === id);
