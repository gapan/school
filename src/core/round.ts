import { t } from '../strings';
import { mascot, type Mood } from '../ui/mascot';
import { confetti } from '../ui/confetti';
import { topbar } from '../ui/widgets';
import { renderResults } from '../ui/results';
import { sfx } from './sound';
import type { Sticker } from './stickers';
import type { AnswerPad, PadFactory } from '../pads/pad';

const MAX_ATTEMPTS = 2;
const NEXT_DELAY = 1100;
const REVEAL_DELAY = 2600;

// The "?" box in a question card, filled in by the answer pad.
export const SLOT = '<span class="slot slot--empty">?</span>';

export interface RoundQuestion {
  // HTML for the question card; must contain one SLOT.
  card: string;
  answer: number;
  choices: number[];
  // Shown after a first wrong answer in untimed stages.
  hint: string;
  // Optional picture shown with the hint.
  hintVisual?: string;
  // The whole statement with the answer, e.g. "4 × 3 = 12".
  fact: string;
}

export interface RoundOutcome {
  stars: number;
  unlocked: string[];
  newStickers: Sticker[];
}

export interface RoundConfig<Q extends RoundQuestion> {
  title: string;
  backHref: string;
  albumHref: string;
  questions: Q[];
  pad: PadFactory;
  prompt: string;
  // Seconds per question; undefined means untimed.
  timeLimit?: number;
  onAnswer(q: Q, firstTry: boolean): void;
  // Saves the result and reports what it earned.
  onFinish(firstTry: number): RoundOutcome;
}

// Mounts a round of questions and returns a cleanup function for when the player leaves.
export function mountRound<Q extends RoundQuestion>(root: HTMLElement, cfg: RoundConfig<Q>): () => void {
  const { questions, timeLimit } = cfg;
  const header = topbar(cfg.title, cfg.backHref);

  root.innerHTML = `
    <main class="screen screen--game">
      ${header}
      <div class="progress">${'<span class="dot"></span>'.repeat(questions.length)}</div>
      ${timeLimit ? '<div class="timer"><div class="timer-fill"></div></div>' : ''}
      <section class="q-card"></section>
      <div class="coach"><div class="coach-mascot"></div><p class="bubble coach-text"></p></div>
      <div class="hint-visual" hidden></div>
      <div class="pad-area"></div>
    </main>`;

  const main = root.querySelector<HTMLElement>('main')!;
  const dots = [...root.querySelectorAll<HTMLElement>('.dot')];
  const card = root.querySelector<HTMLElement>('.q-card')!;
  const timerFill = root.querySelector<HTMLElement>('.timer-fill');
  const coachMascot = root.querySelector<HTMLElement>('.coach-mascot')!;
  const coachText = root.querySelector<HTMLElement>('.coach-text')!;
  const hintVisual = root.querySelector<HTMLElement>('.hint-visual')!;
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

  function showHintVisual(html: string | undefined): void {
    hintVisual.hidden = !html;
    hintVisual.innerHTML = html ?? '';
  }

  function showQuestion(): void {
    const q = questions[index];
    attempts = 0;
    busy = false;
    dots.forEach((d, i) => d.classList.toggle('dot--current', i === index));
    card.className = 'q-card';
    card.innerHTML = q.card;
    slot = card.querySelector<HTMLElement>('.slot')!;
    coach('happy', cfg.prompt);
    showHintVisual(undefined);
    pad?.destroy?.();
    pad = cfg.pad(q, slot, submit);
    padArea.replaceChildren(pad.el);
    startTimer();
  }

  function fillSlot(): void {
    slot.textContent = String(questions[index].answer);
    slot.classList.remove('slot--empty');
  }

  function submit(value: number): void {
    if (busy || !pad) return;
    const q = questions[index];

    if (value === q.answer) {
      busy = true;
      stopTimer();
      const first = attempts === 0;
      if (first) firstTry++;
      cfg.onAnswer(q, first);
      dots[index].classList.add(first ? 'dot--right' : 'dot--wrong');
      fillSlot();
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
      coach('think', timeLimit ? t.tryAgain : `${t.tryAgain} ${q.hint}`);
      if (!timeLimit) showHintVisual(q.hintVisual);
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
    cfg.onAnswer(q, false);
    dots[index].classList.add('dot--wrong');
    fillSlot();
    card.classList.add('q-card--reveal');
    pad?.reveal(q.answer);
    coach('think', prefix + t.reveal(q.fact));
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
    const { stars, unlocked, newStickers } = cfg.onFinish(firstTry);

    main.innerHTML =
      header +
      renderResults({
        continueHref: cfg.backHref,
        albumHref: cfg.albumHref,
        stars,
        firstTry,
        total: questions.length,
        unlocked,
        newStickers,
      });

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
