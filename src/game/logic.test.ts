import { describe, expect, it } from 'vitest';
import { type Board, changedSquare, emptyBoard, findWin, isDraw, isOver, LINES, nextPlayer, play, position } from './logic';

const board = (s: string): Board => [...s].map((c) => (c === '.' ? null : (c as 'X' | 'O')));

describe('rules', () => {
  it.each(LINES)('detects a win on %j', (...line) => {
    const cells = emptyBoard().slice();
    line.forEach((i) => (cells[i] = 'O'));
    expect(findWin(cells)).toEqual({ winner: 'O', line });
  });

  it('recognises a draw only when the board is full without a winner', () => {
    const draw = board('XOXXOOOXX');
    expect(isDraw(draw)).toBe(true);
    expect(isOver(draw)).toBe(true);
    expect(isDraw(board('XXXOO....'))).toBe(false);
    expect(isOver(board('X........'))).toBe(false);
  });

  it('alternates turns starting with X', () => {
    expect(nextPlayer(emptyBoard())).toBe('X');
    expect(nextPlayer(board('X........'))).toBe('O');
    expect(nextPlayer(board('XO.......'))).toBe('X');
  });

  it('plays moves immutably and refuses illegal ones', () => {
    const start = emptyBoard();
    const after = play(start, 4);
    expect(after[4]).toBe('X');
    expect(start[4]).toBeNull();
    expect(() => play(after, 4)).toThrow('cannot be played');
    expect(() => play(board('XXXOO....'), 8)).toThrow('cannot be played');
    expect(() => play(start, 9)).toThrow(RangeError);
  });

  it('describes squares by row and column', () => {
    expect(position(0)).toEqual({ row: 1, col: 1 });
    expect(position(5)).toEqual({ row: 2, col: 3 });
    expect(changedSquare(board('X........'), board('X...O....'))).toBe(4);
  });
});
