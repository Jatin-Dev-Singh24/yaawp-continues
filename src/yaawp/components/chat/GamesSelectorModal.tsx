import React from 'react';
import { GameType } from '../../types';
import { Gamepad2, X, Sparkles, Trophy, Users, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GamesSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  opponentName: string;
  onSelectGame: (gameType: GameType, gameTitle: string) => void;
}

interface GameOption {
  type: GameType;
  title: string;
  category: string;
  description: string;
  badge: string;
  iconText: string;
  bgGradient: string;
  iconBg: string;
}

const AVAILABLE_GAMES: GameOption[] = [
  {
    type: 'tictactoe',
    title: 'Tic-Tac-Toe',
    category: 'Classic 3x3 Duel',
    description: 'Place 3 of your marks in a horizontal, vertical, or diagonal row to win.',
    badge: 'Fast & Fun',
    iconText: '❌⭕',
    bgGradient: 'hover:border-indigo-500/50 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400',
  },
  {
    type: 'rps',
    title: 'Rock Paper Scissors',
    category: 'Rapid Duel',
    description: 'Choose your weapon simultaneously. First to predict the opponent takes the round.',
    badge: 'Instant Round',
    iconText: '✊✋✌️',
    bgGradient: 'hover:border-rose-500/50 hover:bg-rose-50/40 dark:hover:bg-rose-950/20',
    iconBg: 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400',
  },
  {
    type: 'connect4',
    title: 'Connect 4',
    category: 'Tactical Gravity Grid',
    description: 'Drop colored discs into the 7x6 grid. Connect 4 discs in a row before your opponent.',
    badge: 'Strategy',
    iconText: '🔴🟡',
    bgGradient: 'hover:border-blue-500/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400',
  },
  {
    type: 'dotsandboxes',
    title: 'Dots & Boxes',
    category: 'Territory Capture',
    description: 'Connect dots with horizontal or vertical lines. Close the 4th line of a box to capture it!',
    badge: 'Classic',
    iconText: '⬛📐',
    bgGradient: 'hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400',
  },
];

export const GamesSelectorModal: React.FC<GamesSelectorModalProps> = ({
  isOpen,
  onClose,
  opponentName,
  onSelectGame,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-4 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  YAAWP Games
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Challenge @{opponentName} to a realtime game
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Games List */}
          <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
            {AVAILABLE_GAMES.map(game => (
              <button
                key={game.type}
                type="button"
                onClick={() => {
                  onSelectGame(game.type, game.title);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex items-start gap-3.5 text-left transition-all group ${game.bgGradient}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs ${game.iconBg}`}>
                  <span>{game.iconText}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {game.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold shrink-0">
                      {game.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>
                </div>
              </button>
            ))}

            {/* Coming Soon Teaser */}
            <div className="mt-4 p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shrink-0">
                <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    and more coming....stay tuned.
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold uppercase">
                    Soon
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Chess, Word Scramble & Battleship in active preparation.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-3 px-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-500" />
              Native in-chat multiplayer
            </span>
            <span>Temporary realtime state</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
