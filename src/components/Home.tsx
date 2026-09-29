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
        <button type="button" className="primary-btn" onClick={onStart} style={{ maxWidth: 320 }}>
          START MATCH
        </button>
        {onContinue && (
          <button type="button" className="footer-btn" onClick={onContinue}>
            RESUME MATCH
          </button>
        )}
      </div>
      <div className="footer-bar">
        <button type="button" className="footer-btn" onClick={onToggleMute}>
          {muted ? 'SOUND OFF' : 'SOUND ON'}
        </button>
        <button type="button" className="footer-btn" onClick={onInstall}>
          INSTALL
        </button>
      </div>
    </div>
  );
}
