import { ROUND_SIZE, takeWeighted } from '../../core/stages';
import { MIXED_PAIRS, progress, type LevelDef } from './levels';
import { mixedQuestion, simpleQuestion, type LengthQuestion, type Unit } from './units';

interface Kind {
  key: string;
  make: () => LengthQuestion;
}

// Every kind of question a level can ask, e.g. "m>cm" and "cm>m" for metres and centimetres.
function kindsFor(level: LevelDef): Kind[] {
  const kinds: Kind[] = level.pairs.flatMap(([big, small]: [Unit, Unit]) => [
    { key: `${big}>${small}`, make: () => simpleQuestion(big, small, true) },
    { key: `${small}>${big}`, make: () => simpleQuestion(big, small, false) },
  ]);
  if (level.mixed) {
    for (const [big, small] of MIXED_PAIRS) {
      // One kind per pair: the question picks its direction itself.
      kinds.push({ key: `${big}+${small}`, make: () => mixedQuestion(big, small) });
    }
  }
  return kinds;
}

// Mixed-unit stats are kept per direction; weight a pair by both.
function wrongCount(key: string): number {
  if (!key.includes('+')) return progress.getFact(key).wrong;
  const [big, small] = key.split('+');
  return progress.getFact(`${big}+${small}>${small}`).wrong + progress.getFact(`${small}>${big}+${small}`).wrong;
}

// Ten different questions; `others` (earlier levels) are mixed in for challenges, and
// kinds the player has missed before come up more often.
export function makeRound(focus: LevelDef[], others: LevelDef[] = []): LengthQuestion[] {
  const focusKinds = focus.flatMap(kindsFor);
  const otherKinds = others.flatMap(kindsFor).filter((k) => !focusKinds.some((f) => f.key === k.key));
  const boost = Math.max(1, otherKinds.length / focusKinds.length);
  const pool = [
    ...focusKinds.map((k) => ({ ...k, weight: (1 + wrongCount(k.key)) * boost })),
    ...otherKinds.map((k) => ({ ...k, weight: 1 + wrongCount(k.key) })),
  ];

  const seen = new Set<string>();
  const questions: LengthQuestion[] = [];
  for (let tries = 0; questions.length < ROUND_SIZE && tries < 500; tries++) {
    // Kinds are drawn with replacement, so a level with a single pair still fills a round.
    const kind = takeWeighted([...pool]);
    const q = kind.make();
    if (seen.has(q.fact)) continue;
    seen.add(q.fact);
    questions.push(q);
  }
  return questions;
}
