import { MULT } from '../routes';
import { t } from '../strings';
import { mascot, type Mood } from '../ui/mascot';
import { confetti } from '../ui/confetti';
import { makeMixedRound } from '../engine/questions';
import { getRecord, saveRecord } from '../engine/storage';
import { sfx } from '../engine/sound';
import { gameHeader, normalizeSel, recordKey, renderGameResults, tablesFor } from '../screens/games';

const PAIRS = 6;
const FLIP_BACK_DELAY = 900;

interface Card {
  pair: number;
  label: string;
  kind: 'q' | 'a';
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Memory match: pair each "a × b" card with its answer.
export function mountMemory(root: HTMLElement, selRaw: string | undefined): () => void {
  const sel = normalizeSel(selRaw);
  const backHref = `${MULT}/games/${sel}`;

  // Answers must be unique, otherwise two cards could both match one question.
  const seen = new Set<number>();
  const facts = makeMixedRound(tablesFor(sel), [])
    .filter((q) => !seen.has(q.answer) && seen.add(q.answer))
    .slice(0, PAIRS);
  const cards: Card[] = shuffle(
    facts.flatMap((q, pair) => [
      { pair, label: `${q.a} × ${q.b}`, kind: 'q' as const },
      { pair, label: String(q.answer), kind: 'a' as const },
    ]),
  );

  root.innerHTML = `
    <main class="screen">
      ${gameHeader(t.memory.title, backHref)}
      <div class="coach"><div class="coach-mascot"></div><p class="bubble coach-text"></p></div>
      <p class="moves"></p>
      <section class="memory-grid">
        ${cards
          .map(
            (c, i) => `
          <button class="mem-card mem-card--${c.kind}" data-i="${i}" aria-label="?">
            <span class="mem-inner">
              <span class="mem-face mem-back">★</span>
              <span class="mem-face mem-front">${c.label}</span>
            </span>
          </button>`,
          )
          .join('')}
      </section>
    </main>`;

  const main = root.querySelector<HTMLElement>('main')!;
  const coachMascot = root.querySelector<HTMLElement>('.coach-mascot')!;
  const coachText = root.querySelector<HTMLElement>('.coach-text')!;
  const movesEl = root.querySelector<HTMLElement>('.moves')!;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('.mem-card')];

  const coach = (mood: Mood, text: string) => {
    coachMascot.innerHTML = mascot(mood, 80);
    coachText.textContent = text;
  };
  const showMoves = () => (movesEl.textContent = t.moves(moves));

  let open: number[] = [];
  let matched = 0;
  let moves = 0;
  let busy = false;
  let alive = true;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(() => alive && fn(), ms));

  coach('happy', t.memoryPrompt);
  showMoves();

  root.querySelector('.memory-grid')!.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.mem-card');
    if (!btn || busy || btn.classList.contains('mem-card--open')) return;
    const i = Number(btn.dataset.i);
    btn.classList.add('mem-card--open');
    btn.setAttribute('aria-label', cards[i].label);
    sfx.flip();
    open.push(i);
    if (open.length < 2) return;

    moves++;
    showMoves();
    const [a, b] = open;
    open = [];
    if (cards[a].pair === cards[b].pair) {
      matched++;
      [a, b].forEach((k) => buttons[k].classList.add('mem-card--matched'));
      sfx.correct();
      coach('cheer', t.memoryMatch);
      if (matched === facts.length) later(finish, 900);
      return;
    }

    busy = true;
    sfx.wrong();
    coach('think', t.memoryMiss);
    later(() => {
      [a, b].forEach((k) => {
        buttons[k].classList.remove('mem-card--open');
        buttons[k].setAttribute('aria-label', '?');
      });
      busy = false;
    }, FLIP_BACK_DELAY);
  });

  function finish(): void {
    const key = recordKey('memory', sel);
    const newRecord = saveRecord(key, moves, true);
    main.innerHTML =
      gameHeader(t.memory.title, backHref) +
      renderGameResults({ message: t.memoryDone(moves), newRecord, record: getRecord(key), backHref });
    sfx.win();
    if (newRecord) later(sfx.unlock, 600);
    confetti();
  }

  return () => {
    alive = false;
    timers.forEach(clearTimeout);
  };
}
