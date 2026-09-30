// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React from 'react';
import { Check, BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';
import { StoryPoll } from '../../types';

interface StoryPollComponentProps {
  poll: StoryPoll;
  storyId: string;
  onVote: (optionId: string) => void;
  onPause?: () => void;
  onResume?: () => void;
}

export const StoryPollComponent: React.FC<StoryPollComponentProps> = ({
  poll,
  onVote,
  onPause,
  onResume
}) => {
  const hasVoted = Boolean(poll.userVotedOptionId);
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleOptionClick = (e: React.MouseEvent, optionId: string) => {
    e.stopPropagation();
    if (!hasVoted) {
      onVote(optionId);
    }
  };

  return (
    <div
      id={`story-poll-${poll.id}`}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      onClick={e => e.stopPropagation()}
      className="w-full max-w-[320px] mx-auto p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl text-white select-none transition-transform"
    >
      {/* Poll Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shrink-0">
          <BarChart2 className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
          Interactive Poll
        </span>
        {hasVoted && (
          <span className="ml-auto text-[10px] text-white/70 font-mono">
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </span>
        )}
      </div>

      {/* Question */}
      <h3 className="text-sm md:text-base font-bold text-white text-center mb-3 leading-snug drop-shadow-sm px-1">
        {poll.question}
      </h3>

      {/* Options */}
      <div className="space-y-2">
        {poll.options.map(option => {
          const isSelected = poll.userVotedOptionId === option.id;
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

          if (hasVoted) {
            return (
              <div
                key={option.id}
                className={`relative w-full h-11 rounded-xl overflow-hidden border transition-all ${
                  isSelected
                    ? 'border-indigo-400/80 bg-indigo-950/40 shadow-xs ring-1 ring-indigo-400/50'
                    : 'border-white/15 bg-white/10'
                }`}
              >
                {/* Animated Percentage Fill */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className={`absolute inset-y-0 left-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600/70 to-purple-600/70'
                      : 'bg-white/25'
                  }`}
                />

                {/* Content Overlay */}
                <div className="absolute inset-0 px-3.5 flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    {isSelected && <Check className="w-4 h-4 text-indigo-300 shrink-0" />}
                    <span
                      className={`text-xs md:text-sm truncate ${
                        isSelected ? 'font-bold text-white' : 'font-medium text-white/90'
                      }`}
                    >
                      {option.text}
                    </span>
                  </div>
                  <span className="text-xs md:text-sm font-bold font-mono text-white shrink-0">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          }

          // Unvoted state - interactive buttons
          return (
            <button
              key={option.id}
              type="button"
              onClick={e => handleOptionClick(e, option.id)}
              className="w-full h-11 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] border border-white/20 text-white font-medium text-xs md:text-sm flex items-center justify-center transition-all cursor-pointer shadow-sm hover:border-white/40"
            >
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>

      {!hasVoted && (
        <p className="text-[10px] text-center text-white/60 mt-2 font-medium">
          Tap an option to cast your vote
        </p>
      )}
    </div>
  );
};
