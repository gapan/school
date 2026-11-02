import { t } from '../../strings';
import { renderHome } from './screens/home';
import { renderCastle } from './screens/castle';
import { mountMultiplicationRound } from './round';
import { renderAlbum } from '../../ui/album';
import { mountMultiplicationParents } from './screens/parents';
import { isGameId, renderGames } from './screens/games';
import { mountMemory } from './games/memory';
import { mountFeed } from './games/feed';
import { isStageId } from '../../core/stages';
import { GRAND, MULT, TABLE_ORDER, isCastleUnlocked, isStageUnlocked, progress } from './levels';
import { STICKERS } from './stickers';

// Routes below #/math/multiplication; `parts` is what follows that prefix.
export function routeMultiplication(app: HTMLElement, parts: string[]): (() => void) | void {
  const [screen, a, b] = parts;
  const table = a === 'grand' ? GRAND : Number(a);
  const validTable = TABLE_ORDER.includes(table);

  if (screen === 'play' && (validTable || table === GRAND) && isStageId(b) && isStageUnlocked(table, b)) {
    return mountMultiplicationRound(app, table, b);
  }
  if (screen === 'game' && isGameId(a)) return (a === 'memory' ? mountMemory : mountFeed)(app, b);
  if (screen === 'parents') return mountMultiplicationParents(app);

  let html: string;
  if (screen === 'castle' && validTable && isCastleUnlocked(table)) html = renderCastle(table);
  else if (screen === 'album') html = renderAlbum(STICKERS, progress.totalStars(), MULT, t.allStickers);
  else if (screen === 'games') html = renderGames(a);
  else html = renderHome();
  app.innerHTML = `<main class="screen">${html}</main>`;
}
