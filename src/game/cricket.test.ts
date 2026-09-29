import { describe, expect, it } from 'vitest';
import {
  applyCricketDart,
  createCricketState,
  marksDisplay,
  undoCricket,
} from './cricket';
import type { CricketState, MatchConfig } from './types';
import { CRICKET_TARGETS } from './types';

const base = (): MatchConfig => ({
  mode: 'cricket',
  playerNames: ['Alice', 'Bob'],
  doubleOut: false,
});

function closeAll(state: CricketState, playerIndex: number): CricketState {
  const players = state.players.map((p, i) => {
    if (i !== playerIndex) return p;
    const marks = { ...p.marks };
    for (const t of CRICKET_TARGETS) marks[t] = 3;
    return { ...p, marks };
  });
  return { ...state, players };
}

describe('cricket', () => {
  it('records marks for a target', () => {
    let s = createCricketState(base());
    s = applyCricketDart(s, { segment: 20, multiplier: 3 });
    expect(s.players[0].marks[20]).toBe(3);
    expect(s.players[0].points).toBe(0);
  });

  it('scores points after closing when opponent is open', () => {
    let s = createCricketState(base());
    s = applyCricketDart(s, { segment: 20, multiplier: 3 }); // close 20
    // Still mid-turn with 1 dart; throw another that scores
    // wait - first dart was T20 which closed with 3 marks, no leftover hits
    expect(s.players[0].marks[20]).toBe(3);
    s = applyCricketDart(s, { segment: 20, multiplier: 1 });
    expect(s.players[0].points).toBe(20);
  });

  it('T20 with open board: 3 marks from one dart', () => {
    let s = createCricketState(base());
    s = applyCricketDart(s, { segment: 20, multiplier: 2 });
    expect(s.players[0].marks[20]).toBe(2);
    s = applyCricketDart(s, { segment: 20, multiplier: 2 });
    // 1 mark to close + 1 point hit
    expect(s.players[0].marks[20]).toBe(3);
    expect(s.players[0].points).toBe(20);
  });

  it('does not score when all opponents have closed', () => {
    let s = createCricketState(base());
    // close 20 for both
    s = applyCricketDart(s, { segment: 20, multiplier: 3 });
    s = applyCricketDart(s, { segment: 0, multiplier: 1 });
    s = applyCricketDart(s, { segment: 0, multiplier: 1 }); // end Alice turn
    s = applyCricketDart(s, { segment: 20, multiplier: 3 }); // Bob closes 20
    s = applyCricketDart(s, { segment: 0, multiplier: 1 });
    s = applyCricketDart(s, { segment: 0, multiplier: 1 });
    // Alice hits 20 again — both closed, no points
    const ptsBefore = s.players[0].points;
    s = applyCricketDart(s, { segment: 20, multiplier: 1 });
    expect(s.players[0].points).toBe(ptsBefore);
  });

  it('wins when all closed and points lead', () => {
    let s = createCricketState(base());
    s = closeAll(s, 0);
    s = {
      ...s,
      players: s.players.map((p, i) =>
        i === 0 ? { ...p, points: 10 } : { ...p, points: 0 },
      ),
    };
    // Need to trigger check — apply a miss won't change closed state
    // Winner is checked after each dart; already closed with lead
    // Force check by applying a dart on an already closed board
    s = applyCricketDart(s, { segment: 15, multiplier: 1 });
    expect(s.winnerIndex).toBe(0);
  });

  it('undo restores marks', () => {
    let s = createCricketState(base());
    s = applyCricketDart(s, { segment: 20, multiplier: 1 });
    s = undoCricket(s);
    expect(s.players[0].marks[20]).toBe(0);
    expect(s.dartsThisTurn).toHaveLength(0);
  });

  it('marksDisplay', () => {
    expect(marksDisplay(0)).toBe('');
    expect(marksDisplay(1)).toBe('/');
    expect(marksDisplay(2)).toBe('X');
    expect(marksDisplay(3)).toBe('⊗');
  });
});
