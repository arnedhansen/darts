import type { GameMode, MatchConfig } from '../game/types';

type Props = {
  config: MatchConfig;
  onChange: (config: MatchConfig) => void;
  onBack: () => void;
  onPlay: () => void;
};

export function Setup({ config, onChange, onBack, onPlay }: Props) {
  const setMode = (mode: GameMode) => onChange({ ...config, mode });

  const setName = (index: number, name: string) => {
    const playerNames = config.playerNames.map((n, i) => (i === index ? name : n));
    onChange({ ...config, playerNames });
  };

  const addPlayer = () => {
    if (config.playerNames.length >= 4) return;
    const n = config.playerNames.length + 1;
    onChange({
      ...config,
      playerNames: [...config.playerNames, `Spieler ${n}`],
    });
  };

  const removePlayer = (index: number) => {
    if (config.playerNames.length <= 2) return;
    onChange({
      ...config,
      playerNames: config.playerNames.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="stack">
      <h1 className="brand">D A R T S</h1>
      <p className="subtitle">Einstellungen</p>

      <div className="panel stack">
        <div className="label">Spiel</div>
        <div className="seg">
          {(['301', '501', 'cricket'] as GameMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`seg-btn${config.mode === mode ? ' active' : ''}`}
              onClick={() => setMode(mode)}
            >
              {mode === 'cricket' ? 'CRICKET' : mode}
            </button>
          ))}
        </div>

        {config.mode !== 'cricket' && (
          <button
            type="button"
            className="toggle"
            onClick={() => onChange({ ...config, doubleOut: !config.doubleOut })}
          >
            <span className="label" style={{ letterSpacing: '0.04em' }}>
              Double Out
            </span>
            <span className={`toggle-switch${config.doubleOut ? ' on' : ''}`} />
          </button>
        )}

        <div className="label">Spieler ({config.playerNames.length})</div>
        <div className="player-list">
          {config.playerNames.map((name, i) => (
            <div className="player-edit" key={i}>
              <input
                className="field grow"
                value={name}
                maxLength={16}
                onChange={(e) => setName(i, e.target.value)}
                aria-label={`Name Spieler ${i + 1}`}
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => removePlayer(i)}
                disabled={config.playerNames.length <= 2}
                aria-label="Spieler entfernen"
              >
                −
              </button>
            </div>
          ))}
        </div>
        {config.playerNames.length < 4 && (
          <button type="button" className="footer-btn" onClick={addPlayer}>
            SPIELER HINZUFÜGEN
          </button>
        )}
      </div>

      <button type="button" className="primary-btn" onClick={onPlay}>
        STARTEN
      </button>
      <div className="footer-bar">
        <button type="button" className="footer-btn" onClick={onBack}>
          ZURÜCK
        </button>
      </div>
    </div>
  );
}
