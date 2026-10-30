import { t } from '../strings';
import { mascot, type Mood } from '../ui/mascot';
import { confetti } from '../ui/confetti';
import { soundToggle } from '../ui/soundToggle';
import {
  GRAND,
  STAGES,
  TABLE_ORDER,
  TIME_LIMIT,
  isCastleUnlocked,
  isGrandUnlocked,
  isStageUnlocked,
  passedTablesBefore,
  type StageId,
} from '../engine/levels';
import { makeMixedRound, makeRound, starsFor, type Question } from '../engine/questions';
import { recordFact, recordStars, totalStars } from '../engine/storage';
import { earnedStickers } from '../engine/stickers';
import { sfx } from '../engine/sound';
import type { AnswerPad, PadFactory } from '../games/pad';
import { pickPad } from '../games/pickPad';
import { typePad } from '../games/typePad';
import { renderResults } from './results';

const MAX_ATTEMPTS = 2;
const NEXT_DELAY = 1100;
const REVEAL_DELAY = 2600;

interface RoundConfig {
  title: string;
  backHref: string;
  questions: Question[];
  pad: PadFactory;
  // Seconds per question; undefined means untimed.
  timeLimit?: number;
}

function roundConfig(table: number, stage: StageId): RoundConfig {
  if (table === GRAND) {
    return {
      title: t.grandChallenge,
      backHref: '#/',
      questions: makeMixedRound(TABLE_ORDER, []),
      pad: typePad,
      timeLimit: TIME_LIMIT.grand,
    };
  }
  const base = { title: `${t.castle(table)} · ${t.stages[stage].title}`, backHref: `#/castle/${table}` };
  if (stage === 'challenge') {
    return {
      ...base,
      questions: makeMixedRound([table], passedTablesBefore(table)),
      pad: typePad,
      timeLimit: TIME_LIMIT.castle,
    };
  }
  return { ...base, questions: makeRound(table), pad: stage === 'pick' ? pickPad : typePad };
}

function hintText(q: Question): string {
  if (q.a === 1 || q.b === 1) return t.hintOne;
  return t.hint(q.a, q.b);
}

function header(cfg: RoundConfig): string {
  return `
    <header class="topbar">
      <a class="btn btn--small" href="${cfg.backHref}">← ${t.back}</a>
      <h1 class="title">${cfg.title}</h1>
      ${soundToggle()}
    </header>`;
}

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

