import { t } from '../../strings';
import { mountRound } from '../../core/round';
import { STAGES, starsFor, type StageId } from '../../core/stages';
import { earnedStickers } from '../../core/stickers';
import { pickPad } from '../../pads/pickPad';
import { typePad } from '../../pads/typePad';
import {
  GRAND_LEVEL,
  LEN,
  LEVELS,
  LEVEL_ORDER,
  TIME_LIMIT,
  isGrandUnlocked,
  isLevelUnlocked,
  isStageUnlocked,
  levelById,
  passedBefore,
  progress,
  type LevelDef,
} from './levels';
import { makeRound } from './questions';
import { STICKERS } from './stickers';

function unlockState(level: LevelDef) {
  const next = LEVELS[LEVEL_ORDER.indexOf(level.id) + 1];
  return {
    stages: STAGES.map((s) => isStageUnlocked(level.id, s.id)),
    next,
    nextLevel: next !== undefined && isLevelUnlocked(next.id),
    grand: isGrandUnlocked(),
  };
}

function questionsFor(level: LevelDef, stage: StageId) {
  const name = t.length.levels[level.id].title;
  if (level === GRAND_LEVEL) {
    return { title: name, backHref: LEN, questions: makeRound([...LEVELS, GRAND_LEVEL]), pad: typePad, timeLimit: TIME_LIMIT.grand };
  }
  const base = { title: `${name} · ${t.stages[stage].title}`, backHref: `${LEN}/level/${level.id}` };
  if (stage === 'challenge') {
    const others = passedBefore(level.id).map((id) => levelById(id)!);
    return { ...base, questions: makeRound([level], others), pad: typePad, timeLimit: TIME_LIMIT.level };
  }
  return { ...base, questions: makeRound([level]), pad: stage === 'pick' ? pickPad : typePad };
}

export function mountLengthRound(root: HTMLElement, level: LevelDef, stage: StageId): () => void {
  return mountRound(root, {
    ...questionsFor(level, stage),
    albumHref: `${LEN}/album`,
    prompt: t.stages[stage].prompt,
    onAnswer: (q, firstTry) => progress.recordFact(q.factKey, firstTry),
    onFinish(firstTry) {
      const before = unlockState(level);
      const stickersBefore = earnedStickers(STICKERS, progress.totalStars()).length;
      const stars = starsFor(firstTry);
      progress.recordStars(level.id, stage, stars);
      const after = unlockState(level);

      const unlocked: string[] = [];
      STAGES.forEach((s, i) => {
        if (!before.stages[i] && after.stages[i]) unlocked.push(t.unlockedStage(t.stages[s.id].title));
      });
      if (!before.nextLevel && after.nextLevel) unlocked.push(t.length.unlockedLevel(t.length.levels[after.next.id].title));
      if (!before.grand && after.grand) unlocked.push(t.unlockedGrand);

      const newStickers = earnedStickers(STICKERS, progress.totalStars()).slice(stickersBefore);
      return { stars, unlocked, newStickers };
    },
  });
}
