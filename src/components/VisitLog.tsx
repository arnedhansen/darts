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
    const allMiss = h.darts.length > 0 && h.darts.every((d) => d.segment === 0);
    const darts = allMiss ? '3x Verfehlt' : h.darts.map(formatDart).join('  ') || '—';
    const delta = h.scoreBefore - h.scoreAfter;
    let note = h.bust ? 'ALLES VERFEHLT' : delta === 0 ? '0' : `−${delta}`;
    if (allMiss && !h.bust) note = '0';
    if (!h.bust && h.scoreAfter === 0) note = 'AUS';
    return {
      key: `x-${state.history.length - i}`,
      name: state.players[h.playerIndex].name,
      darts,
      note,
    };
  });
}

function cricketRows(state: CricketState): VisitRow[] {
  type Turn = { playerIndex: number; darts: { label: string; miss: boolean }[] };
  const turns: Turn[] = [];
  for (const entry of state.history) {
    const last = turns[turns.length - 1];
    const dart = { label: formatDart(entry.dart), miss: entry.dart.segment === 0 };
    if (last && last.playerIndex === entry.playerIndex && last.darts.length < 3) {
      last.darts.push(dart);
    } else {
      turns.push({ playerIndex: entry.playerIndex, darts: [dart] });
    }
  }

  return [...turns].reverse().map((t, i) => {
    const allMiss = t.darts.length === 3 && t.darts.every((d) => d.miss);
    return {
      key: `c-${turns.length - i}`,
      name: state.players[t.playerIndex].name,
      darts: allMiss ? '3x Verfehlt' : t.darts.map((d) => d.label).join('  '),
      note: '—',
    };
  });
}

type Props = {
  state: X01State | CricketState;
};

export function VisitLog({ state }: Props) {
  const rows = state.kind === 'x01' ? x01Rows(state) : cricketRows(state);

  return (
    <div className="visit-log panel">
      <div className="label">Runden</div>
      <div className="visit-table-wrap">
        {rows.length === 0 ? (
          <p className="muted-note" style={{ margin: '0.5rem 0' }}>
            —
          </p>
        ) : (
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
        )}
      </div>
    </div>
  );
}
