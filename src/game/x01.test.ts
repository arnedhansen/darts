import { describe, expect, it } from 'vitest';
import { applyX01Dart, checkoutHint, createX01State, undoX01 } from './x01';
import type { MatchConfig } from './types';

const base = (overrides: Partial<MatchConfig> = {}): MatchConfig => ({
  mode: '501',
  playerNames: ['Alice', 'Bob'],
  doubleOut: false,
  ...overrides,
});

describe('x01', () => {
  it('subtracts dart points', () => {
    let s = createX01State(base());
    s = applyX01Dart(s, { segment: 20, multiplier: 3 });
    expect(s.dartsThisTurn[0].remainingAfter).toBe(441);
  });

  it('busts below zero and restores score', () => {
    let s = createX01State(base({ mode: '301' }));
    s = { ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, score: 10 } : p)), turnStartScore: 10 };
    s = applyX01Dart(s, { segment: 20, multiplier: 1 });
    expect(s.history[0].bust).toBe(true);
    expect(s.players[0].score).toBe(10);
    expect(s.currentPlayer).toBe(1);
  });

  it('straight out allows single finish', () => {
    let s = createX01State(base({ mode: '301' }));
    s = {
      ...s,
      players: s.players.map((p, i) => (i === 0 ? { ...p, score: 20 } : p)),
      turnStartScore: 20,
    };
    s = applyX01Dart(s, { segment: 20, multiplier: 1 });
    expect(s.winnerIndex).toBe(0);
    expect(s.players[0].score).toBe(0);
  });

  it('double out requires a double to finish', () => {
    let s = createX01State(base({ mode: '301', doubleOut: true }));
    s = {
      ...s,
      players: s.players.map((p, i) => (i === 0 ? { ...p, score: 20 } : p)),
      turnStartScore: 20,
    };
    s = applyX01Dart(s, { segment: 20, multiplier: 1 });
    expect(s.history[0].bust).toBe(true);
    expect(s.winnerIndex).toBeNull();
  });

  it('double out wins on double', () => {
    let s = createX01State(base({ mode: '301', doubleOut: true }));
    s = {
      ...s,
      players: s.players.map((p, i) => (i === 0 ? { ...p, score: 40 } : p)),
      turnStartScore: 40,
    };
    s = applyX01Dart(s, { segment: 20, multiplier: 2 });
    expect(s.winnerIndex).toBe(0);
  });

  it('double out busts on remaining 1', () => {
    let s = createX01State(base({ mode: '301', doubleOut: true }));
    s = {
      ...s,
      players: s.players.map((p, i) => (i === 0 ? { ...p, score: 21 } : p)),
      turnStartScore: 21,
    };
    s = applyX01Dart(s, { segment: 20, multiplier: 1 });
    expect(s.history[0].bust).toBe(true);
  });

  it('advances after three darts', () => {
    let s = createX01State(base());
    s = applyX01Dart(s, { segment: 1, multiplier: 1 });
    s = applyX01Dart(s, { segment: 1, multiplier: 1 });
    s = applyX01Dart(s, { segment: 1, multiplier: 1 });
    expect(s.currentPlayer).toBe(1);
    expect(s.players[0].score).toBe(498);
    expect(s.dartsThisTurn).toHaveLength(0);
  });

  it('undo restores previous dart', () => {
    let s = createX01State(base());
    s = applyX01Dart(s, { segment: 20, multiplier: 3 });
    s = undoX01(s);
    expect(s.dartsThisTurn).toHaveLength(0);
    expect(s.players[0].score).toBe(501);
  });

  it('checkout hint for D20', () => {
    expect(checkoutHint(40, true)).toBe('D20');
  });
});
