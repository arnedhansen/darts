import type { X01State } from '../game/types';
import { formatDart } from '../game/types';
import { checkoutHint, currentRemaining } from '../game/x01';
import { Keypad } from './Keypad';
import type { Dart } from '../game/types';

type Props = {
  state: X01State;
  shake: boolean;
  onDart: (dart: Dart) => void;
  onUndo: () => void;
  onEndTurn: () => void;
  onQuit: () => void;
};

export function X01Board({ state, shake, onDart, onUndo, onEndTurn, onQuit }: Props) {
  const remaining = currentRemaining(state);
  const hint = checkoutHint(remaining, state.doubleOut);
  const active = state.players[state.currentPlayer];

  return (
    <div className="stack">
      <h1 className="brand">D A R T S</h1>
      <p className="subtitle">
        {state.startScore}
        {state.doubleOut ? ' · double out' : ' · straight out'}
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
                      hint {hint}
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
          <p className="muted-note">{active.name} to throw</p>
        </div>

        <Keypad
          mode="x01"
          onDart={onDart}
          onUndo={onUndo}
          onEndTurn={onEndTurn}
          canEndTurn={state.dartsThisTurn.length > 0 && state.winnerIndex === null}
        />
      </div>

      <div className="footer-bar">
        <button type="button" className="footer-btn" onClick={onQuit}>
          QUIT
        </button>
      </div>
    </div>
  );
}
