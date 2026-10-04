import type { Board as BoardState, Line } from '../game/logic';
import { position } from '../game/logic';

interface Props {
  squares: BoardState;
  winningLine: Line | null;
  disabled: boolean;
  onPlay: (index: number) => void;
}

export function Board({ squares, winningLine, disabled, onPlay }: Props) {
  return (
    <div className="board" role="grid" aria-label="Tic-tac-toe board">
      {[0, 1, 2].map((row) => (
        <div className="board-row" role="row" key={row}>
          {[0, 1, 2].map((col) => {
            const index = row * 3 + col;
            const value = squares[index];
            const { row: r, col: c } = position(index);
            const winning = winningLine?.includes(index) ?? false;
            return (
              <button
                type="button"
                role="gridcell"
                key={index}
                className={`square${winning ? ' winning' : ''}${value ? ` ${value.toLowerCase()}` : ''}`}
                aria-label={`Row ${r}, column ${c}: ${value ?? 'empty'}`}
                disabled={disabled || value !== null}
                onClick={() => onPlay(index)}
              >
                {value}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