// Mounts a game round and returns a cleanup function for when the player leaves.
export function mountPlay(root: HTMLElement, table: number, stage: StageId): () => void {
  const cfg = roundConfig(table, stage);
  const { questions, timeLimit } = cfg;

  root.innerHTML = `
    <main class="screen screen--game">
      ${header(cfg)}
      <div class="progress">${'<span class="dot"></span>'.repeat(questions.length)}</div>
      ${timeLimit ? '<div class="timer"><div class="timer-fill"></div></div>' : ''}
      <section class="q-card"></section>
      <div class="coach"><div class="coach-mascot"></div><p class="bubble coach-text"></p></div>
      <div class="pad-area"></div>
    </main>`;

  const main = root.querySelector<HTMLElement>('main')!;
  const dots = [...root.querySelectorAll<HTMLElement>('.dot')];
  const card = root.querySelector<HTMLElement>('.q-card')!;
  const timerFill = root.querySelector<HTMLElement>('.timer-fill');
  const coachMascot = root.querySelector<HTMLElement>('.coach-mascot')!;
  const coachText = root.querySelector<HTMLElement>('.coach-text')!;
  const padArea = root.querySelector<HTMLElement>('.pad-area')!;

  let index = 0;
  let attempts = 0;
  let firstTry = 0;
  let busy = false;
  let pad: AnswerPad | null = null;
  let slot: HTMLElement;

  let alive = true;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => alive && fn(), ms);
    timers.push(id);
    return id;
  };
  let questionTimer = 0;
  let lowTimer = 0;

  const coach = (mood: Mood, text: string) => {
    coachMascot.innerHTML = mascot(mood, 80);
    coachText.textContent = text;
  };

  function startTimer(): void {
    if (!timeLimit || !timerFill) return;
    timerFill.style.transition = 'none';
    timerFill.style.width = '100%';
    timerFill.classList.remove('timer-fill--low');
    void timerFill.offsetWidth; // apply the reset before animating
    timerFill.style.transition = `width ${timeLimit}s linear`;
    timerFill.style.width = '0%';
    lowTimer = later(() => timerFill.classList.add('timer-fill--low'), timeLimit * 700);
    questionTimer = later(timeUp, timeLimit * 1000);
  }

  function stopTimer(): void {
    clearTimeout(questionTimer);
    clearTimeout(lowTimer);
    if (!timerFill) return;
    // Freeze the bar where it is.
    timerFill.style.width = getComputedStyle(timerFill).width;
    timerFill.style.transition = 'none';
  }

  function showQuestion(): void {
    const q = questions[index];
    attempts = 0;
    busy = false;
    dots.forEach((d, i) => d.classList.toggle('dot--current', i === index));
    card.className = 'q-card';
    card.innerHTML = `<span>${q.a}</span><span class="op">×</span><span>${q.b}</span><span class="op">=</span><span class="slot slot--empty">?</span>`;
    slot = card.querySelector<HTMLElement>('.slot')!;
    coach('happy', timeLimit ? t.stages.challenge.prompt : t.stages[stage].prompt);
    pad?.destroy?.();
    pad = cfg.pad(q, slot, submit);
    padArea.replaceChildren(pad.el);
    startTimer();
  }

  function submit(value: number): void {
    if (busy || !pad) return;
    const q = questions[index];

    if (value === q.answer) {
      busy = true;
      stopTimer();
      const first = attempts === 0;
      if (first) firstTry++;
      recordFact(q.table, q.mult, first);
      dots[index].classList.add(first ? 'dot--right' : 'dot--wrong');
      slot.textContent = String(q.answer);
      slot.classList.remove('slot--empty');
      card.classList.add('q-card--right');
      pad.right(value);
      sfx.correct();
      coach('cheer', t.praise[Math.floor(Math.random() * t.praise.length)]);
      later(next, NEXT_DELAY);
      return;
    }

    attempts++;
    pad.wrong(value);
    sfx.wrong();
    if (attempts < MAX_ATTEMPTS) {
      // No time to read a long hint while the clock is running.
      coach('think', timeLimit ? t.tryAgain : `${t.tryAgain} ${hintText(q)}`);
      return;
    }
    reveal('');
  }

  function timeUp(): void {
    if (busy) return;
    sfx.wrong();
    reveal(`${t.timeUp} `);
  }

  function reveal(prefix: string): void {
    const q = questions[index];
    busy = true;
    stopTimer();
    recordFact(q.table, q.mult, false);
    dots[index].classList.add('dot--wrong');
    slot.textContent = String(q.answer);
    slot.classList.remove('slot--empty');
    card.classList.add('q-card--reveal');
    pad?.reveal(q.answer);
    coach('think', prefix + t.reveal(`${q.a} × ${q.b}`, q.answer));
    later(next, REVEAL_DELAY);
  }

  function next(): void {
    index++;
    if (index < questions.length) showQuestion();
    else finish();
  }

  function finish(): void {
    pad?.destroy?.();
    pad = null;
    const before = unlockState(table);
    const stickersBefore = earnedStickers().length;
    const stars = starsFor(firstTry);
    recordStars(table, stage, stars);
    const after = unlockState(table);
    const newStickers = earnedStickers(totalStars()).slice(stickersBefore);

    const unlocked: string[] = [];
    STAGES.forEach((s, i) => {
      if (!before.stages[i] && after.stages[i]) unlocked.push(t.unlockedStage(t.stages[s.id].title));
    });
    if (!before.nextCastle && after.nextCastle) unlocked.push(t.unlockedCastle(after.next));
    if (!before.grand && after.grand) unlocked.push(t.unlockedGrand);

    main.innerHTML =
      header(cfg) +
      renderResults({ continueHref: cfg.backHref, stars, firstTry, total: questions.length, unlocked, newStickers });

    sfx.win();
    for (let i = 0; i < stars; i++) later(() => sfx.star(i), 600 + i * 350);
    if (unlocked.length || newStickers.length) later(sfx.unlock, 700 + stars * 350);
    if (stars >= 2) confetti();
  }

  showQuestion();

  return () => {
    alive = false;
    timers.forEach(clearTimeout);
    pad?.destroy?.();
  };
}
