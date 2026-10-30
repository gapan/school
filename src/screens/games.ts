import { t } from '../strings';
import { mascot } from '../ui/mascot';
import { soundToggle } from '../ui/soundToggle';
import { TABLE_ORDER, isCastleUnlocked } from '../engine/levels';
import { getRecord } from '../engine/storage';

export type GameId = 'memory' | 'feed';

const GAMES: { id: GameId; icon: string }[] = [
  { id: 'memory', icon: '🃏' },
  { id: 'feed', icon: '🍊' },
];

export const isGameId = (id: string): id is GameId => GAMES.some((g) => g.id === id);

// `sel` is a table number or "all"; only unlocked castles can be practised.
export function tablesFor(sel: string): number[] {
  const n = Number(sel);
  if (TABLE_ORDER.includes(n) && isCastleUnlocked(n)) return [n];
  return TABLE_ORDER.filter(isCastleUnlocked);
}

export function normalizeSel(sel: string | undefined): string {
  const n = Number(sel);
  return TABLE_ORDER.includes(n) && isCastleUnlocked(n) ? String(n) : 'all';
}

export function recordKey(game: GameId, sel: string): string {
  return `${game}-${sel}`;
}

export function gameHeader(title: string, backHref: string): string {
  return `
    <header class="topbar">
      <a class="btn btn--small" href="${backHref}">← ${t.back}</a>
      <h1 class="title">${title}</h1>
      ${soundToggle()}
    </header>`;
}

export function renderGames(selRaw: string | undefined): string {
  const sel = normalizeSel(selRaw);
  const chips = ['all', ...TABLE_ORDER.filter(isCastleUnlocked).map(String)]
    .map((s) => `<a class="chip ${s === sel ? 'chip--on' : ''}" href="#/games/${s}">${s === 'all' ? t.allTables : `×${s}`}</a>`)
    .join('');
  const cards = GAMES.map((g) => {
    const record = getRecord(recordKey(g.id, sel));
    return `
      <a class="stage-card game-card" href="#/game/${g.id}/${sel}">
        <span class="stage-icon game-icon">${g.icon}</span>
        <span class="stage-text">
          <strong>${t[g.id].title}</strong>
          <small>${t[g.id].subtitle}</small>
          ${record !== undefined ? `<small class="game-record">🏆 ${t.record(record)}</small>` : ''}
        </span>
      </a>`;
  }).join('');

  return `
    ${gameHeader(t.games, '#/')}
    <section class="hero">
      ${mascot('happy', 100)}
      <p class="bubble">${t.gamesIntro}</p>
    </section>
    <nav class="chips">${chips}</nav>
    <section class="stages">${cards}</section>
  `;
}

export function renderGameResults(opts: { message: string; detail?: string; newRecord: boolean; record?: number; backHref: string }): string {
  return `
    <section class="results">
      ${mascot('cheer', 150)}
      <h2 class="results-title">${opts.message}</h2>
      ${opts.detail ? `<p class="results-score">${opts.detail}</p>` : ''}
      ${opts.newRecord ? `<p class="unlock-banner">🏆 ${t.newRecord}</p>` : opts.record !== undefined ? `<p class="results-score">🏆 ${t.record(opts.record)}</p>` : ''}
      <div class="results-actions">
        <button class="btn btn--alt" data-action="replay">↻ ${t.playAgain}</button>
        <a class="btn" href="${opts.backHref}">${t.games} →</a>
      </div>
    </section>
  `;
}
