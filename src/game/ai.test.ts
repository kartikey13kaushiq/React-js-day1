import { describe, expect, it } from 'vitest';
import { bestMove } from './ai';
import { type Board, emptyBoard, findWin, isOver, nextPlayer, play } from './logic';

const board = (s: string): Board => [...s].map((c) => (c === '.' ? null : (c as 'X' | 'O')));

/** Plays every possible sequence of moves for one side against the AI; returns the worst result for the AI. */
function worstOutcomeFor(ai: 'X' | 'O', position: Board = emptyBoard()): 'win' | 'draw' | 'loss' {
  if (isOver(position)) {
    const win = findWin(position);
    return !win ? 'draw' : win.winner === ai ? 'win' : 'loss';
  }
  if (nextPlayer(position) === ai) return worstOutcomeFor(ai, play(position, bestMove(position)));
  const rank = { loss: 0, draw: 1, win: 2 } as const;
  let worst: 'win' | 'draw' | 'loss' = 'win';
  for (let i = 0; i < 9; i++) {
    if (position[i]) continue;
    const result = worstOutcomeFor(ai, play(position, i));
    if (rank[result] < rank[worst]) worst = result;
  }
  return worst;
}

describe('minimax opponent', () => {
  it('takes an immediate win', () => {
    expect(bestMove(board('XX.OO....'))).toBe(2); // X to move completes the top row
    expect(bestMove(board('XX.OO.X..'))).toBe(5); // O to move completes the middle row
  });

  it('blocks an immediate loss', () => {
    expect(bestMove(board('XX..O....'))).toBe(2);
  });

  it('opens in the centre', () => {
    expect(bestMove(emptyBoard())).toBe(4);
  });

  it('never loses as O against every possible sequence of X moves', () => {
    expect(worstOutcomeFor('O')).not.toBe('loss');
  });

  it('never loses as X against every possible sequence of O moves', () => {
    expect(worstOutcomeFor('X')).not.toBe('loss');
  });

  it('refuses to move on a full board', () => {
    expect(() => bestMove(board('XOXXOOOXX'))).toThrow('no moves left');
  });
});
