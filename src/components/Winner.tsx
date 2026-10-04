import { Confetti, isJohannesWinner } from './Confetti';

type Props = {
  name: string;
  onRematch: () => void;
  onHome: () => void;
};

export function Winner({ name, onRematch, onHome }: Props) {
  const johannes = isJohannesWinner(name);

  return (
    <div className="stack winner-wrap">
      {johannes && <Confetti />}
      <h1 className="brand">D A R T S</h1>
      <div className="winner-screen pulse">
        <p className="subtitle">Sieger</p>
        <div className="winner-name">{name}</div>
        {johannes && (
          <p className="johannes-gloat">
            Natürlich hat Johannes gewonnen! Dartmeister im Walsermätteli.
          </p>
        )}
        <button type="button" className="primary-btn" onClick={onRematch} style={{ maxWidth: 320 }}>
          NOCHMAL
        </button>
        <button type="button" className="footer-btn" onClick={onHome}>
          NEUES SPIEL
        </button>
      </div>
    </div>
  );
}
