import { t } from '../../strings';
import { mountRound, type RoundConfig } from '../../core/round';
import { STAGES, starsFor, type StageId } from '../../core/stages';
import { earnedStickers } from '../../core/stickers';
import { pickPad } from '../../pads/pickPad';
import { typePad } from '../../pads/typePad';
import {
  GRAND,
  MULT,
  TABLE_ORDER,
  TIME_LIMIT,
  isCastleUnlocked,
  isGrandUnlocked,
  isStageUnlocked,
  passedTablesBefore,
  progress,
} from './levels';
import { factKey, makeMixedRound, makeRound, type Question } from './questions';
import { STICKERS } from './stickers';

// Snapshot of what is open, to detect what a round unlocked.
function unlockState(table: number) {
  const next = TABLE_ORDER[TABLE_ORDER.indexOf(table) + 1];
  return {
    stages: STAGES.map((s) => isStageUnlocked(table, s.id)),
    next,
    nextCastle: next !== undefined && isCastleUnlocked(next),
    grand: isGrandUnlocked(),
  };
}

function questionsFor(table: number, stage: StageId) {
  if (table === GRAND) {
    return { title: t.grandChallenge, backHref: MULT, questions: makeMixedRound(TABLE_ORDER, []), pad: typePad, timeLimit: TIME_LIMIT.grand };
  }
  const base = { title: `${t.castle(table)} · ${t.stages[stage].title}`, backHref: `${MULT}/castle/${table}` };
  if (stage === 'challenge') {
    return { ...base, questions: makeMixedRound([table], passedTablesBefore(table)), pad: typePad, timeLimit: TIME_LIMIT.castle };
  }
  return { ...base, questions: makeRound(table), pad: stage === 'pick' ? pickPad : typePad };
}

export function mountMultiplicationRound(root: HTMLElement, table: number, stage: StageId): () => void {
  const cfg: RoundConfig<Question> = {
    ...questionsFor(table, stage),
    albumHref: `${MULT}/album`,
    prompt: t.stages[stage].prompt,
    onAnswer: (q, firstTry) => progress.recordFact(factKey(q.table, q.mult), firstTry),
    onFinish(firstTry) {
      const before = unlockState(table);
      const stickersBefore = earnedStickers(STICKERS, progress.totalStars()).length;
      const stars = starsFor(firstTry);
      progress.recordStars(table, stage, stars);
      const after = unlockState(table);

      const unlocked: string[] = [];
      STAGES.forEach((s, i) => {
        if (!before.stages[i] && after.stages[i]) unlocked.push(t.unlockedStage(t.stages[s.id].title));
      });
      if (!before.nextCastle && after.nextCastle) unlocked.push(t.unlockedCastle(after.next));
      if (!before.grand && after.grand) unlocked.push(t.unlockedGrand);

      const newStickers = earnedStickers(STICKERS, progress.totalStars()).slice(stickersBefore);
      return { stars, unlocked, newStickers };
    },
  };
  return mountRound(root, cfg);
}
