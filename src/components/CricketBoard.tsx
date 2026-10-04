import type { CricketState, Dart } from '../game/types';
import { CRICKET_TARGETS, formatDart } from '../game/types';
import { marksDisplay } from '../game/cricket';
import { Keypad } from './Keypad';
import { VisitLog } from './VisitLog';

type Props = {
  state: CricketState;
  shake: boolean;
  onDart: (dart: Dart) => void;
  onUndo: () => void;
  onBust: () => void;
  onQuit: () => void;
};

export function CricketBoard({ state, shake, onDart, onUndo, onBust, onQuit }: Props) {
  return (
    <div className="stack">
      <h1 className="brand">D A R T S</h1>
      <p className="subtitle">Cricket</p>

      <div className={`play-layout${shake ? ' shake' : ''}`}>
        <div className="stack play-main">
          <div className="panel" style={{ padding: '0.5rem' }}>
            <table className="cricket-grid">
              <thead>
                <tr>
                  <th></th>
                  {state.players.map((p, i) => (
                    <th key={i} className={i === state.currentPlayer ? 'col-active' : ''}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRICKET_TARGETS.map((t) => (
                  <tr key={t}>
                    <td className="target">{t === 25 ? 'BULL' : t}</td>
                    {state.players.map((p, i) => {
                      const m = Math.min(p.marks[t], 3);
                      return (
                        <td
                          key={i}
                          className={`marks${m >= 3 ? ' closed' : ''}${
                            i === state.currentPlayer ? ' col-active' : ''
                          }`}
                        >
                          {marksDisplay(m) || '·'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="target">PKT</td>
                  {state.players.map((p, i) => (
                    <td
                      key={i}
                      className={`marks${i === state.currentPlayer ? ' col-active' : ''}`}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {p.points}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="dart-strip">
            {[0, 1, 2].map((i) => {
              const d = state.dartsThisTurn[i];
              return (
                <span key={i} className="dart-chip">
                  {d ? formatDart(d) : '·'}
                </span>
              );
            })}
          </div>
        </div>

        <div className="stack play-side">
          <Keypad
            mode="cricket"
            onDart={onDart}
            onUndo={onUndo}
            onBust={onBust}
            canBust={state.winnerIndex === null}
          />
          <VisitLog state={state} />
        </div>
      </div>

      <div className="footer-bar">
        <button type="button" className="footer-btn" onClick={onQuit}>
          BEENDEN
        </button>
      </div>
    </div>
  );
}
