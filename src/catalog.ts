import { t } from './strings';
import { routeMultiplication } from './multiplication';

// An activity draws its own screens for every hash below #/<subject>/<activity>.
export interface Activity {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  route: (app: HTMLElement, parts: string[]) => (() => void) | void;
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
    activities: [{ id: 'multiplication', icon: '🏰', ...t.activities.multiplication, route: routeMultiplication }],
  },
];

export const findSubject = (id: string | undefined) => SUBJECTS.find((s) => s.id === id);
