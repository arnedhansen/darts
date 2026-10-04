export type GameMode = '301' | '501' | 'cricket';

export type Multiplier = 1 | 2 | 3;

export type Dart = {
  segment: number; // 1-20, or 25 for bull, or 0 for miss
  multiplier: Multiplier;
};

export type MatchConfig = {
  mode: GameMode;
  playerNames: string[];
  doubleOut: boolean;
};

export type X01PlayerState = {
  name: string;
  score: number;
};

export type X01TurnDart = Dart & {
  points: number;
  remainingAfter: number;
  bust: boolean;
};

export type X01State = {
  kind: 'x01';
  startScore: 301 | 501;
  doubleOut: boolean;
  players: X01PlayerState[];
  currentPlayer: number;
  dartsThisTurn: X01TurnDart[];
  turnStartScore: number;
  history: X01HistoryEntry[];
  winnerIndex: number | null;
};

export type X01HistoryEntry = {
  playerIndex: number;
  darts: X01TurnDart[];
  scoreBefore: number;
  scoreAfter: number;
  bust: boolean;
};

export type CricketTarget = 15 | 16 | 17 | 18 | 19 | 20 | 25;

export type CricketPlayerState = {
  name: string;
  marks: Record<CricketTarget, number>; // 0-3+
  points: number;
};

export type CricketHistoryEntry = {
  playerIndex: number;
  dart: Dart;
  marksBefore: Record<CricketTarget, number>;
  pointsBefore: number;
};

export type CricketState = {
  kind: 'cricket';
  players: CricketPlayerState[];
  currentPlayer: number;
  dartsThisTurn: Dart[];
  history: CricketHistoryEntry[];
  winnerIndex: number | null;
};

export type MatchState = X01State | CricketState;

export type Screen = 'home' | 'setup' | 'play' | 'winner';

export const CRICKET_TARGETS: CricketTarget[] = [20, 19, 18, 17, 16, 15, 25];

export function dartPoints(dart: Dart): number {
  if (dart.segment === 0) return 0;
  return dart.segment * dart.multiplier;
}

export function formatDart(dart: Dart): string {
  if (dart.segment === 0) return 'VERFEHLT';
  if (dart.segment === 25) {
    return dart.multiplier === 2 ? 'DBULL' : 'BULL';
  }
  const prefix = dart.multiplier === 3 ? 'T' : dart.multiplier === 2 ? 'D' : '';
  return `${prefix}${dart.segment}`;
}
