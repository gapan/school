import { t } from '../../strings';
import { renderAlbum } from '../../ui/album';
import { renderLevel } from '../../ui/level';
import { isStageId } from '../../core/stages';
import { towerArt, towerHeight } from './art';
import { LEN, LEVELS, isLevelUnlocked, isStageUnlocked, levelById, progress } from './levels';
import { mountLengthRound } from './round';
import { renderLengthHome } from './screens/home';
import { isLengthGameId, renderLengthGames } from './screens/games';
import { mountLengthParents } from './screens/parents';
import { mountRuler } from './games/ruler';
import { mountCompare } from './games/compare';
import { STICKERS } from './stickers';

// Routes below #/math/length; `parts` is what follows that prefix.
export function routeLength(app: HTMLElement, parts: string[]): (() => void) | void {
  const [screen, a, b] = parts;
  const level = levelById(a);

  if (screen === 'play' && level && isStageId(b) && isStageUnlocked(level.id, b)) return mountLengthRound(app, level, b);
  if (screen === 'game' && isLengthGameId(a)) return (a === 'ruler' ? mountRuler : mountCompare)(app);
  if (screen === 'parents') return mountLengthParents(app);

  let html: string;
  if (screen === 'level' && level && level.id !== 'grand' && isLevelUnlocked(level.id)) {
    html = renderLevel({
      title: t.length.levels[level.id].title,
      backHref: LEN,
      art: towerArt(level.color, towerHeight(LEVELS.indexOf(level))),
      color: level.color,
      greeting: t.length.levelGreeting,
      stageHref: (stage) => `${LEN}/play/${level.id}/${stage}`,
      isUnlocked: (stage) => isStageUnlocked(level.id, stage),
      stars: (stage) => progress.getStars(level.id, stage),
    });
  } else if (screen === 'album') html = renderAlbum(STICKERS, progress.totalStars(), LEN, t.length.allStickers);
  else if (screen === 'games') html = renderLengthGames();
  else html = renderLengthHome();
  app.innerHTML = `<main class="screen">${html}</main>`;
}
