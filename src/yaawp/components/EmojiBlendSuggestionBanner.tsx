import React from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { EmojiBlend } from '../data/emojiKitchen';

interface EmojiBlendSuggestionBannerProps {
  blend: EmojiBlend;
  onApplyBlend: (blend: EmojiBlend) => void;
  onOpenKitchen?: (blend: EmojiBlend) => void;
  onDismiss?: () => void;
}

export const EmojiBlendSuggestionBanner: React.FC<EmojiBlendSuggestionBannerProps> = ({
  blend,
  onApplyBlend,
  onOpenKitchen,
  onDismiss
}) => {
  return (
    <div className="flex items-center justify-between gap-2 p-2 px-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-indigo-500/10 border border-pink-300 dark:border-pink-800 text-xs shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2 min-w-0">
        <img
          src={blend.assetUrl}
          alt={blend.name}
          className="w-7 h-7 object-contain drop-shadow-2xs shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white truncate">
            <span>✨ Emoji Kitchen blend detected:</span>
            <span className="text-pink-600 dark:text-pink-400">
              {blend.emoji1} + {blend.emoji2}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {blend.name}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onApplyBlend(blend)}
          className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs transition-transform cursor-pointer flex items-center gap-1"
        >
          <span>Use Blend</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        {onOpenKitchen && (
          <button
            type="button"
            onClick={() => onOpenKitchen(blend)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Open in Emoji Kitchen"
          >
            🧪
          </button>
        )}

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
