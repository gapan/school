import { sfx } from '../engine/sound';
import { shake, type PadFactory } from './pad';

const MAX_DIGITS = 3;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];

// Type the answer on a big number pad (a physical keyboard works too).
export const typePad: PadFactory = (_q, slot, submit) => {
  const el = document.createElement('div');
  el.className = 'type-pad';
  el.innerHTML = KEYS.map((k) => {
    if (k === 'del') return `<button class="key key--del" data-key="del" aria-label="Σβήσε">⌫</button>`;
    if (k === 'ok') return `<button class="key key--ok" data-key="ok" aria-label="Έτοιμο">✓</button>`;
    return `<button class="key" data-key="${k}">${k}</button>`;
  }).join('');

  let value = '';
  let locked = false;

  const update = () => {
    slot.textContent = value || '?';
    slot.classList.toggle('slot--empty', !value);
  };

  const press = (key: string) => {
    if (locked) return;
    if (/^\d$/.test(key)) {
      if (value.length >= MAX_DIGITS) return;
      value = value === '0' ? key : value + key;
    } else if (key === 'del') {
      value = value.slice(0, -1);
    } else if (key === 'ok') {
      if (!value) return shake(slot);
      sfx.tap();
      return submit(Number(value));
    }
    sfx.tap();
    update();
  };

  el.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.key');
    if (btn) press(btn.dataset.key!);
  });

  const onKey = (e: KeyboardEvent) => {
    if (/^\d$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('del');
    else if (e.key === 'Enter') press('ok');
  };
  window.addEventListener('keydown', onKey);

  update();

  return {
    el,
    wrong() {
      shake(slot);
      value = '';
      update();
    },
    right() {
      locked = true;
    },
    reveal() {
      locked = true;
    },
    destroy() {
      window.removeEventListener('keydown', onKey);
    },
  };
};
