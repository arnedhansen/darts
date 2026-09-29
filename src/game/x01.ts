import type { Dart, X01State } from './types';
import { dartPoints } from './types';

export function createX01State(config: {
  mode: '301' | '501' | 'cricket';
  playerNames: string[];
  doubleOut: boolean;
}): X01State {
  const startScore = config.mode === '301' ? 301 : 501;
  return {
    kind: 'x01',
    startScore,
    doubleOut: config.doubleOut,
    players: config.playerNames.map((name) => ({ name, score: startScore })),
    currentPlayer: 0,
    dartsThisTurn: [],
    turnStartScore: startScore,
    history: [],
    winnerIndex: null,
  };
}

function isWinningDouble(dart: Dart): boolean {
  if (dart.segment === 0) return false;
  if (dart.segment === 25) return dart.multiplier === 2;
  return dart.multiplier === 2;
}

/** Apply one dart. Returns updated state (may advance turn on bust / 3 darts / win). */
export function applyX01Dart(state: X01State, dart: Dart): X01State {
  if (state.winnerIndex !== null) return state;

  const player = state.players[state.currentPlayer];
  const remainingBefore =
    state.dartsThisTurn.length === 0
      ? player.score
      : state.dartsThisTurn[state.dartsThisTurn.length - 1].remainingAfter;

  const points = dartPoints(dart);
  let remainingAfter = remainingBefore - points;
  let bust = false;

  if (remainingAfter < 0) {
    bust = true;
  } else if (remainingAfter === 1 && state.doubleOut) {
    bust = true;
  } else if (remainingAfter === 0) {
    if (state.doubleOut && !isWinningDouble(dart)) {
      bust = true;
    }
  }

  const turnDart = {
    ...dart,
    points,
    remainingAfter: bust ? state.turnStartScore : remainingAfter,
    bust,
  };

  const dartsThisTurn = [...state.dartsThisTurn, turnDart];

  if (bust) {
    return finishTurn({ ...state, dartsThisTurn }, true);
  }

  if (remainingAfter === 0) {
    const players = state.players.map((p, i) =>
      i === state.currentPlayer ? { ...p, score: 0 } : p,
    );
    return {
      ...state,
      players,
      dartsThisTurn,
      history: [
        ...state.history,
        {
          playerIndex: state.currentPlayer,
          darts: dartsThisTurn,
          scoreBefore: state.turnStartScore,
          scoreAfter: 0,
          bust: false,
        },
      ],
      winnerIndex: state.currentPlayer,
    };
  }

  if (dartsThisTurn.length >= 3) {
    return finishTurn({ ...state, dartsThisTurn }, false);
  }

  return { ...state, dartsThisTurn };
}

function finishTurn(state: X01State, bust: boolean): X01State {
  const scoreAfter = bust
    ? state.turnStartScore
    : state.dartsThisTurn[state.dartsThisTurn.length - 1].remainingAfter;

  const players = state.players.map((p, i) =>
    i === state.currentPlayer ? { ...p, score: scoreAfter } : p,
  );

  const nextPlayer = (state.currentPlayer + 1) % state.players.length;

  return {
    ...state,
    players,
    history: [
      ...state.history,
      {
        playerIndex: state.currentPlayer,
        darts: state.dartsThisTurn,
        scoreBefore: state.turnStartScore,
        scoreAfter,
        bust,
      },
    ],
    currentPlayer: nextPlayer,
    dartsThisTurn: [],
    turnStartScore: players[nextPlayer].score,
  };
}

/** End turn early (after 1 or 2 darts). */
export function endX01Turn(state: X01State): X01State {
  if (state.winnerIndex !== null) return state;
  if (state.dartsThisTurn.length === 0) return state;
  if (state.dartsThisTurn.some((d) => d.bust)) return state;
  return finishTurn(state, false);
}

