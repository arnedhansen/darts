import type {
  CricketHistoryEntry,
  CricketPlayerState,
  CricketState,
  CricketTarget,
  Dart,
  MatchConfig,
} from './types';
import { CRICKET_TARGETS } from './types';

function emptyMarks(): Record<CricketTarget, number> {
  return { 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0 };
}

export function createCricketState(config: MatchConfig): CricketState {
  return {
    kind: 'cricket',
    players: config.playerNames.map((name) => ({
      name,
      marks: emptyMarks(),
      points: 0,
    })),
    currentPlayer: 0,
    dartsThisTurn: [],
    history: [],
    winnerIndex: null,
  };
}

function isCricketTarget(segment: number): segment is CricketTarget {
  return CRICKET_TARGETS.includes(segment as CricketTarget);
}

function allClosed(player: CricketPlayerState): boolean {
  return CRICKET_TARGETS.every((t) => player.marks[t] >= 3);
}

function checkWinner(players: CricketPlayerState[]): number | null {
  for (let i = 0; i < players.length; i++) {
    if (!allClosed(players[i])) continue;
    const pts = players[i].points;
    if (players.every((p, j) => j === i || pts >= p.points)) {
      return i;
    }
  }
  return null;
}

/** Apply one dart in cricket. Misses / non-targets count as a dart but do nothing. */
export function applyCricketDart(state: CricketState, dart: Dart): CricketState {
  if (state.winnerIndex !== null) return state;

  let effective = dart;
  if (dart.segment === 25 && dart.multiplier === 3) {
    effective = { segment: 25, multiplier: 2 };
  }

  const playerIndex = state.currentPlayer;
  const player = state.players[playerIndex];
  const marksBefore = { ...player.marks };
  const pointsBefore = player.points;

  const historyEntry: CricketHistoryEntry = {
    playerIndex,
    dart: effective,
    marksBefore,
    pointsBefore,
  };

  const players = state.players.map((p) => ({
    ...p,
    marks: { ...p.marks },
  }));

  if (isCricketTarget(effective.segment)) {
    const target = effective.segment;
    let hits = effective.multiplier;
    let marks = players[playerIndex].marks[target];
    let points = players[playerIndex].points;

    while (hits > 0) {
      if (marks < 3) {
        marks += 1;
        hits -= 1;
      } else {
        const opponentsOpen = players.some(
          (p, i) => i !== playerIndex && p.marks[target] < 3,
        );
        if (opponentsOpen) {
          points += target;
        }
        hits -= 1;
      }
    }

    players[playerIndex].marks[target] = marks;
    players[playerIndex].points = points;
  }

  const dartsThisTurn = [...state.dartsThisTurn, effective];
  const winnerIndex = checkWinner(players);

  if (winnerIndex !== null) {
    return {
      ...state,
      players,
      dartsThisTurn,
      history: [...state.history, historyEntry],
      winnerIndex,
    };
  }

  if (dartsThisTurn.length >= 3) {
    const nextPlayer = (playerIndex + 1) % players.length;
    return {
      ...state,
      players,
      history: [...state.history, historyEntry],
      currentPlayer: nextPlayer,
      dartsThisTurn: [],
    };
  }

  return {
    ...state,
    players,
    dartsThisTurn,
    history: [...state.history, historyEntry],
  };
}

export function endCricketTurn(state: CricketState): CricketState {
  if (state.winnerIndex !== null) return state;
  if (state.dartsThisTurn.length === 0) return state;
  const nextPlayer = (state.currentPlayer + 1) % state.players.length;
  return {
    ...state,
    currentPlayer: nextPlayer,
    dartsThisTurn: [],
  };
}

/** Zero visit: all darts missed. Clears mid-turn throws and advances. */
export function missCricketVisit(state: CricketState): CricketState {
  if (state.winnerIndex !== null) return state;

  let s = state;
  while (s.dartsThisTurn.length > 0) {
    s = undoCricket(s);
  }
  s = applyCricketDart(s, { segment: 0, multiplier: 1 });
  s = applyCricketDart(s, { segment: 0, multiplier: 1 });
  s = applyCricketDart(s, { segment: 0, multiplier: 1 });
  return s;
}

type CricketTurn = { playerIndex: number; darts: Dart[] };

function groupCricketTurns(history: CricketHistoryEntry[]): CricketTurn[] {
  const turns: CricketTurn[] = [];
  for (const entry of history) {
    const last = turns[turns.length - 1];
    if (last && last.playerIndex === entry.playerIndex && last.darts.length < 3) {
      last.darts.push(entry.dart);
    } else {
      turns.push({ playerIndex: entry.playerIndex, darts: [entry.dart] });
    }
  }
  return turns;
}

export function undoCricket(state: CricketState): CricketState {
  if (state.history.length === 0) return state;

  const history = state.history.slice(0, -1);
  const last = state.history[state.history.length - 1];

  const players = state.players.map((p, i) => {
    if (i !== last.playerIndex) return p;
    return {
      ...p,
      marks: { ...last.marksBefore },
      points: last.pointsBefore,
    };
  });

  const regrouped = groupCricketTurns(history);
  const open = regrouped[regrouped.length - 1];

  let dartsThisTurn: Dart[] = [];
  let currentPlayer = last.playerIndex;

  if (open && open.darts.length > 0 && open.darts.length < 3 && open.playerIndex === last.playerIndex) {
    dartsThisTurn = open.darts;
    currentPlayer = open.playerIndex;
  } else {
    dartsThisTurn = [];
    currentPlayer = last.playerIndex;
  }

  return {
    ...state,
    players,
    history,
    currentPlayer,
    dartsThisTurn,
    winnerIndex: null,
  };
}

export function marksDisplay(count: number): string {
  if (count <= 0) return '';
  if (count === 1) return '/';
  if (count === 2) return 'X';
  return '⊗';
}
