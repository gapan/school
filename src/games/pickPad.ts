import { choicesFor } from '../engine/questions';
import { sfx } from '../engine/sound';
import { shake, type PadFactory } from './pad';

const BUBBLE_COLORS = ['#ff7eb6', '#9b6dff', '#3cc8c8', '#ff9f5a'];

// Pick the right answer from four bubbles.
export const pickPad: PadFactory = (q, _slot, submit) => {
  const el = document.createElement('div');
  el.className = 'pick-pad';
  el.innerHTML = choicesFor(q)
    .map((n, i) => `<button class="choice" style="--c:${BUBBLE_COLORS[i]}" data-value="${n}">${n}</button>`)
    .join('');

  let locked = false;
  el.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.choice');
    if (!btn || btn.disabled || locked) return;
    sfx.tap();
    submit(Number(btn.dataset.value));
  });

  const button = (value: number) => el.querySelector<HTMLButtonElement>(`[data-value="${value}"]`)!;
  const finish = (value: number) => {
    locked = true;
    el.classList.add('pick-pad--done');
    button(value).classList.add('choice--right');
  };

  return {
    el,
    wrong(value) {
      const btn = button(value);
      btn.disabled = true;
      btn.classList.add('choice--wrong');
      shake(btn);
    },
    right: finish,
    reveal: finish,
  };
};
