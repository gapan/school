import { t } from '../strings';
import { mascot, type Mood } from '../ui/mascot';
import { confetti } from '../ui/confetti';
import { choicesFor, makeMixedRound } from '../engine/questions';
import { getRecord, recordFact, saveRecord } from '../engine/storage';
import { sfx } from '../engine/sound';
import { shake } from './pad';
import { gameHeader, normalizeSel, recordKey, renderGameResults, tablesFor } from '../screens/games';

const FRUITS = ['🍊', '🍉', '🍎', '🍓', '🍐', '🍇', '🥕', '🍌'];
const FLY_TIME = 450;
const NEXT_DELAY = 1000;

function pickFruits(n: number): string[] {
  return [...FRUITS].sort(() => Math.random() - 0.5).slice(0, n);
}

// Feed Kapi: tap the fruit carrying the right answer and it flies into Kapi's mouth.
export function mountFeed(root: HTMLElement, selRaw: string | undefined): () => void {
  const sel = normalizeSel(selRaw);
  const backHref = `#/games/${sel}`;
  const questions = makeMixedRound(tablesFor(sel), []);

  root.innerHTML = `
    <main class="screen screen--game">
      ${gameHeader(t.feed.title, backHref)}
      <div class="belly" aria-hidden="true">${'<span class="belly-seg"></span>'.repeat(questions.length)}</div>
      <section class="q-card"></section>
      <div class="feed-stage">
        <div class="feed-mascot"></div>
        <p class="bubble coach-text"></p>
      </div>
      <div class="fruit-row"></div>
    </main>`;

  const main = root.querySelector<HTMLElement>('main')!;
  const segs = [...root.querySelectorAll<HTMLElement>('.belly-seg')];
  const card = root.querySelector<HTMLElement>('.q-card')!;
  const feedMascot = root.querySelector<HTMLElement>('.feed-mascot')!;
  const coachText = root.querySelector<HTMLElement>('.coach-text')!;
  const fruitRow = root.querySelector<HTMLElement>('.fruit-row')!;

  let index = 0;
  let wrongThisQuestion = false;
  let firstTry = 0;
  let busy = false;
  let alive = true;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(() => alive && fn(), ms));

  const coach = (mood: Mood, text: string) => {
    feedMascot.innerHTML = mascot(mood, 150);
    coachText.textContent = text;
  };

  function showQuestion(): void {
    const q = questions[index];
    busy = false;
    wrongThisQuestion = false;
    card.className = 'q-card';
    card.innerHTML = `<span>${q.a}</span><span class="op">×</span><span>${q.b}</span><span class="op">=</span><span class="slot slot--empty">?</span>`;
    const fruits = pickFruits(4);
    fruitRow.innerHTML = choicesFor(q)
      .map((n, i) => `<button class="fruit" data-value="${n}"><span class="fruit-emoji">${fruits[i]}</span><span class="fruit-num">${n}</span></button>`)
      .join('');
    coach('eat', t.feedPrompt);
  }

  fruitRow.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.fruit');
    if (!btn || btn.disabled || busy) return;
    const q = questions[index];
    const value = Number(btn.dataset.value);

    if (value !== q.answer) {
      wrongThisQuestion = true;
      btn.disabled = true;
      shake(btn);
      sfx.wrong();
      coach('think', t.feedWrong);
      return;
    }

    busy = true;
    if (!wrongThisQuestion) firstTry++;
    recordFact(q.table, q.mult, !wrongThisQuestion);
    const slot = card.querySelector<HTMLElement>('.slot')!;
    slot.textContent = String(q.answer);
    slot.classList.remove('slot--empty');
    card.classList.add('q-card--right');
    flyToMouth(btn);
    sfx.correct();
    later(() => {
      btn.classList.add('fruit--eaten');
      sfx.munch();
      segs[index].classList.add('belly-seg--full');
      coach('cheer', t.feedYum[Math.floor(Math.random() * t.feedYum.length)]);
    }, FLY_TIME);
    later(next, FLY_TIME + NEXT_DELAY);
  });

  function flyToMouth(btn: HTMLElement): void {
    const from = btn.getBoundingClientRect();
    const to = feedMascot.getBoundingClientRect();
    // The mouth sits about two thirds down the mascot.
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height * 0.66 - (from.top + from.height / 2);
    btn.classList.add('fruit--flying');
    btn.style.transform = `translate(${dx}px, ${dy}px) scale(0.3)`;
    fruitRow.querySelectorAll<HTMLElement>('.fruit:not(.fruit--flying)').forEach((f) => f.classList.add('fruit--fade'));
  }

  function next(): void {
    index++;
    if (index < questions.length) showQuestion();
    else finish();
  }

  function finish(): void {
    const key = recordKey('feed', sel);
    const newRecord = saveRecord(key, firstTry);
    main.innerHTML =
      gameHeader(t.feed.title, backHref) +
      renderGameResults({
        message: t.feedDone,
        detail: t.score(firstTry, questions.length),
        newRecord,
        record: getRecord(key),
        backHref,
      });
    sfx.win();
    if (newRecord) later(sfx.unlock, 600);
    confetti();
  }

  showQuestion();

  return () => {
    alive = false;
    timers.forEach(clearTimeout);
  };
}
