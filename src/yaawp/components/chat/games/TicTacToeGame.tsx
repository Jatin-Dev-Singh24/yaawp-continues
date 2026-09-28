import React from 'react';
import { useTemporaryGames } from '../../../context/TemporaryGamesContext';
import { RefreshCw, Trophy } from 'lucide-react';

interface TicTacToeGameProps {
  gameId: string;
  hostName: string;
  opponentName: string;
  isHost: boolean;
  compact?: boolean;
}

export const TicTacToeGame: React.FC<TicTacToeGameProps> = ({
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

  const { board, currentTurn, winner, winningLine } = game.state;
  const isMyTurn = (currentTurn === 'host' && isHost) || (currentTurn === 'opponent' && !isHost);

  const handleCellClick = (idx: number) => {
    if (board[idx] !== null || winner || !isMyTurn) return;
    makePlayerMove(gameId, { index: idx }, isHost);
  };

  return (
    <div className={`flex flex-col items-center select-none ${compact ? 'max-w-[260px]' : 'max-w-xs'} mx-auto`}>
      {/* Turn & Status Header */}
      <div className="w-full flex items-center justify-between gap-2 mb-2 text-[11px]">
        <div className="flex items-center gap-1.5 font-medium">
          <span className={`w-2 h-2 rounded-full ${isMyTurn && !winner ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          {winner ? (
            <span className="font-bold text-amber-500 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              {winner === 'draw' ? "It's a draw!" : winner === (isHost ? 'host' : 'opponent') ? 'You won!' : `${opponentName} won!`}
            </span>
          ) : (
            <span className={isMyTurn ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'}>
              {isMyTurn ? 'Your turn (X)' : `${opponentName}'s turn (O)...`}
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

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-full aspect-square">
        {board.map((cell: string | null, idx: number) => {
          const isWinningCell = winningLine?.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleCellClick(idx)}
              disabled={Boolean(cell) || Boolean(winner) || !isMyTurn}
              className={`flex items-center justify-center rounded-lg text-lg font-black transition-all ${
                isWinningCell
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 scale-95 ring-2 ring-amber-400 shadow-xs'
                  : cell
                  ? 'bg-white dark:bg-slate-700 shadow-xs ' + (cell === 'X' ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500')
                  : isMyTurn && !winner
                  ? 'bg-white/60 dark:bg-slate-800/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-400 border border-transparent cursor-pointer'
                  : 'bg-white/30 dark:bg-slate-800/20 cursor-not-allowed opacity-60'
              }`}
            >
              {cell}
            </button>
          );
        })}
      </div>

      {/* Opponent labels footer */}
      <div className="w-full flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 px-1">
        <span>You (X): {hostName}</span>
        <span>Opponent (O): {opponentName}</span>
      </div>
    </div>
  );
};
