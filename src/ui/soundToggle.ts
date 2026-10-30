import { t } from '../strings';
import { isSoundOn } from '../engine/storage';

// Clicks are handled globally in main.ts via data-action.
export function soundToggle(): string {
  const on = isSoundOn();
  return `<button class="icon-btn" data-action="toggle-sound" aria-label="${on ? t.soundOn : t.soundOff}">${on ? '🔊' : '🔇'}</button>`;
}
