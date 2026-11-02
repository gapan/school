import { t } from '../../../strings';
import { renderLevel } from '../../../ui/level';
import { castleArt } from '../castleArt';
import { CASTLE_COLORS, MULT, isStageUnlocked, progress } from '../levels';

export function renderCastle(table: number): string {
  return renderLevel({
    title: t.castle(table),
    backHref: MULT,
    art: castleArt(CASTLE_COLORS[table], `×${table}`),
    color: CASTLE_COLORS[table],
    greeting: t.castleGreeting,
    stageHref: (stage) => `${MULT}/play/${table}/${stage}`,
    isUnlocked: (stage) => isStageUnlocked(table, stage),
    stars: (stage) => progress.getStars(table, stage),
  });
}
