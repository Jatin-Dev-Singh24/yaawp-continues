import React, { useState } from 'react';
import { X, Smile, Check, ShieldCheck, Ban, Plus, Search } from 'lucide-react';
import { EMOJI_CATEGORIES, DEFAULT_QUICK_REACTIONS, ALL_PRESET_EMOJIS } from '../data/emojis';

interface PostEmojiSettingsModalProps {
  isOpen: boolean;
  initialAllowed?: string[];
  initialRestricted?: string[];
  onSave: (allowed?: string[], restricted?: string[]) => void;
  onClose: () => void;
}

export const PostEmojiSettingsModal: React.FC<PostEmojiSettingsModalProps> = ({
  isOpen,
  initialAllowed,
  initialRestricted,
  onSave,
  onClose
}) => {
  const [mode, setMode] = useState<'all' | 'custom'>(
    initialAllowed && initialAllowed.length > 0 ? 'custom' : 'all'
  );
  const [allowedEmojis, setAllowedEmojis] = useState<string[]>(
    initialAllowed && initialAllowed.length > 0 ? initialAllowed : [...DEFAULT_QUICK_REACTIONS]
  );
  const [activeCategory, setActiveCategory] = useState<string>(EMOJI_CATEGORIES[0].name);
  const [customEmojiInput, setCustomEmojiInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const toggleEmoji = (emoji: string) => {
    setAllowedEmojis(prev => {
      if (prev.includes(emoji)) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter(e => e !== emoji);
      } else {
        return [...prev, emoji];
      }
    });
  };

  const handleAddCustomEmoji = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customEmojiInput.trim();
    if (!trimmed) return;
    if (!allowedEmojis.includes(trimmed)) {
      setAllowedEmojis(prev => [...prev, trimmed]);
    }
    setCustomEmojiInput('');
  };

  const handleSelectAllCategory = (emojis: string[]) => {
    setAllowedEmojis(prev => Array.from(new Set([...prev, ...emojis])));
  };

  const handleSave = () => {
    if (mode === 'all') {
      onSave(undefined, undefined);
    } else {
      onSave(allowedEmojis, undefined);
    }
    onClose();
  };

  const currentCategoryEmojis = EMOJI_CATEGORIES.find(c => c.name === activeCategory)?.emojis || [];

  const filteredEmojis = searchQuery.trim()
    ? ALL_PRESET_EMOJIS.filter(e => e.includes(searchQuery.trim()))
    : currentCategoryEmojis;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Reaction Emoji Controls
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Allow all emojis or restrict reactions to whatever you want
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('all')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'all'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Allow All (Any Emoji)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'custom'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Restrict Emojis</span>
          </button>
        </div>

        {/* Mode Content */}
        {mode === 'custom' ? (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Active Allowed Emojis Chips */}
            <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Currently Allowed ({allowedEmojis.length})
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                  Tap any to toggle
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {allowedEmojis.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => toggleEmoji(emoji)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 text-sm shadow-xs hover:border-rose-400 transition-colors"
                    title={`Click to remove ${emoji}`}
                  >
                    <span>{emoji}</span>
                    <span className="text-[10px] text-indigo-500">×</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Emoji Add Form */}
            <form onSubmit={handleAddCustomEmoji} className="flex gap-2">
              <input
                type="text"
                value={customEmojiInput}
                onChange={e => setCustomEmojiInput(e.target.value)}
                placeholder="Type or paste any custom emoji..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!customEmojiInput.trim()}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* Categories & Search */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none flex-1">
                  {EMOJI_CATEGORIES.map(cat => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.name);
                        setSearchQuery('');
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors flex items-center gap-1 ${
                        activeCategory === cat.name && !searchQuery
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="text-[10px]">{cat.name.split('&')[0]}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSelectAllCategory(currentCategoryEmojis)}
                    className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-1"
                  >
                    + Add Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllowedEmojis([])}
                    className="text-[10px] font-semibold text-rose-500 hover:underline px-1"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Emoji Grid */}
              <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                {filteredEmojis.map(emoji => {
                  const isAllowed = allowedEmojis.includes(emoji);
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => toggleEmoji(emoji)}
                      className={`relative p-2 rounded-xl border flex items-center justify-center text-xl transition-all ${
                        isAllowed
                          ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 scale-100'
                          : 'border-transparent hover:bg-slate-200 dark:hover:bg-slate-800 opacity-60 scale-95'
                      }`}
                    >
                      <span>{emoji}</span>
                      {isAllowed && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[8px]">
                          <Check className="w-2 h-2" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-xl">
              ✨
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Anyone can react with whatever emoji they want
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Users can tap the '+' button on your post to pick from hundreds of emojis or type any reaction.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
