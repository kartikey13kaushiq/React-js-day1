import { useEffect, useState } from 'react';
import { bestMove } from '../game/ai';
import { type Board as BoardState, changedSquare, emptyBoard, findWin, isOver, nextPlayer, play, position } from '../game/logic';
import { Board } from './Board';

export type Mode = 'two-players' | 'vs-computer';
export const COMPUTER_DELAY_MS = 250;
const COMPUTER = 'O' as const;

export function Game() {
  const [history, setHistory] = useState<BoardState[]>([emptyBoard()]);
  const [currentMove, setCurrentMove] = useState(0);
  const [ascending, setAscending] = useState(true);
  const [mode, setMode] = useState<Mode>('two-players');

  const squares = history[currentMove];
  const win = findWin(squares);
  const over = isOver(squares);
  const toMove = nextPlayer(squares);
  const computersTurn = mode === 'vs-computer' && toMove === COMPUTER && !over;

  function commit(nextSquares: BoardState) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  // The computer replies after a short pause, including when you travel back to a position where it is to move.
  useEffect(() => {
    if (!computersTurn) return;
    const timer = setTimeout(() => commit(play(squares, bestMove(squares))), COMPUTER_DELAY_MS);
    return () => clearTimeout(timer);
  });

  function changeMode(next: Mode) {
    setMode(next);
    setHistory([emptyBoard()]);
    setCurrentMove(0);
  }

  let status: string;
  if (win) status = mode === 'vs-computer' ? (win.winner === COMPUTER ? 'The computer wins' : 'You win!') : `Winner: ${win.winner}`;
  else if (over) status = "It's a draw";
  else if (computersTurn) status = 'Computer is thinking…';
  else status = `Next player: ${toMove}`;

  const moves = history.map((board, move) => {
    let label = 'Go to game start';
    if (move > 0) {
      const square = changedSquare(history[move - 1], board);
      const { row, col } = position(square);
      label = `Go to move #${move} (${board[square]} at row ${row}, col ${col})`;
    }
    return (
      <li key={move}>
        {move === currentMove ? (
          <span className="current" aria-current="step">
            {move === 0 ? 'You are at the start' : `You are at move #${move}`}
          </span>
        ) : (
          <button type="button" onClick={() => setCurrentMove(move)}>{label}</button>
        )}
      </li>
    );
  });

  return (
    <main className="game">
      <header>
        <h1>Tic-tac-toe</h1>
        <div className="mode" role="radiogroup" aria-label="Opponent">
          <label>
            <input type="radio" name="mode" checked={mode === 'two-players'} onChange={() => changeMode('two-players')} />
            Two players
          </label>
          <label>
            <input type="radio" name="mode" checked={mode === 'vs-computer'} onChange={() => changeMode('vs-computer')} />
            Play the computer
          </label>
        </div>
      </header>
      <section className="game-board">
        <p className="status" role="status" aria-live="polite">{status}</p>
        <Board
          squares={squares}
          winningLine={win?.line ?? null}
          disabled={over || computersTurn}
          onPlay={(i) => commit(play(squares, i))}
        />
        <button type="button" className="secondary" onClick={() => changeMode(mode)}>New game</button>
      </section>
      <section className="game-info" aria-label="Move history">
        <button type="button" className="secondary" onClick={() => setAscending(!ascending)}>
          Sort {ascending ? 'newest first' : 'oldest first'}
        </button>
        <ol>{ascending ? moves : [...moves].reverse()}</ol>
      </section>
    </main>
  );
}
