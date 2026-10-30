import { renderHome } from './screens/home';
import { renderCastle } from './screens/castle';
import { mountPlay } from './screens/play';
import { renderAlbum } from './screens/album';
import { mountParents } from './screens/parents';
import { isGameId, renderGames } from './screens/games';
import { mountMemory } from './games/memory';
import { mountFeed } from './games/feed';
import { GRAND, STAGES, TABLE_ORDER, isCastleUnlocked, isStageUnlocked, type StageId } from './engine/levels';

// Routes below #/math/multiplication; `parts` is what follows that prefix.
export function routeMultiplication(app: HTMLElement, parts: string[]): (() => void) | void {
  const [screen, a, b] = parts;
  const table = a === 'grand' ? GRAND : Number(a);
  const validTable = TABLE_ORDER.includes(table);

  if (
    screen === 'play' &&
    (validTable || table === GRAND) &&
    STAGES.some((s) => s.id === b) &&
    isStageUnlocked(table, b as StageId)
  ) {
    return mountPlay(app, table, b as StageId);
  }
  if (screen === 'game' && isGameId(a)) return (a === 'memory' ? mountMemory : mountFeed)(app, b);
  if (screen === 'parents') return mountParents(app);

  let html: string;
  if (screen === 'castle' && validTable && isCastleUnlocked(table)) html = renderCastle(table);
  else if (screen === 'album') html = renderAlbum();
  else if (screen === 'games') html = renderGames(a);
  else html = renderHome();
  app.innerHTML = `<main class="screen">${html}</main>`;
}
