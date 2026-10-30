import '@fontsource-variable/comfortaa';
import './styles.css';
import { renderHome } from './screens/home';
import { renderCastle } from './screens/castle';
import { mountPlay } from './screens/play';
import { renderAlbum } from './screens/album';
import { mountParents } from './screens/parents';
import { isGameId, renderGames } from './screens/games';
import { mountMemory } from './games/memory';
import { mountFeed } from './games/feed';
import { GRAND, STAGES, TABLE_ORDER, isCastleUnlocked, isStageUnlocked, type StageId } from './engine/levels';
import { isSoundOn, setSound } from './engine/storage';
import { soundToggle } from './ui/soundToggle';

const app = document.querySelector<HTMLDivElement>('#app')!;
let cleanup: (() => void) | null = null;

// Hash routing keeps everything working on GitHub Pages without server rewrites.
function route(): void {
  cleanup?.();
  cleanup = null;
  document.querySelectorAll('.confetti').forEach((el) => el.remove());

  const [screen, a, b] = location.hash.replace(/^#\/?/, '').split('/');
  const table = a === 'grand' ? GRAND : Number(a);
  const validTable = TABLE_ORDER.includes(table);

  if (
    screen === 'play' &&
    (validTable || table === GRAND) &&
    STAGES.some((s) => s.id === b) &&
    isStageUnlocked(table, b as StageId)
  ) {
    cleanup = mountPlay(app, table, b as StageId);
  } else if (screen === 'game' && isGameId(a)) {
    cleanup = (a === 'memory' ? mountMemory : mountFeed)(app, b);
  } else if (screen === 'parents') {
    mountParents(app);
  } else {
    let html: string;
    if (screen === 'castle' && validTable && isCastleUnlocked(table)) html = renderCastle(table);
    else if (screen === 'album') html = renderAlbum();
    else if (screen === 'games') html = renderGames(a);
    else html = renderHome();
    app.innerHTML = `<main class="screen">${html}</main>`;
  }
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
