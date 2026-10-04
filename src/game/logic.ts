export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = readonly Cell[];
export type Line = readonly [number, number, number];

export const LINES: readonly Line[] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

export interface Win {
  winner: Player;
  line: Line;
}

export function emptyBoard(): Board {
  return Array<Cell>(9).fill(null);
}

export function findWin(board: Board): Win | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    const mark = board[a];
    if (mark && mark === board[b] && mark === board[c]) {
      return { winner: mark, line };
    }
  }
  return null;
}

export function isDraw(board: Board): boolean {
  return board.every(Boolean) && !findWin(board);
}

export function isOver(board: Board): boolean {
  return findWin(board) !== null || board.every(Boolean);
}

/** X always moves first, so whoever has placed fewer marks moves next. */
export function nextPlayer(board: Board): Player {
  const placed = board.filter(Boolean).length;
  return placed % 2 === 0 ? 'X' : 'O';
}

export function play(board: Board, index: number): Board {
  if (!Number.isInteger(index) || index < 0 || index > 8) {
    throw new RangeError(`square ${index} does not exist`);
  }
  if (board[index] || isOver(board)) {
    throw new Error(`square ${index} cannot be played`);
  }
  const next = board.slice();
  next[index] = nextPlayer(board);
  return next;
}

/** 1-based row and column of a square, for move descriptions and screen readers. */
export function position(index: number): { row: number; col: number } {
  return { row: Math.floor(index / 3) + 1, col: (index % 3) + 1 };
}

/** The square that changed between two consecutive boards. */
export function changedSquare(before: Board, after: Board): number {
  return after.findIndex((cell, i) => cell !== before[i]);
}