/** Zero visit: all darts missed. Clears any mid-turn entry and advances. */
export function missX01Visit(state: X01State): X01State {
  if (state.winnerIndex !== null) return state;

  const miss = {
    segment: 0,
    multiplier: 1 as const,
    points: 0,
    remainingAfter: state.turnStartScore,
    bust: false,
  };

  const players = state.players.map((p, i) =>
    i === state.currentPlayer ? { ...p, score: state.turnStartScore } : p,
  );
  const nextPlayer = (state.currentPlayer + 1) % state.players.length;

  return {
    ...state,
    players,
    history: [
      ...state.history,
      {
        playerIndex: state.currentPlayer,
        darts: [miss, miss, miss],
        scoreBefore: state.turnStartScore,
        scoreAfter: state.turnStartScore,
        bust: false,
      },
    ],
    currentPlayer: nextPlayer,
    dartsThisTurn: [],
    turnStartScore: players[nextPlayer].score,
  };
}

/**
 * Undo last dart.
 * Mid-turn: drop last dart in dartsThisTurn.
 * After a committed turn: reopen that turn without its last dart.
 */
export function undoX01(state: X01State): X01State {
  if (state.dartsThisTurn.length > 0) {
    return {
      ...state,
      dartsThisTurn: state.dartsThisTurn.slice(0, -1),
      winnerIndex: null,
    };
  }

  if (state.history.length === 0) return state;

  const last = state.history[state.history.length - 1];
  const history = state.history.slice(0, -1);
  const players = state.players.map((p, i) =>
    i === last.playerIndex ? { ...p, score: last.scoreBefore } : p,
  );

  const dartsThisTurn = last.darts.slice(0, -1);

  return {
    ...state,
    players,
    history,
    currentPlayer: last.playerIndex,
    dartsThisTurn,
    turnStartScore: last.scoreBefore,
    winnerIndex: null,
  };
}

export function currentRemaining(state: X01State): number {
  const player = state.players[state.currentPlayer];
  if (state.dartsThisTurn.length === 0) return player.score;
  const last = state.dartsThisTurn[state.dartsThisTurn.length - 1];
  if (last.bust) return state.turnStartScore;
  return last.remainingAfter;
}

