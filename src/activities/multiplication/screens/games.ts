import { t } from '../../../strings';
import { mascot } from '../../../ui/mascot';
import { topbar } from '../../../ui/widgets';
import { MULT, TABLE_ORDER, isCastleUnlocked, progress } from '../levels';

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

export function renderGames(selRaw: string | undefined): string {
  const sel = normalizeSel(selRaw);
  const chips = ['all', ...TABLE_ORDER.filter(isCastleUnlocked).map(String)]
    .map((s) => `<a class="chip ${s === sel ? 'chip--on' : ''}" href="${MULT}/games/${s}">${s === 'all' ? t.allTables : `×${s}`}</a>`)
    .join('');
  const cards = GAMES.map((g) => {
    const record = progress.getRecord(recordKey(g.id, sel));
    return `
      <a class="stage-card game-card" href="${MULT}/game/${g.id}/${sel}">
        <span class="stage-icon game-icon">${g.icon}</span>
        <span class="stage-text">
          <strong>${t[g.id].title}</strong>
          <small>${t[g.id].subtitle}</small>
          ${record !== undefined ? `<small class="game-record">🏆 ${t.record(record)}</small>` : ''}
        </span>
      </a>`;
  }).join('');

  return `
    ${topbar(t.games, MULT)}
    <section class="hero">
      ${mascot('happy', 100)}
      <p class="bubble">${t.gamesIntro}</p>
    </section>
    <nav class="chips">${chips}</nav>
    <section class="stages">${cards}</section>
  `;
}
