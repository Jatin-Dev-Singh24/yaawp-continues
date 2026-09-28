import React from 'react';
import { useTemporaryGames } from '../../../context/TemporaryGamesContext';
import { RPSChoice } from '../../../utils/gameEngine';
import { Trophy, RefreshCw } from 'lucide-react';

interface RPSGameProps {
  gameId: string;
  hostName: string;
  opponentName: string;
  isHost: boolean;
  compact?: boolean;
}

const WEAPONS: { choice: RPSChoice; label: string; icon: string }[] = [
  { choice: 'rock', label: 'Rock', icon: '🪨' },
  { choice: 'paper', label: 'Paper', icon: '📄' },
  { choice: 'scissors', label: 'Scissors', icon: '✂️' },
];

export const RockPaperScissorsGame: React.FC<RPSGameProps> = ({
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

  const { hostChoice, opponentChoice, revealed, winner, hostScore, opponentScore, round } = game.state;
  const myChoice = isHost ? hostChoice : opponentChoice;
  const theirChoice = isHost ? opponentChoice : hostChoice;

  const handleSelectChoice = (choice: RPSChoice) => {
    if (myChoice) return; // already locked in
    makePlayerMove(gameId, { choice }, isHost);
  };

  const getWeaponIcon = (choice: RPSChoice | null) => {
    if (!choice) return '❓';
    if (choice === 'rock') return '🪨';
    if (choice === 'paper') return '📄';
    return '✂️';
  };

  return (
    <div className={`flex flex-col items-center select-none ${compact ? 'max-w-[260px]' : 'max-w-xs'} mx-auto`}>
      {/* Score Header */}
      <div className="w-full flex items-center justify-between text-[11px] mb-2 px-1">
        <span className="font-bold text-slate-700 dark:text-slate-300">
          Round {round}
        </span>
        <div className="flex items-center gap-2 font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          <span className="text-indigo-600 dark:text-indigo-400">{hostScore}</span>
          <span className="text-slate-400">:</span>
          <span className="text-rose-500">{opponentScore}</span>
        </div>
      </div>

      {/* Duel Arena */}
      <div className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-3">
        <div className="w-full flex items-center justify-around">
          {/* You */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-500 font-medium">You</span>
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-2xl shadow-xs transition-transform">
              {myChoice ? getWeaponIcon(myChoice) : '❓'}
            </div>
            <span className="text-[10px] font-bold capitalize text-slate-700 dark:text-slate-300">
              {myChoice || 'Choose...'}
            </span>
          </div>

          <span className="text-xs font-black text-slate-400 italic">VS</span>

          {/* Opponent */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[70px]">{opponentName}</span>
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-2xl shadow-xs transition-transform">
              {revealed ? getWeaponIcon(theirChoice) : theirChoice ? '🔒' : '💭'}
            </div>
            <span className="text-[10px] font-bold capitalize text-slate-700 dark:text-slate-300">
              {revealed ? theirChoice : theirChoice ? 'Ready' : 'Thinking...'}
            </span>
          </div>
        </div>

        {/* Round Result Banner */}
        {revealed && (
          <div className="w-full py-1 px-2 rounded-lg bg-white dark:bg-slate-700/80 text-center font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className={
              winner === 'draw'
                ? 'text-slate-600 dark:text-slate-300'
                : (winner === 'host' && isHost) || (winner === 'opponent' && !isHost)
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-500'
            }>
              {winner === 'draw' ? "It's a Tie!" : (winner === 'host' && isHost) || (winner === 'opponent' && !isHost) ? 'You Win!' : `${opponentName} Wins!`}
            </span>
          </div>
        )}

        {/* Action Choice Buttons */}
        {!revealed ? (
          <div className="w-full flex items-center justify-center gap-2 pt-1">
            {WEAPONS.map(w => {
              const isSelected = myChoice === w.choice;
              return (
                <button
                  key={w.choice}
                  type="button"
                  onClick={() => handleSelectChoice(w.choice)}
                  disabled={Boolean(myChoice)}
                  className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center gap-0.5 border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 scale-105 shadow-sm'
                      : myChoice
                      ? 'bg-white/50 dark:bg-slate-700/40 text-slate-400 border-transparent opacity-50 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-indigo-400 active:scale-95 shadow-xs'
                  }`}
                >
                  <span className="text-xl">{w.icon}</span>
                  <span className="text-[10px]">{w.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => resetGame(gameId)}
            className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Next Round
          </button>
        )}
      </div>
    </div>
  );
};