/** Simple checkout hint for remaining ≤ 170. */
export function checkoutHint(remaining: number, doubleOut: boolean): string | null {
  if (remaining <= 0 || remaining > 170) return null;
  if (!doubleOut) {
    if (remaining <= 20) return `S${remaining}`;
    if (remaining === 25) return 'Bull';
    if (remaining === 50) return 'DBull';
    if (remaining <= 40 && remaining % 2 === 0) return `D${remaining / 2}`;
    if (remaining <= 60 && remaining % 3 === 0) return `T${remaining / 3}`;
    return null;
  }

  const finishes: Record<number, string> = {
    170: 'T20 T20 DBull',
    167: 'T20 T19 DBull',
    164: 'T20 T18 DBull',
    161: 'T20 T17 DBull',
    160: 'T20 T20 D20',
    158: 'T20 T20 D19',
    157: 'T20 T19 D20',
    156: 'T20 T20 D18',
    155: 'T20 T19 D19',
    154: 'T20 T18 D20',
    153: 'T20 T19 D18',
    152: 'T20 T20 D16',
    151: 'T20 T17 D20',
    150: 'T20 T18 D18',
    149: 'T20 T19 D16',
    148: 'T20 T20 D14',
    147: 'T20 T17 D18',
    146: 'T20 T18 D16',
    145: 'T20 T19 D14',
    144: 'T20 T20 D12',
    143: 'T20 T17 D16',
    142: 'T20 T14 D20',
    141: 'T20 T19 D12',
    140: 'T20 T20 D10',
    139: 'T20 T13 D20',
    138: 'T20 T18 D12',
    137: 'T20 T19 D10',
    136: 'T20 T20 D8',
    135: 'T20 T17 D12',
    134: 'T20 T14 D16',
    133: 'T20 T19 D8',
    132: 'T20 T16 D12',
    131: 'T20 T13 D16',
    130: 'T20 T20 D5',
    129: 'T19 T16 D12',
    128: 'T18 T14 D16',
    127: 'T20 T17 D8',
    126: 'T19 T19 D6',
    125: 'T20 T19 D4',
    124: 'T20 T16 D8',
    123: 'T19 T16 D9',
    122: 'T18 T18 D7',
    121: 'T20 T11 D14',
    120: 'T20 S20 D20',
    119: 'T19 T12 D13',
    118: 'T20 T18 D2',
    117: 'T20 T17 D3',
    116: 'T20 T16 D8',
    115: 'T20 T15 D10',
    114: 'T20 T14 D12',
    113: 'T20 T13 D14',
    112: 'T20 T12 D16',
    111: 'T20 T19 D7',
    110: 'T20 T18 D8',
    109: 'T20 T17 D8',
    108: 'T20 T16 D10',
    107: 'T19 T18 D8',
    106: 'T20 T14 D12',
    105: 'T20 T13 D13',
    104: 'T18 T18 D8',
    103: 'T20 T13 D12',
    102: 'T20 T10 D16',
    101: 'T20 T17 D5',
    100: 'T20 D20',
    99: 'T19 S10 D16',
    98: 'T20 D19',
    97: 'T19 D20',
    96: 'T20 D18',
    95: 'T19 D19',
    94: 'T18 D20',
    93: 'T19 D18',
    92: 'T20 D16',
    91: 'T17 D20',
    90: 'T18 D18',
    89: 'T19 D16',
    88: 'T20 D14',
    87: 'T17 D18',
    86: 'T18 D16',
    85: 'T15 D20',
    84: 'T20 D12',
    83: 'T17 D16',
    82: 'Bull D16',
    81: 'T19 D12',
    80: 'T20 D10',
    79: 'T13 D20',
    78: 'T18 D12',
    77: 'T19 D10',
    76: 'T20 D8',
    75: 'T17 D12',
    74: 'T14 D16',
    73: 'T19 D8',
    72: 'T16 D12',
    71: 'T13 D16',
    70: 'T18 D8',
    69: 'T19 D6',
    68: 'T20 D4',
    67: 'T17 D8',
    66: 'T10 D18',
    65: 'T19 D4',
    64: 'T16 D8',
    63: 'T13 D12',
    62: 'T10 D16',
    61: 'T15 D8',
    60: 'S20 D20',
    59: 'S19 D20',
    58: 'S18 D20',
    57: 'S17 D20',
    56: 'T16 D4',
    55: 'S15 D20',
    54: 'S14 D20',
    53: 'S13 D20',
    52: 'S12 D20',
    51: 'S11 D20',
    50: 'DBull',
    49: 'S9 D20',
    48: 'S16 D16',
    47: 'S15 D16',
    46: 'S14 D16',
    45: 'S13 D16',
    44: 'S12 D16',
    43: 'S11 D16',
    42: 'S10 D16',
    41: 'S9 D16',
    40: 'D20',
    39: 'S7 D16',
    38: 'D19',
    37: 'S5 D16',
    36: 'D18',
    35: 'S3 D16',
    34: 'D17',
    33: 'S1 D16',
    32: 'D16',
    31: 'S15 D8',
    30: 'D15',
    29: 'S13 D8',
    28: 'D14',
    27: 'S11 D8',
    26: 'D13',
    25: 'S9 D8',
    24: 'D12',
    23: 'S7 D8',
    22: 'D11',
    21: 'S5 D8',
    20: 'D10',
    19: 'S3 D8',
    18: 'D9',
    17: 'S1 D8',
    16: 'D8',
    15: 'S7 D4',
    14: 'D7',
    13: 'S5 D4',
    12: 'D6',
    11: 'S3 D4',
    10: 'D5',
    9: 'S1 D4',
    8: 'D4',
    7: 'S3 D2',
    6: 'D3',
    5: 'S1 D2',
    4: 'D2',
    3: 'S1 D1',
    2: 'D1',
  };

  return finishes[remaining] ?? null;
}
