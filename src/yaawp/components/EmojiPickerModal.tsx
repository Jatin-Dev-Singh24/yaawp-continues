import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Sparkles, Smile, ShieldAlert } from 'lucide-react';
import { EMOJI_CATEGORIES, ALL_PRESET_EMOJIS } from '../data/emojis';
import {
  EmojiBlend,
  detectEmojiBlendInText,
  formatBlendToken
} from '../data/emojiKitchen';
import { EmojiKitchenComposer } from './EmojiKitchenModal';

interface EmojiPickerModalProps {
  isOpen: boolean;
  allowedEmojis?: string[];
  onSelectEmoji: (emoji: string) => void;
  onSelectBlend?: (blend: EmojiBlend) => void;
  onClose: () => void;
  title?: string;
  initialMode?: 'picker' | 'kitchen';
}

export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
  isOpen,
  allowedEmojis,
  onSelectEmoji,
  onSelectBlend,
  onClose,
  title = 'Pick an Emoji Reaction',
  initialMode = 'picker'
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customEmojiInput, setCustomEmojiInput] = useState('');
  const [mode, setMode] = useState<'picker' | 'kitchen'>(initialMode);

  // Check if post author restricted emojis
  const isRestricted = Boolean(allowedEmojis && allowedEmojis.length > 0);

  // Real-time pair detection from typed input
  const detectedBlend = useMemo(() => {
    if (isRestricted) return null;
    const res = detectEmojiBlendInText(customEmojiInput);
    return res ? res.blend : null;
  }, [customEmojiInput, isRestricted]);

  // Filter emojis based on restriction, search query, and category
  const displayedEmojis = useMemo(() => {
    if (isRestricted && allowedEmojis) {
      if (!searchQuery.trim()) return allowedEmojis;
      const q = searchQuery.trim().toLowerCase();
      return allowedEmojis.filter(e => e.includes(q));
    }

    let list = ALL_PRESET_EMOJIS;
    if (activeCategory !== 'all') {
      const cat = EMOJI_CATEGORIES.find(c => c.name === activeCategory);
      if (cat) list = cat.emojis;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      return list.filter(e => e.includes(q));
    }

    return list;
  }, [activeCategory, searchQuery, isRestricted, allowedEmojis]);

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customEmojiInput.trim();
    if (!trimmed) return;

    if (detectedBlend) {
      if (onSelectBlend) {
        onSelectBlend(detectedBlend);
      } else {
        onSelectEmoji(formatBlendToken(detectedBlend));
      }
      setCustomEmojiInput('');
      onClose();
      return;
    }

    if (isRestricted && allowedEmojis && !allowedEmojis.includes(trimmed)) {
      return;
    }
    onSelectEmoji(trimmed);
    setCustomEmojiInput('');
    onClose();
  };

  const handleApplyBlend = (blend: EmojiBlend) => {
    if (onSelectBlend) {
      onSelectBlend(blend);
    } else {
      onSelectEmoji(formatBlendToken(blend));
    }
    setCustomEmojiInput('');
    onClose();
  };

  if (mode === 'kitchen') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 select-none"
      >
        <div className="w-full max-w-md animate-in zoom-in-95 duration-150">
          <EmojiKitchenComposer
            onSelectBlend={handleApplyBlend}
            onClose={() => setMode('picker')}
            title="Emoji Kitchen Lab"
            insertButtonLabel="Use Blend"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
    >
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-sm">
              ✨
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isRestricted
                  ? `Restricted by author (${allowedEmojis?.length} allowed)`
                  : 'React with any emoji or mix in Kitchen'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isRestricted && (
              <button
                type="button"
                onClick={() => setMode('kitchen')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-indigo-500/15 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:scale-102 transition-transform cursor-pointer"
                title="Open Emoji Kitchen"
              >
                <span>🧪 Mix</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Custom Input Bar */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
          {!isRestricted ? (
            <div className="space-y-2">
              <form onSubmit={handleCustomSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={customEmojiInput}
                  onChange={e => setCustomEmojiInput(e.target.value)}
                  placeholder="Type emojis (e.g. 🐱❤️ to blend, or 🪐)..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!customEmojiInput.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {detectedBlend ? 'Blend' : 'React'}
                </button>
              </form>

              {/* Detected Blend Card */}
              {detectedBlend && (
                <div className="p-2 rounded-2xl bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-indigo-500/10 border border-pink-300 dark:border-pink-800 flex items-center justify-between gap-2 text-xs shadow-xs animate-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-2">
                    <img
                      src={detectedBlend.assetUrl}
                      alt={detectedBlend.name}
                      className="w-7 h-7 object-contain drop-shadow-2xs shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        ✨ {detectedBlend.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {detectedBlend.emoji1} + {detectedBlend.emoji2}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyBlend(detectedBlend)}
                    className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    React Blend
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>The creator of this post has restricted reactions to the emojis below.</span>
            </div>
          )}

          {/* Category tabs */}
          {!isRestricted && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setMode('kitchen')}
                className="px-2 py-1 rounded-lg text-xs font-bold shrink-0 text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>🧪 Kitchen</span>
              </button>
              {EMOJI_CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.name);
                    setSearchQuery('');
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors flex items-center gap-1 cursor-pointer ${
                    activeCategory === cat.name
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="text-[11px] hidden sm:inline">{cat.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Emojis Grid */}
        <div className="flex-1 p-3 overflow-y-auto min-h-[220px]">
          <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5">
            {displayedEmojis.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onSelectEmoji(emoji);
                  onClose();
                }}
                className="p-2 text-2xl rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-125 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {displayedEmojis.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-400 space-y-1">
              <p>No matching emojis found</p>
              {!isRestricted && customEmojiInput && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectEmoji(customEmojiInput.trim());
                    onClose();
                  }}
                  className="mt-2 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  React with "{customEmojiInput.trim()}"
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>{displayedEmojis.length} standard Unicode emojis</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-slate-600 dark:text-slate-300 font-semibold hover:underline cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
