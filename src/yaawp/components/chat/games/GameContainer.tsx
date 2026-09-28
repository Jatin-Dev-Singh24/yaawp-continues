import React, { useEffect, useState } from 'react';
import { GameSession } from '../../../types';
import { useTemporaryGames } from '../../../context/TemporaryGamesContext';
import { TicTacToeGame } from './TicTacToeGame';
import { RockPaperScissorsGame } from './RockPaperScissorsGame';
import { ConnectFourGame } from './ConnectFourGame';
import { DotsAndBoxesGame } from './DotsAndBoxesGame';
import { Gamepad2, Maximize2, Minimize2, X, Check, Clock } from 'lucide-react';

interface GameContainerProps {
  gameSession: GameSession;
  currentUserId: string;
  onUpdateSession?: (updated: Partial<GameSession>) => void;
  onExpireSession?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  gameSession,
  currentUserId,
  onUpdateSession,
  onExpireSession,
  isExpanded = false,
  onToggleExpand,
}) => {
  const { startOrGetGame, getActiveGame, expireGame } = useTemporaryGames();
  const [isAccepted, setIsAccepted] = useState(gameSession.status === 'active');

  const isHost = currentUserId === gameSession.hostId;
  const isOpponent = currentUserId === gameSession.opponentId;

  // Auto-start active game when accepted
  useEffect(() => {
    if (gameSession.status === 'active' || isAccepted) {
      startOrGetGame(
        gameSession.gameId,
        gameSession.gameType,
        gameSession.hostId,
        gameSession.opponentId
      );
    }
  }, [gameSession, isAccepted, startOrGetGame]);

  // Simulate opponent accepting game invitation after 1.5s if current user is host
  useEffect(() => {
    if (gameSession.status === 'invitation' && isHost && !isAccepted) {
      const timer = setTimeout(() => {
        setIsAccepted(true);
        startOrGetGame(
          gameSession.gameId,
          gameSession.gameType,
          gameSession.hostId,
          gameSession.opponentId
        );
        onUpdateSession?.({ status: 'active' });
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [gameSession, isHost, isAccepted, startOrGetGame, onUpdateSession]);

  const handleAcceptInvite = () => {
    setIsAccepted(true);
    startOrGetGame(
      gameSession.gameId,
      gameSession.gameType,
      gameSession.hostId,
      gameSession.opponentId
    );
    onUpdateSession?.({ status: 'active' });
  };

  const handleDeclineInvite = () => {
    expireGame(gameSession.gameId);
    onUpdateSession?.({ status: 'declined' });
    onExpireSession?.();
  };

  const handleEndGame = () => {
    expireGame(gameSession.gameId);
    onUpdateSession?.({ status: 'completed' });
    onExpireSession?.();
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Game Header Bar */}
      <div className="px-3 py-2 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 dark:from-violet-900/30 dark:to-indigo-900/30 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs shadow-xs">
            <Gamepad2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">
              {gameSession.gameTitle}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {isHost ? `vs @${gameSession.opponentName}` : `by @${gameSession.hostName}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title={isExpanded ? 'Minimize' : 'Expand Game'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            type="button"
            onClick={handleEndGame}
            className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="End / Discard Game"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Game Content */}
      <div className="p-3">
        {gameSession.status === 'declined' ? (
          <div className="text-center py-4 text-xs text-slate-500">
            Game invitation was declined.
          </div>
        ) : !isAccepted && gameSession.status === 'invitation' ? (
          <div className="flex flex-col items-center gap-3 py-3 text-center">
            <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {isHost
                  ? `Invited ${gameSession.opponentName} to play!`
                  : `${gameSession.hostName} invited you to play!`
                }
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHost ? 'Waiting for opponent to connect...' : 'Play in real time inside this chat.'}
              </p>
            </div>

            {isOpponent ? (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAcceptInvite}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Accept & Play
                </button>
                <button
                  type="button"
                  onClick={handleDeclineInvite}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs transition-colors"
                >
                  Decline
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 font-medium pt-1">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Connecting live session...</span>
              </div>
            )}
          </div>
        ) : (
          /* Active Interactive Game Engine */
          <div>
            {gameSession.gameType === 'tictactoe' && (
              <TicTacToeGame
                gameId={gameSession.gameId}
                hostName={gameSession.hostName}
                opponentName={gameSession.opponentName}
                isHost={isHost}
                compact={!isExpanded}
              />
            )}

            {gameSession.gameType === 'rps' && (
              <RockPaperScissorsGame
                gameId={gameSession.gameId}
                hostName={gameSession.hostName}
                opponentName={gameSession.opponentName}
                isHost={isHost}
                compact={!isExpanded}
              />
            )}

            {gameSession.gameType === 'connect4' && (
              <ConnectFourGame
                gameId={gameSession.gameId}
                hostName={gameSession.hostName}
                opponentName={gameSession.opponentName}
                isHost={isHost}
                compact={!isExpanded}
              />
            )}

            {gameSession.gameType === 'dotsandboxes' && (
              <DotsAndBoxesGame
                gameId={gameSession.gameId}
                hostName={gameSession.hostName}
                opponentName={gameSession.opponentName}
                isHost={isHost}
                compact={!isExpanded}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
