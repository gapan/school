import { t } from '../../../strings';
import { mascot, type Mood } from '../../../ui/mascot';
import { confetti } from '../../../ui/confetti';
import { topbar } from '../../../ui/widgets';
import { renderGameResults } from '../../../ui/results';
import { sfx } from '../../../core/sound';
import { shake } from '../../../pads/pad';
import { LEN, progress } from '../levels';

export interface TapQuestion {
  // HTML for the question card.
  card: string;
  options: { label: string; value: number }[];
  answer: number;
  // Said by the mascot after the right answer, e.g. "3 δεκ. = 30 εκ.".
  explain: string;
}

const NEXT_DELAY = 1500;

// A game of ten questions answered by tapping one of a few buttons; the record is the
// number of questions answered right on the first try.
export function mountTapGame(root: HTMLElement, opts: { game: string; title: string; prompt: string; questions: TapQuestion[] }): () => void {
  const { questions } = opts;
  const backHref = `${LEN}/games`;

  root.innerHTML = `
    <main class="screen screen--game">
      ${topbar(opts.title, backHref)}
      <div class="progress">${'<span class="dot"></span>'.repeat(questions.length)}</div>
      <section class="q-card q-card--picture"></section>
      <div class="coach"><div class="coach-mascot"></div><p class="bubble coach-text"></p></div>
      <div class="tap-options"></div>
    </main>`;

  const main = root.querySelector<HTMLElement>('main')!;
  const dots = [...root.querySelectorAll<HTMLElement>('.dot')];
  const card = root.querySelector<HTMLElement>('.q-card')!;
  const coachMascot = root.querySelector<HTMLElement>('.coach-mascot')!;
  const coachText = root.querySelector<HTMLElement>('.coach-text')!;
  const optionsEl = root.querySelector<HTMLElement>('.tap-options')!;

  let index = 0;
  let missed = false;
  let firstTry = 0;
  let busy = false;
  let alive = true;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(() => alive && fn(), ms));

  const coach = (mood: Mood, text: string) => {
    coachMascot.innerHTML = mascot(mood, 80);
    coachText.textContent = text;
  };

  function show(): void {
    const q = questions[index];
    busy = false;
    missed = false;
    dots.forEach((d, i) => d.classList.toggle('dot--current', i === index));
    card.className = 'q-card q-card--picture';
    card.innerHTML = q.card;
    optionsEl.innerHTML = q.options
      .map((o) => `<button class="choice tap-option" data-value="${o.value}">${o.label}</button>`)
      .join('');
    coach('happy', opts.prompt);
  }

  optionsEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.tap-option');
    if (!btn || btn.disabled || busy) return;
    const q = questions[index];
    if (Number(btn.dataset.value) !== q.answer) {
      missed = true;
      btn.disabled = true;
      btn.classList.add('choice--wrong');
      shake(btn);
      sfx.wrong();
      coach('think', t.length.gameWrong);
      return;
    }
    busy = true;
    if (!missed) firstTry++;
    dots[index].classList.add(missed ? 'dot--wrong' : 'dot--right');
    btn.classList.add('choice--right');
    optionsEl.classList.add('pick-pad--done');
    card.classList.add('q-card--right');
    sfx.correct();
    const praise = t.length.gameRight[Math.floor(Math.random() * t.length.gameRight.length)];
    coach('cheer', `${praise} ${q.explain}`);
    later(next, NEXT_DELAY);
  });

  function next(): void {
    optionsEl.classList.remove('pick-pad--done');
    index++;
    if (index < questions.length) show();
    else finish();
  }

  function finish(): void {
    const newRecord = progress.saveRecord(opts.game, firstTry);
    main.innerHTML =
      topbar(opts.title, backHref) +
      renderGameResults({
        message: t.length.gameDone,
        detail: t.score(firstTry, questions.length),
        newRecord,
        record: progress.getRecord(opts.game),
        backHref,
      });
    sfx.win();
    if (newRecord) later(sfx.unlock, 600);
    confetti();
  }

  show();

  return () => {
    alive = false;
    timers.forEach(clearTimeout);
  };
}
