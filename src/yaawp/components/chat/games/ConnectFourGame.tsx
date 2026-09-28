import React from 'react';
import { useTemporaryGames } from '../../../context/TemporaryGamesContext';
import { C4_COLS, C4_ROWS } from '../../../utils/gameEngine';
import { Trophy, RefreshCw, ArrowDown } from 'lucide-react';

interface ConnectFourGameProps {
  gameId: string;
  hostName: string;
  opponentName: string;
  isHost: boolean;
  compact?: boolean;
}

export const ConnectFourGame: React.FC<ConnectFourGameProps> = ({
  gameId,
  hostName,
  opponentName,
  isHost,
  compact = false,
}) => {
  const { getActiveGame, makePlayerMove, resetGame } = useTemporaryGames();
  const game = getActiveGame(gameId);

  if (!game || !game.state) {
    return (
      <div className="p-4 text-center text-xs text-slate-500">
        Game session expired or not initialized.
      </div>
    );
  }

  const { grid, currentTurn, winner, winningSlots } = game.state;
  const isMyTurn = (currentTurn === 'host' && isHost) || (currentTurn === 'opponent' && !isHost);

  const handleDropDisc = (col: number) => {
    if (winner || !isMyTurn) return;
    if (grid[0][col] !== null) return; // full
    makePlayerMove(gameId, { col }, isHost);
  };

  const isWinningSlot = (r: number, c: number) => {
    return winningSlots?.some(([wr, wc]: [number, number]) => wr === r && wc === c);
  };

  return (
    <div className={`flex flex-col items-center select-none ${compact ? 'max-w-[280px]' : 'max-w-[320px]'} mx-auto`}>
      {/* Turn & Status Header */}
      <div className="w-full flex items-center justify-between gap-2 mb-2 text-[11px]">
        <div className="flex items-center gap-1.5 font-medium">
          <span className={`w-2 h-2 rounded-full ${isMyTurn && !winner ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          {winner ? (
            <span className="font-bold text-amber-500 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              {winner === 'draw'
                ? "Full board - It's a draw!"
                : winner === (isHost ? 'host' : 'opponent')
                ? 'You got 4 in a row!'
                : `${opponentName} won!`}
            </span>
          ) : (
            <span className={isMyTurn ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'}>
              {isMyTurn ? 'Your turn (drop disc)' : `${opponentName}'s turn...`}
            </span>
          )}
        </div>

        {winner && (
          <button
            type="button"
            onClick={() => resetGame(gameId)}
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Rematch
          </button>
        )}
      </div>

      {/* Connect 4 Board */}
      <div className="w-full p-2.5 rounded-2xl bg-blue-600 dark:bg-blue-700 shadow-md flex flex-col gap-1 border border-blue-700 dark:border-blue-800">
        {/* Column Drop Buttons Header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {Array.from({ length: C4_COLS }).map((_, c) => {
            const isColFull = grid[0][c] !== null;
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleDropDisc(c)}
                disabled={isColFull || Boolean(winner) || !isMyTurn}
                className={`h-5 rounded flex items-center justify-center transition-all ${
                  !isColFull && isMyTurn && !winner
                    ? 'bg-blue-500/80 hover:bg-white text-white hover:text-blue-600 cursor-pointer'
                    : 'opacity-0 cursor-default'
                }`}
              >
                <ArrowDown className="w-3 h-3 animate-bounce" />
              </button>
            );
          })}
        </div>

        {/* 6 rows x 7 cols Slots */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: C4_ROWS }).map((_, r) =>
            Array.from({ length: C4_COLS }).map((_, c) => {
              const cell = grid[r][c];
              const isWin = isWinningSlot(r, c);

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleDropDisc(c)}
                  className={`aspect-square rounded-full flex items-center justify-center transition-all ${
                    cell === 'host'
                      ? 'bg-indigo-500 ring-2 ring-indigo-400 shadow-inner'
                      : cell === 'opponent'
                      ? 'bg-amber-400 ring-2 ring-amber-300 shadow-inner'
                      : 'bg-blue-800/80 dark:bg-blue-900/90 hover:bg-blue-700/60 cursor-pointer'
                  } ${isWin ? 'animate-pulse ring-4 ring-white' : ''}`}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Players key */}
      <div className="w-full flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 mt-2 px-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          You: {hostName}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Opponent: {opponentName}
        </span>
      </div>
    </div>
  );
};
