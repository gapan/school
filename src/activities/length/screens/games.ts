import { t } from '../../../strings';
import { mascot } from '../../../ui/mascot';
import { topbar } from '../../../ui/widgets';
import { LEN, progress } from '../levels';

export type LengthGameId = 'ruler' | 'compare';

const GAMES: { id: LengthGameId; icon: string }[] = [
  { id: 'ruler', icon: '📏' },
  { id: 'compare', icon: '⚖️' },
];

export const isLengthGameId = (id: string | undefined): id is LengthGameId => GAMES.some((g) => g.id === id);

export function renderLengthGames(): string {
  const cards = GAMES.map((g) => {
    const record = progress.getRecord(g.id);
    return `
      <a class="stage-card game-card" href="${LEN}/game/${g.id}">
        <span class="stage-icon game-icon">${g.icon}</span>
        <span class="stage-text">
          <strong>${t.length[g.id].title}</strong>
          <small>${t.length[g.id].subtitle}</small>
          ${record !== undefined ? `<small class="game-record">🏆 ${t.record(record)}</small>` : ''}
        </span>
      </a>`;
  }).join('');

  return `
    ${topbar(t.games, LEN)}
    <section class="hero">
      ${mascot('happy', 100)}
      <p class="bubble">${t.length.gamesIntro}</p>
    </section>
    <section class="stages">${cards}</section>
  `;
}
