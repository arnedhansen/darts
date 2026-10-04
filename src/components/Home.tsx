type Props = {
  onContinue?: () => void;
  onStart: () => void;
  muted: boolean;
  onToggleMute: () => void;
  onInstall: () => void;
};

export function Home({ onContinue, onStart, muted, onToggleMute, onInstall }: Props) {
  return (
    <div className="stack">
      <h1 className="brand">D A R T S</h1>
      <div className="home-hero">
        <button type="button" className="primary-btn" onClick={onStart} style={{ maxWidth: 360 }}>
          SPIEL STARTEN
        </button>
        {onContinue && (
          <button type="button" className="footer-btn" onClick={onContinue}>
            SPIEL FORTSETZEN
          </button>
        )}
      </div>
      <div className="footer-bar">
        <button type="button" className="footer-btn" onClick={onToggleMute}>
          {muted ? 'TON AUS' : 'TON AN'}
        </button>
        <button type="button" className="footer-btn" onClick={onInstall}>
          INSTALLIEREN
        </button>
      </div>
    </div>
  );
}
