import type { CricketState, X01State } from '../game/types';
import { formatDart } from '../game/types';

type VisitRow = {
  key: string;
  name: string;
  darts: string;
  note: string;
};

function x01Rows(state: X01State): VisitRow[] {
  return [...state.history].reverse().map((h, i) => {
    const darts = h.darts.map(formatDart).join('  ');
    const delta = h.scoreBefore - h.scoreAfter;
    const allMiss = h.darts.length > 0 && h.darts.every((d) => d.segment === 0);
    let note =
      h.bust || (delta === 0 && allMiss)
        ? 'ALLES VERFEHLT'
        : delta === 0
          ? '0'
          : `−${delta}`;
    if (!h.bust && h.scoreAfter === 0) note = 'AUS';
    return {
      key: `x-${state.history.length - i}`,
      name: state.players[h.playerIndex].name,
      darts: darts || '—',
      note,
    };
  });
}

function cricketRows(state: CricketState): VisitRow[] {
  const turns: { playerIndex: number; darts: string[] }[] = [];
  for (const entry of state.history) {
    const last = turns[turns.length - 1];
    if (last && last.playerIndex === entry.playerIndex && last.darts.length < 3) {
      last.darts.push(formatDart(entry.dart));
    } else {
      turns.push({ playerIndex: entry.playerIndex, darts: [formatDart(entry.dart)] });
    }
  }

  return [...turns].reverse().map((t, i) => ({
    key: `c-${turns.length - i}`,
    name: state.players[t.playerIndex].name,
    darts: t.darts.join('  '),
    note: '—',
  }));
}

type Props = {
  state: X01State | CricketState;
};

export function VisitLog({ state }: Props) {
  const rows = state.kind === 'x01' ? x01Rows(state) : cricketRows(state);
  if (rows.length === 0) return null;

  return (
    <div className="visit-log panel">
      <div className="label">Runden</div>
      <div className="visit-table-wrap">
        <table className="visit-table">
          <thead>
            <tr>
              <th>Spieler</th>
              <th>Darts</th>
              <th>Ergebnis</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="visit-name">{row.name}</td>
                <td className="visit-darts">{row.darts}</td>
                <td className="visit-note">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
