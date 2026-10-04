import { useEffect, useMemo, useState } from 'react';
import type { Dart, MatchConfig, MatchState, Screen } from './game/types';
import {
  applyDart,
  bustVisit,
  clearSnapshot,
  createMatch,
  defaultConfig,
  loadSnapshot,
  savePlayerNames,
  saveSnapshot,
  undo,
  winnerName,
} from './state/matchStore';
import {
  isMuted,
  loadMuted,
  playBust,
  playConfirm,
  playWin,
  resumeAudio,
  setMuted,
} from './audio/sounds';
import { Toast } from './components/Toast';
import { Home } from './components/Home';
import { Setup } from './components/Setup';
import { X01Board } from './components/X01Board';
import { CricketBoard } from './components/CricketBoard';
import { Winner } from './components/Winner';
import { ConfirmModal } from './components/ConfirmModal';
import { InstallHint } from './components/InstallHint';

function toastForMatch(match: MatchState | null, lastEvent: string): { message: string; tone: 'normal' | 'danger' | 'success' } {
  if (!match) return { message: 'Bereit', tone: 'normal' };
  if (lastEvent === 'bust') return { message: 'ALLES VERFEHLT', tone: 'danger' };
  if (match.winnerIndex !== null) {
    return { message: `${match.players[match.winnerIndex].name} gewinnt!`, tone: 'success' };
  }
  const name = match.players[match.currentPlayer].name;
  const dartsLeft = 3 - match.dartsThisTurn.length;
  return {
    message: `${name} · ${dartsLeft} Pfeil${dartsLeft === 1 ? '' : 'e'} übrig`,
    tone: 'normal',
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [config, setConfig] = useState<MatchConfig>(defaultConfig);
  const [match, setMatch] = useState<MatchState | null>(null);
  const [muted, setMutedState] = useState(() => loadMuted());
  const [shake, setShake] = useState(false);
  const [lastEvent, setLastEvent] = useState('');
  const [quitOpen, setQuitOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    const snap = loadSnapshot();
    if (snap?.match && snap.screen === 'play') {
      setHasResume(true);
    }
  }, []);

  useEffect(() => {
    if (screen === 'play' && match) {
      saveSnapshot({ screen, config, match });
      setHasResume(true);
    }
  }, [screen, config, match]);

  const toast = useMemo(() => toastForMatch(match, lastEvent), [match, lastEvent]);

  const goHome = () => {
    setScreen('home');
    setMatch(null);
    setLastEvent('');
    clearSnapshot();
    setHasResume(false);
  };

  const startFromConfig = (cfg: MatchConfig) => {
    const names = cfg.playerNames.map((n, i) => n.trim() || `Spieler ${i + 1}`);
    const next = { ...cfg, playerNames: names };
    savePlayerNames(names);
    setConfig(next);
    setMatch(createMatch(next));
    setLastEvent('');
    setScreen('play');
  };

  const handleDart = (dart: Dart) => {
    resumeAudio();
    if (!match || match.winnerIndex !== null) return;

    const prevPlayer = match.currentPlayer;
    const next = applyDart(match, dart);

    let event = 'dart';
    if (next.kind === 'x01') {
      const lastHist = next.history[next.history.length - 1];
      if (lastHist?.bust && lastHist.playerIndex === prevPlayer) {
        event = 'bust';
        playBust();
        setShake(true);
        setTimeout(() => setShake(false), 320);
      } else if (next.winnerIndex !== null) {
        event = 'win';
        playWin();
      } else if (next.currentPlayer !== prevPlayer) {
        playConfirm();
      }
    } else {
      if (next.winnerIndex !== null) {
        event = 'win';
        playWin();
      } else if (next.currentPlayer !== prevPlayer) {
        playConfirm();
      }
    }

    setLastEvent(event);
    setMatch(next);

    if (next.winnerIndex !== null) {
      setTimeout(() => setScreen('winner'), 650);
    }
  };

  const handleUndo = () => {
    resumeAudio();
    if (!match) return;
    setMatch(undo(match));
    setLastEvent('undo');
  };

  const handleBust = () => {
    resumeAudio();
    if (!match || match.winnerIndex !== null) return;
    playBust();
    setShake(true);
    setTimeout(() => setShake(false), 320);
    setMatch(bustVisit(match));
    setLastEvent('bust');
  };

  const toggleMute = () => {
    const next = !isMuted();
    setMuted(next);
    setMutedState(next);
  };

  const resume = () => {
    const snap = loadSnapshot();
    if (!snap?.match) return;
    setConfig(snap.config ?? defaultConfig());
    setMatch(snap.match);
    setScreen('play');
  };

  return (
    <div className="app">
      <Toast message={toast.message} tone={toast.tone} />

      {screen === 'home' && (
        <Home
          onStart={() => {
            resumeAudio();
            setConfig(defaultConfig());
            setScreen('setup');
          }}
          onContinue={hasResume ? resume : undefined}
          muted={muted}
          onToggleMute={toggleMute}
          onInstall={() => setInstallOpen(true)}
        />
      )}

      {screen === 'setup' && (
        <Setup
          config={config}
          onChange={(cfg) => {
            setConfig(cfg);
            savePlayerNames(cfg.playerNames);
          }}
          onBack={() => setScreen('home')}
          onPlay={() => {
            resumeAudio();
            startFromConfig(config);
          }}
        />
      )}

      {screen === 'play' && match?.kind === 'x01' && (
        <X01Board
          state={match}
          shake={shake}
          onDart={handleDart}
          onUndo={handleUndo}
          onBust={handleBust}
          onQuit={() => setQuitOpen(true)}
        />
      )}

      {screen === 'play' && match?.kind === 'cricket' && (
        <CricketBoard
          state={match}
          shake={shake}
          onDart={handleDart}
          onUndo={handleUndo}
          onBust={handleBust}
          onQuit={() => setQuitOpen(true)}
        />
      )}

      {screen === 'winner' && match && (
        <Winner
          name={winnerName(match) ?? 'Sieger'}
          onRematch={() => startFromConfig(config)}
          onHome={goHome}
        />
      )}

      <ConfirmModal
        open={quitOpen}
        title="Spiel beenden?"
        message="Der Fortschritt dieses Spiels wird gelöscht."
        confirmLabel="BEENDEN"
        cancelLabel="WEITERSPIELEN"
        onCancel={() => setQuitOpen(false)}
        onConfirm={() => {
          setQuitOpen(false);
          goHome();
        }}
      />

      <InstallHint open={installOpen} onClose={() => setInstallOpen(false)} />
    </div>
  );
}
