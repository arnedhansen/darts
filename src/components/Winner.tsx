type Props = {
  name: string;
  onRematch: () => void;
  onHome: () => void;
};

export function Winner({ name, onRematch, onHome }: Props) {
  return (
    <div className="stack">
      <h1 className="brand">D A R T S</h1>
      <div className="winner-screen pulse">
        <p className="subtitle">winner</p>
        <div className="winner-name">{name}</div>
        <button type="button" className="primary-btn" onClick={onRematch} style={{ maxWidth: 280 }}>
          REMATCH
        </button>
        <button type="button" className="footer-btn" onClick={onHome}>
          NEW MATCH
        </button>
      </div>
    </div>
  );
}
