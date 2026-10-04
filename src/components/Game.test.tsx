import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Game } from './Game';

const square = (row: number, col: number) => screen.getByRole('gridcell', { name: new RegExp(`^Row ${row}, column ${col}:`) });

async function clickSquares(user: ReturnType<typeof userEvent.setup>, ...cells: [number, number][]) {
  for (const [r, c] of cells) await user.click(square(r, c));
}

describe('two players', () => {
  it('plays to a win, highlights the line and locks the board', async () => {
    const user = userEvent.setup();
    render(<Game />);
    expect(screen.getByRole('status')).toHaveTextContent('Next player: X');
    await clickSquares(user, [1, 1], [2, 1], [1, 2], [2, 2], [1, 3]);
    expect(screen.getByRole('status')).toHaveTextContent('Winner: X');
    for (const c of [1, 2, 3]) expect(square(1, c)).toHaveClass('winning');
    expect(square(3, 3)).toBeDisabled();
  });

  it('reports a draw', async () => {
    const user = userEvent.setup();
    render(<Game />);
    await clickSquares(user, [1, 1], [1, 2], [1, 3], [2, 2], [2, 1], [2, 3], [3, 2], [3, 1], [3, 3]);
    expect(screen.getByRole('status')).toHaveTextContent("It's a draw");
  });

  it('travels back in time, branches, and sorts the history', async () => {
    const user = userEvent.setup();
    render(<Game />);
    await clickSquares(user, [2, 2], [1, 1], [3, 3]);
    const history = screen.getByRole('region', { name: 'Move history' });
    expect(within(history).getByText('You are at move #3')).toBeInTheDocument();
    expect(within(history).getByRole('button', { name: 'Go to move #2 (O at row 1, col 1)' })).toBeInTheDocument();

    await user.click(within(history).getByRole('button', { name: /Go to move #1/ }));
    expect(square(1, 1)).toHaveAccessibleName('Row 1, column 1: empty');
    expect(screen.getByRole('status')).toHaveTextContent('Next player: O');

    await user.click(square(1, 3)); // a new branch discards the old future
    expect(within(history).queryByRole('button', { name: /move #3/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sort newest first' }));
    const items = within(history).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('You are at move #2');
    expect(items.at(-1)).toHaveTextContent('Go to game start');
  });
});

describe('against the computer', () => {
  it('answers each move and blocks a winning threat', async () => {
    const user = userEvent.setup();
    render(<Game />);
    await user.click(screen.getByRole('radio', { name: 'Play the computer' }));
    await user.click(square(1, 1));
    expect(await screen.findByRole('gridcell', { name: 'Row 2, column 2: O' })).toBeInTheDocument();
    await user.click(square(1, 2)); // threatens the top row
    expect(await screen.findByRole('gridcell', { name: 'Row 1, column 3: O' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Next player: X');
  });

  it('punishes a weak line with a fork, and New game resets', async () => {
    const user = userEvent.setup();
    render(<Game />);
    await user.click(screen.getByRole('radio', { name: 'Play the computer' }));
    // Each X move, followed by the computer's (deterministic) reply.
    const script: [[number, number], string][] = [
      [[1, 2], 'Row 2, column 2: O'],
      [[3, 2], 'Row 1, column 1: O'],
      [[3, 3], 'Row 3, column 1: O'], // blocks the bottom row and creates two threats at once
      [[2, 1], 'Row 1, column 3: O'], // X can only block one of them
    ];
    for (const [[row, col], reply] of script) {
      await user.click(square(row, col));
      expect(await screen.findByRole('gridcell', { name: reply })).toBeInTheDocument();
    }
    expect(screen.getByRole('status')).toHaveTextContent('The computer wins');
    for (const [r, c] of [[1, 3], [2, 2], [3, 1]] as const) expect(square(r, c)).toHaveClass('winning');

    await user.click(screen.getByRole('button', { name: 'New game' }));
    expect(screen.getByRole('status')).toHaveTextContent('Next player: X');
    expect(square(2, 2)).toHaveAccessibleName('Row 2, column 2: empty');
  });
});
