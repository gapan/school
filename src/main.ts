import '@fontsource-variable/comfortaa';
import './styles.css';
import { findSubject, SUBJECTS } from './catalog';
import { renderSubject, renderSubjects } from './screens/hub';
import { isSoundOn, setSound } from './engine/storage';
import { soundToggle } from './ui/soundToggle';

const app = document.querySelector<HTMLDivElement>('#app')!;
let cleanup: (() => void) | null = null;

// Hash routing keeps everything working on GitHub Pages without server rewrites.
// #/                      class picker
// #/<subject>             activity picker
// #/<subject>/<activity>  the activity, which routes whatever follows
function route(): void {
  cleanup?.();
  cleanup = null;
  document.querySelectorAll('.confetti').forEach((el) => el.remove());

  const [subjectId, activityId, ...rest] = location.hash.replace(/^#\/?/, '').split('/');
  const subject = findSubject(subjectId);
  const activity = subject?.activities.find((a) => a.id === activityId);

  if (activity) cleanup = activity.route(app, rest) ?? null;
  else if (subject) app.innerHTML = `<main class="screen">${renderSubject(subject)}</main>`;
  else app.innerHTML = `<main class="screen">${renderSubjects(SUBJECTS)}</main>`;
  window.scrollTo(0, 0);
}

document.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!target) return;
  if (target.dataset.action === 'replay') route();
  if (target.dataset.action === 'toggle-sound') {
    setSound(!isSoundOn());
    target.outerHTML = soundToggle();
  }
});

window.addEventListener('hashchange', route);
route();
