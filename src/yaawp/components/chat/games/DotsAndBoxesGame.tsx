// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React from 'react';
import { useTemporaryGames } from '../../../context/TemporaryGamesContext';
import { Trophy, RefreshCw } from 'lucide-react';

interface DotsAndBoxesProps {
  gameId: string;
  hostName: string;
  opponentName: string;
  isHost: boolean;
  compact?: boolean;
}

export const DotsAndBoxesGame: React.FC<DotsAndBoxesProps> = ({
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

  const { claimedLines, capturedBoxes, currentTurn, hostScore, opponentScore, winner } = game.state;
  const isMyTurn = (currentTurn === 'host' && isHost) || (currentTurn === 'opponent' && !isHost);

  const handleLineClick = (lineKey: string) => {
    if (claimedLines[lineKey] || winner || !isMyTurn) return;
    makePlayerMove(gameId, { lineKey }, isHost);
  };

  const getHostInitial = () => (hostName ? hostName[0].toUpperCase() : 'H');
  const getOpponentInitial = () => (opponentName ? opponentName[0].toUpperCase() : 'O');

  return (
    <div className={`flex flex-col items-center select-none ${compact ? 'max-w-[270px]' : 'max-w-[300px]'} mx-auto`}>
      {/* Header & Scores */}
      <div className="w-full flex items-center justify-between text-[11px] mb-2 px-1">
        <div className="flex items-center gap-1.5 font-medium">
          <span className={`w-2 h-2 rounded-full ${isMyTurn && !winner ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          {winner ? (
            <span className="font-bold text-amber-500 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              {winner === 'draw'
                ? "It's a draw!"
                : (winner === 'host' && isHost) || (winner === 'opponent' && !isHost)
                ? 'You captured the most boxes!'
                : `${opponentName} won!`}
            </span>
          ) : (
            <span className={isMyTurn ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'}>
              {isMyTurn ? 'Your turn (draw line)' : `${opponentName}'s turn...`}
            </span>
          )}
        </div>

        {winner ? (
          <button
            type="button"
            onClick={() => resetGame(gameId)}
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Rematch
          </button>
        ) : (
          <div className="flex items-center gap-2 font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            <span className="text-indigo-600 dark:text-indigo-400">{hostScore}</span>
            <span className="text-slate-400">:</span>
            <span className="text-rose-500">{opponentScore}</span>
          </div>
        )}
      </div>

      {/* Grid: 4 rows of dots, 3 rows of boxes */}
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-full flex flex-col items-center justify-center">
        {Array.from({ length: 3 }).map((_, r) => (
          <React.Fragment key={`row-${r}`}>
            {/* Horizontal Line Row */}
            <div className="flex items-center justify-between w-full">
              {Array.from({ length: 3 }).map((_, c) => {
                const lineKey = `h_${r}_${c}`;
                const claimed = claimedLines[lineKey];

                return (
                  <React.Fragment key={lineKey}>
                    {/* Dot */}
                    <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0 shadow-xs z-10" />

                    {/* Horizontal Edge */}
                    <button
                      type="button"
                      onClick={() => handleLineClick(lineKey)}
                      disabled={Boolean(claimed) || Boolean(winner) || !isMyTurn}
                      className={`flex-1 h-2 rounded-full mx-1 transition-all ${
                        claimed === 'host'
                          ? 'bg-indigo-600 dark:bg-indigo-500 shadow-xs'
                          : claimed === 'opponent'
                          ? 'bg-rose-500 shadow-xs'
                          : isMyTurn && !winner
                          ? 'bg-slate-200 dark:bg-slate-700 hover:bg-indigo-300 dark:hover:bg-indigo-600/50 cursor-pointer'
                          : 'bg-slate-200 dark:bg-slate-700 cursor-default'
                      }`}
                    />
                  </React.Fragment>
                );
              })}
              {/* Rightmost dot */}
              <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0 shadow-xs z-10" />
            </div>

            {/* Vertical Edges & Box Fillers Row */}
            <div className="flex items-center justify-between w-full my-1">
              {Array.from({ length: 3 }).map((_, c) => {
                const vLineLeft = `v_${r}_${c}`;
                const boxKey = `box_${r}_${c}`;
                const claimedV = claimedLines[vLineLeft];
                const captured = capturedBoxes[boxKey];

                return (
                  <React.Fragment key={`box-cell-${r}-${c}`}>
                    {/* Vertical Edge Left */}
                    <button
                      type="button"
                      onClick={() => handleLineClick(vLineLeft)}
                      disabled={Boolean(claimedV) || Boolean(winner) || !isMyTurn}
                      className={`w-2 h-10 rounded-full my-0.5 transition-all shrink-0 ${
                        claimedV === 'host'
                          ? 'bg-indigo-600 dark:bg-indigo-500 shadow-xs'
                          : claimedV === 'opponent'
                          ? 'bg-rose-500 shadow-xs'
                          : isMyTurn && !winner
                          ? 'bg-slate-200 dark:bg-slate-700 hover:bg-indigo-300 dark:hover:bg-indigo-600/50 cursor-pointer'
                          : 'bg-slate-200 dark:bg-slate-700 cursor-default'
                      }`}
                    />

                    {/* Box Center */}
                    <div
                      className={`flex-1 h-10 rounded-lg mx-1 flex items-center justify-center font-black text-sm transition-transform ${
                        captured === 'host'
                          ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 animate-in zoom-in-50'
                          : captured === 'opponent'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 animate-in zoom-in-50'
                          : 'bg-transparent'
                      }`}
                    >
                      {captured === 'host'
                        ? getHostInitial()
                        : captured === 'opponent'
                        ? getOpponentInitial()
                        : ''}
                    </div>
                  </React.Fragment>
                );
              })}

              {/* Rightmost Vertical Edge */}
              {(() => {
                const vRight = `v_${r}_3`;
                const claimedRight = claimedLines[vRight];
                return (
                  <button
                    type="button"
                    onClick={() => handleLineClick(vRight)}
                    disabled={Boolean(claimedRight) || Boolean(winner) || !isMyTurn}
                    className={`w-2 h-10 rounded-full my-0.5 transition-all shrink-0 ${
                      claimedRight === 'host'
                        ? 'bg-indigo-600 dark:bg-indigo-500 shadow-xs'
                        : claimedRight === 'opponent'
                        ? 'bg-rose-500 shadow-xs'
                        : isMyTurn && !winner
                        ? 'bg-slate-200 dark:bg-slate-700 hover:bg-indigo-300 dark:hover:bg-indigo-600/50 cursor-pointer'
                        : 'bg-slate-200 dark:bg-slate-700 cursor-default'
                    }`}
                  />
                );
              })()}
            </div>
          </React.Fragment>
        ))}

        {/* Bottom Horizontal Line Row */}
        <div className="flex items-center justify-between w-full">
          {Array.from({ length: 3 }).map((_, c) => {
            const lineKey = `h_3_${c}`;
            const claimed = claimedLines[lineKey];

            return (
              <React.Fragment key={lineKey}>
                <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0 shadow-xs z-10" />
                <button
                  type="button"
                  onClick={() => handleLineClick(lineKey)}
                  disabled={Boolean(claimed) || Boolean(winner) || !isMyTurn}
                  className={`flex-1 h-2 rounded-full mx-1 transition-all ${
                    claimed === 'host'
                      ? 'bg-indigo-600 dark:bg-indigo-500 shadow-xs'
                      : claimed === 'opponent'
                      ? 'bg-rose-500 shadow-xs'
                      : isMyTurn && !winner
                      ? 'bg-slate-200 dark:bg-slate-700 hover:bg-indigo-300 dark:hover:bg-indigo-600/50 cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-700 cursor-default'
                  }`}
                />
              </React.Fragment>
            );
          })}
          <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0 shadow-xs z-10" />
        </div>
      </div>

      {/* Players Key */}
      <div className="w-full flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 mt-2 px-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          You ({getHostInitial()}): {hostScore} pts
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          {opponentName} ({getOpponentInitial()}): {opponentScore} pts
        </span>
      </div>
    </div>
  );
};
