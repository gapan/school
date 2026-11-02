import { t } from '../strings';
import { soundToggle } from './soundToggle';

// Back button, title and (by default) the sound toggle.
export function topbar(title: string, backHref: string, right = soundToggle()): string {
  return `
    <header class="topbar">
      <a class="btn btn--small" href="${backHref}">← ${t.back}</a>
      <h1 class="title">${title}</h1>
      ${right}
    </header>`;
}

export function starsRow(earned: number, max: number): string {
  let out = '';
  for (let i = 0; i < max; i++) {
    out += `<span class="star ${i < earned ? 'star--on' : ''}">★</span>`;
  }
  return `<span class="stars" aria-label="${earned} / ${max}">${out}</span>`;
}
