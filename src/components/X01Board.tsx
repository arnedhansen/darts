import type { X01State, Dart } from '../game/types';
import { formatDart } from '../game/types';
import { checkoutHint, currentRemaining } from '../game/x01';
import { Keypad } from './Keypad';
import { VisitLog } from './VisitLog';

type Props = {
  state: X01State;
  shake: boolean;
  onDart: (dart: Dart) => void;
  onUndo: () => void;
  onBust: () => void;
  onQuit: () => void;
};

export function X01Board({ state, shake, onDart, onUndo, onBust, onQuit }: Props) {
  const remaining = currentRemaining(state);
  const hint = checkoutHint(remaining, state.doubleOut);

  return (
    <div className="stack">
      <h1 className="brand">D A R T S</h1>
      <p className="subtitle">
        {state.startScore}
        {state.doubleOut ? ' · Double Out' : ' · Straight Out'}
      </p>

      <div className={`play-layout${shake ? ' shake' : ''}`}>
        <div className="stack">
          <div className="scoreboard">
            {state.players.map((p, i) => (
              <div
                key={i}
                className={`player-card${i === state.currentPlayer ? ' active' : ''}${
                  state.winnerIndex === i ? ' winner' : ''
                }`}
              >
                <div>
                  <div className="player-name">{p.name}</div>
                  {i === state.currentPlayer && hint && (
                    <div className="muted-note" style={{ textAlign: 'left', marginTop: 4 }}>
                      Tipp {hint}
                    </div>
                  )}
                </div>
                <div className="player-score">
                  {i === state.currentPlayer && state.dartsThisTurn.length > 0
                    ? remaining
                    : p.score}
                </div>
              </div>
            ))}
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

          <VisitLog state={state} />
        </div>

        <Keypad
          mode="x01"
          onDart={onDart}
          onUndo={onUndo}
          onBust={onBust}
          canBust={state.winnerIndex === null}
        />
      </div>

      <div className="footer-bar">
        <button type="button" className="footer-btn" onClick={onQuit}>
          BEENDEN
        </button>
      </div>
    </div>
  );
}
