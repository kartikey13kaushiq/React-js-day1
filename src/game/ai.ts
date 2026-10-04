import { type Board, findWin, nextPlayer, play, type Player } from './logic';

// Centre, then corners, then edges: among equally good moves, play the one a strong human would.
const PREFERENCE = [4, 0, 2, 6, 8, 1, 3, 5, 7];
const memo = new Map<string, number>();

/**
 * Minimax score of a position from the point of view of `me`: positive is a win, negative a loss, 0 a draw.
 * Quicker wins and slower losses score higher, so the computer finishes games instead of toying with them.
 */
function score(board: Board, me: Player, depth: number): number {
  const key = `${board.map((c) => c ?? '-').join('')}${me}${depth}`;
  const cached = memo.get(key);
  if (cached !== undefined) return cached;

  const win = findWin(board);
  let result: number;
  if (win) {
    result = win.winner === me ? 10 - depth : depth - 10;
  } else if (board.every(Boolean)) {
    result = 0;
  } else {
    const maximising = nextPlayer(board) === me;
    result = maximising ? -Infinity : Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i]) continue;
      const value = score(play(board, i), me, depth + 1);
      result = maximising ? Math.max(result, value) : Math.min(result, value);
    }
  }
  memo.set(key, result);
  return result;
}

/** The best square for the player whose turn it is. Never loses. */
export function bestMove(board: Board): number {
  const me = nextPlayer(board);
  let best = -1;
  let bestScore = -Infinity;
  for (const i of PREFERENCE) {
    if (board[i]) continue;
    const value = score(play(board, i), me, 1);
    if (value > bestScore) {
      bestScore = value;
      best = i;
    }
  }
  if (best === -1) throw new Error('no moves left');
  return best;
}
