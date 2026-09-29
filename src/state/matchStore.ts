import type { Dart, MatchConfig, MatchState, Screen } from '../game/types';
import { createCricketState, applyCricketDart, endCricketTurn, missCricketVisit, undoCricket } from '../game/cricket';
import { createX01State, applyX01Dart, endX01Turn, missX01Visit, undoX01 } from '../game/x01';

const STORAGE_KEY = 'darts-match-v1';
const PLAYERS_KEY = 'darts-players-v1';

export type AppSnapshot = {
  screen: Screen;
  config: MatchConfig | null;
  match: MatchState | null;
};

export function loadSavedPlayerNames(): string[] | null {
  try {
    const raw = localStorage.getItem(PLAYERS_KEY);
    if (!raw) return null;
    const names = JSON.parse(raw) as unknown;
    if (!Array.isArray(names) || names.length < 2 || names.length > 4) return null;
    return names.map((n) => String(n).slice(0, 16) || 'Player');
  } catch {
    return null;
  }
}

export function savePlayerNames(names: string[]) {
  if (names.length < 2 || names.length > 4) return;
  try {
    localStorage.setItem(
      PLAYERS_KEY,
      JSON.stringify(names.map((n, i) => n.trim() || `Player ${i + 1}`)),
    );
  } catch {
    /* ignore */
  }
}

export function defaultConfig(): MatchConfig {
  return {
    mode: '501',
    playerNames: loadSavedPlayerNames() ?? ['Player 1', 'Player 2'],
    doubleOut: false,
  };
}

export function createMatch(config: MatchConfig): MatchState {
  if (config.mode === 'cricket') return createCricketState(config);
  return createX01State(config);
}

export function applyDart(match: MatchState, dart: Dart): MatchState {
  if (match.kind === 'x01') return applyX01Dart(match, dart);
  return applyCricketDart(match, dart);
}

export function endTurn(match: MatchState): MatchState {
  if (match.kind === 'x01') return endX01Turn(match);
  return endCricketTurn(match);
}

export function bustVisit(match: MatchState): MatchState {
  if (match.kind === 'x01') return missX01Visit(match);
  return missCricketVisit(match);
}

export function undo(match: MatchState): MatchState {
  if (match.kind === 'x01') return undoX01(match);
  return undoCricket(match);
}

export function winnerName(match: MatchState): string | null {
  if (match.winnerIndex === null) return null;
  return match.players[match.winnerIndex].name;
}

export function saveSnapshot(snap: AppSnapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
  } catch {
    /* ignore */
  }
}

export function loadSnapshot(): AppSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppSnapshot;
  } catch {
    return null;
  }
}

export function clearSnapshot() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
