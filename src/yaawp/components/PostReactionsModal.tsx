import React from 'react';
import { X, Sparkles, Heart } from 'lucide-react';
import { Post } from '../types';

interface PostReactionsModalProps {
  post: Post | null;
  onClose: () => void;
}

export const PostReactionsModal: React.FC<PostReactionsModalProps> = ({ post, onClose }) => {
  if (!post) return null;

  // Build reactions count map (including default likes as ❤️ if no reactions object)
  const reactionsMap: { [emoji: string]: number } = { ...(post.reactions || {}) };
  if (post.likesCount > 0 && !reactionsMap['❤️']) {
    reactionsMap['❤️'] = post.likesCount;
  } else if (post.likesCount > 0 && reactionsMap['❤️']) {
    reactionsMap['❤️'] = Math.max(reactionsMap['❤️'], post.likesCount);
  }

  // Sort and take top 5
  const sortedReactions = Object.entries(reactionsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const totalReactionsCount = Object.values(reactionsMap).reduce((sum, val) => sum + val, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Top Reactions
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {totalReactionsCount} total reactions on @{post.user.username}'s post
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top 5 list */}
        <div className="space-y-2.5">
          {sortedReactions.length > 0 ? (
            sortedReactions.map(([emoji, count], index) => {
              const percent = totalReactionsCount > 0 ? Math.round((count / totalReactionsCount) * 100) : 0;
              return (
                <div
                  key={emoji}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-4">
                      #{index + 1}
                    </span>
                    <span className="text-2xl hover:scale-125 transition-transform">{emoji}</span>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {count} {count === 1 ? 'reaction' : 'reactions'}
                      </span>
                      <div className="w-24 sm:w-32 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {percent}%
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400">
              <Heart className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
              <p className="text-xs font-medium">No reactions yet on this post</p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
