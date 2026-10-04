import type { Multiplier, Dart } from '../game/types';
import { playTap } from '../audio/sounds';
import { useState } from 'react';

type Props = {
  mode: 'x01' | 'cricket';
  onDart: (dart: Dart) => void;
  onUndo: () => void;
  onEndTurn: () => void;
  onBust: () => void;
  canEndTurn: boolean;
  canBust: boolean;
};

export function Keypad({ mode, onDart, onUndo, onEndTurn, onBust, canEndTurn, canBust }: Props) {
  const [mult, setMult] = useState<Multiplier>(1);

  const fire = (segment: number, forcedMult?: Multiplier) => {
    playTap();
    const multiplier = forcedMult ?? (segment === 0 ? 1 : mult);
    onDart({ segment, multiplier });
    setMult(1);
  };

  const setM = (m: Multiplier) => {
    playTap();
    setMult((cur) => (cur === m ? 1 : m));
  };

  const numbers =
    mode === 'cricket'
      ? [20, 19, 18, 17, 16, 15, 25]
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25];

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'center' }}>
        <button
          type="button"
          className={`key${mult === 1 ? ' mult-active' : ''}`}
          onClick={() => setM(1)}
          style={{ flex: 1 }}
        >
          EINFACH
        </button>
        <button
          type="button"
          className={`key${mult === 2 ? ' mult-active' : ''}`}
          onClick={() => setM(2)}
          style={{ flex: 1 }}
        >
          DOPPEL
        </button>
        <button
          type="button"
          className={`key${mult === 3 ? ' mult-active' : ''}`}
          onClick={() => setM(3)}
          style={{ flex: 1 }}
        >
          TRIPLE
        </button>
      </div>

      <div className="keypad">
        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            className="key"
            onClick={() => {
              if (n === 25 && mult === 3) fire(25, 2);
              else fire(n);
            }}
          >
            {n === 25 ? 'BULL' : n}
          </button>
        ))}
        <button type="button" className="key accent" onClick={() => fire(0, 1)}>
          VERFEHLT
        </button>
        <button
          type="button"
          className="key danger key-small"
          onClick={onBust}
          disabled={!canBust}
          style={{ opacity: canBust ? 1 : 0.4 }}
        >
          ALLES VERFEHLT
        </button>
        <button type="button" className="key danger" onClick={onUndo}>
          RÜCKGÄNGIG
        </button>
        <button
          type="button"
          className="key accent wide"
          onClick={onEndTurn}
          disabled={!canEndTurn}
          style={{ opacity: canEndTurn ? 1 : 0.4 }}
        >
          ZUG ENDE
        </button>
      </div>
    </div>
  );
}
