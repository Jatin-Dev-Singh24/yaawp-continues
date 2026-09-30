// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Sparkles,
  Shuffle,
  RotateCcw,
  Plus,
  Check,
  Search,
  Flame,
  Smile,
  Heart,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import {
  EmojiBlend,
  ALL_EMOJI_BLENDS,
  SUPPORTED_BASE_EMOJIS,
  findEmojiBlend,
  getCompatibleEmojis,
  getRandomBlend
} from '../data/emojiKitchen';
import { EMOJI_CATEGORIES } from '../data/emojis';

interface EmojiKitchenProps {
  onSelectBlend: (blend: EmojiBlend) => void;
  onClose?: () => void;
  initialEmoji1?: string;
  initialEmoji2?: string;
  isModal?: boolean;
  isOpen?: boolean;
  title?: string;
  insertButtonLabel?: string;
}

export const EmojiKitchenComposer: React.FC<Omit<EmojiKitchenProps, 'isModal' | 'isOpen'>> = ({
  onSelectBlend,
  onClose,
  initialEmoji1 = '',
  initialEmoji2 = '',
  title = 'Emoji Kitchen',
  insertButtonLabel = 'Insert Blend'
}) => {
  const [emoji1, setEmoji1] = useState<string>(initialEmoji1);
  const [emoji2, setEmoji2] = useState<string>(initialEmoji2);
  const [activeSlot, setActiveSlot] = useState<1 | 2>(initialEmoji1 ? 2 : 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'supported' | 'all' | 'recipes'>('supported');
  const [copySuccess, setCopySuccess] = useState(false);

  // Sync initial props if changed
  useEffect(() => {
    if (initialEmoji1) setEmoji1(initialEmoji1);
    if (initialEmoji2) setEmoji2(initialEmoji2);
    if (initialEmoji1 && !initialEmoji2) setActiveSlot(2);
  }, [initialEmoji1, initialEmoji2]);

  // Detected blend
  const currentBlend = useMemo(() => {
    if (!emoji1 || !emoji2) return null;
    return findEmojiBlend(emoji1, emoji2);
  }, [emoji1, emoji2]);

  // Compatible partners for currently selected emoji1 (if set)
  const compatibleWithEmoji1 = useMemo(() => {
    if (!emoji1) return [];
    return getCompatibleEmojis(emoji1).map(c => c.emoji);
  }, [emoji1]);

  // Select an emoji into active slot
  const handlePickEmoji = (picked: string) => {
    if (activeSlot === 1) {
      setEmoji1(picked);
      setActiveSlot(2);
    } else {
      setEmoji2(picked);
    }
  };

  // Quick Randomize action
  const handleRandomize = () => {
    const random = getRandomBlend();
    setEmoji1(random.emoji1);
    setEmoji2(random.emoji2);
    setActiveSlot(2);
  };

  // Clear all action
  const handleClearAll = () => {
    setEmoji1('');
    setEmoji2('');
    setActiveSlot(1);
  };

  // Select a preset recipe directly
  const handleSelectRecipe = (blend: EmojiBlend) => {
    setEmoji1(blend.emoji1);
    setEmoji2(blend.emoji2);
    setActiveSlot(2);
  };

  // Filtered emojis
  const displayedEmojis = useMemo(() => {
    let list = activeTab === 'supported' ? SUPPORTED_BASE_EMOJIS : SUPPORTED_BASE_EMOJIS;
    if (activeTab === 'all') {
      // Standard Unicode categories
      list = Array.from(new Set([...SUPPORTED_BASE_EMOJIS, ...EMOJI_CATEGORIES[1].emojis]));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      // Search in blend names or tags
      const matchingFromBlends = ALL_EMOJI_BLENDS.filter(
        b => b.name.toLowerCase().includes(q) || b.tags.some(t => t.includes(q))
      ).flatMap(b => [b.emoji1, b.emoji2]);
      return Array.from(new Set(matchingFromBlends));
    }
    return list;
  }, [activeTab, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center text-lg shadow-sm">
            🧪
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {title}
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Blend Lab
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Mix standard Unicode emojis to craft custom transparent blends
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRandomize}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
            title="Mix a random pair"
          >
            <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Randomise</span>
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Composer Stage: Emoji 1 + Emoji 2 = Blended Result */}
      <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-center gap-2 sm:gap-3 select-none">
          {/* Slot 1 */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveSlot(1)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl transition-all cursor-pointer ${
                activeSlot === 1
                  ? 'bg-white dark:bg-slate-800 border-2 border-indigo-500 ring-4 ring-indigo-500/20 shadow-md scale-105'
                  : 'bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {emoji1 ? (
                <span className="animate-in zoom-in-75 duration-150">{emoji1}</span>
              ) : (
                <span className="text-slate-300 dark:text-slate-600 text-xs font-semibold flex flex-col items-center">
                  <Plus className="w-4 h-4 mb-0.5" />
                  Emoji 1
                </span>
              )}
            </button>
            <span className="text-[10px] font-medium text-slate-400">
              {emoji1 ? 'Slot 1' : 'Pick first'}
            </span>
          </div>

          {/* Plus Sign */}
          <div className="text-slate-400 dark:text-slate-500 font-bold text-xl pb-4">
            +
          </div>

          {/* Slot 2 */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveSlot(2)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl transition-all cursor-pointer ${
                activeSlot === 2
                  ? 'bg-white dark:bg-slate-800 border-2 border-indigo-500 ring-4 ring-indigo-500/20 shadow-md scale-105'
                  : 'bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {emoji2 ? (
                <span className="animate-in zoom-in-75 duration-150">{emoji2}</span>
              ) : (
                <span className="text-slate-300 dark:text-slate-600 text-xs font-semibold flex flex-col items-center">
                  <Plus className="w-4 h-4 mb-0.5" />
                  Emoji 2
                </span>
              )}
            </button>
            <span className="text-[10px] font-medium text-slate-400">
              {emoji2 ? 'Slot 2' : 'Pick second'}
            </span>
          </div>

          {/* Equals Sign */}
          <div className="text-slate-400 dark:text-slate-500 font-bold text-xl pb-4">
            =
          </div>

          {/* Result Slot */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center relative transition-all ${
                currentBlend
                  ? 'bg-gradient-to-br from-indigo-50 to-pink-50 dark:from-indigo-950/40 dark:to-pink-950/40 border-2 border-pink-400/80 shadow-lg ring-4 ring-pink-400/20'
                  : 'bg-slate-100/70 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700'
              }`}
            >
              {currentBlend ? (
                <img
                  src={currentBlend.assetUrl}
                  alt={currentBlend.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain animate-in zoom-in-50 duration-200 drop-shadow-md select-none"
                />
              ) : (
                <div className="text-center p-1">
                  <Sparkles className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto mb-0.5" />
                  <span className="text-[9px] text-slate-400 font-medium leading-none block">
                    Blend
                  </span>
                </div>
              )}
            </div>
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              {currentBlend ? currentBlend.name : 'Result'}
            </span>
          </div>
        </div>

        {/* Current Blend Details & Insert Bar */}
        {currentBlend ? (
          <div className="mt-3.5 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 text-left w-full sm:w-auto">
              <img
                src={currentBlend.assetUrl}
                alt={currentBlend.name}
                className="w-10 h-10 object-contain drop-shadow-xs shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {currentBlend.name}
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-medium">
                    {currentBlend.emoji1} + {currentBlend.emoji2}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {currentBlend.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  onSelectBlend(currentBlend);
                  if (onClose) onClose();
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{insertButtonLabel}</span>
              </button>
            </div>
          </div>
        ) : emoji1 && emoji2 ? (
          <div className="mt-3 p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>No recipe found for {emoji1} + {emoji2} yet.</span>
            </div>
            <button
              type="button"
              onClick={handleRandomize}
              className="px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-900 text-[11px] font-bold hover:bg-amber-300 transition-colors"
            >
              Try random mix 🎲
            </button>
          </div>
        ) : emoji1 && !emoji2 ? (
          <div className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Tip: Pick a compatible partner like{' '}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {compatibleWithEmoji1.slice(0, 3).join(' ')}
            </span>{' '}
            to complete the mix!
          </div>
        ) : null}
      </div>

      {/* Tabs & Search */}
      <div className="p-3 px-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('supported')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'supported'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Ingredients ({SUPPORTED_BASE_EMOJIS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recipes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'recipes'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Cookbook ({ALL_EMOJI_BLENDS.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-48">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search recipes or tags..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Content Area: Grid of Base Emojis or Curated Recipes */}
      <div className="flex-1 p-3.5 overflow-y-auto max-h-[320px]">
        {activeTab === 'recipes' ? (
          /* Cookbook Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_EMOJI_BLENDS.filter(
              b =>
                !searchQuery ||
                b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.tags.some(t => t.includes(searchQuery.toLowerCase()))
            ).map(blend => (
              <button
                key={blend.id}
                type="button"
                onClick={() => handleSelectRecipe(blend)}
                className="flex items-center gap-2.5 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white/60 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-left group cursor-pointer"
              >
                <img
                  src={blend.assetUrl}
                  alt={blend.name}
                  className="w-9 h-9 object-contain group-hover:scale-110 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                    {blend.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {blend.emoji1} + {blend.emoji2}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Ingredients Grid (Standard Unicode Emojis) */
          <div>
            {emoji1 && compatibleWithEmoji1.length > 0 && (
              <div className="mb-3">
                <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Compatible mixes with {emoji1}:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {compatibleWithEmoji1.map(comp => (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => handlePickEmoji(comp)}
                      className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 flex items-center justify-center text-xl hover:scale-125 transition-transform cursor-pointer"
                      title={`Mix ${emoji1} with ${comp}`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              Available Ingredients:
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
              {displayedEmojis.map(emoji => {
                const isCompatible = emoji1 ? compatibleWithEmoji1.includes(emoji) : false;
                const isSelected = emoji1 === emoji || emoji2 === emoji;

                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handlePickEmoji(emoji)}
                    className={`w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white scale-110 shadow-sm'
                        : isCompatible
                        ? 'bg-pink-50 dark:bg-pink-950/50 border border-pink-300 dark:border-pink-800 ring-2 ring-pink-400/20 hover:scale-125'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-125'
                    }`}
                    title={`Select ${emoji}`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 px-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 bg-slate-50/50 dark:bg-slate-900/40">
        <span>✨ 25 Curated Transparent Blends</span>
        {currentBlend ? (
          <button
            type="button"
            onClick={() => {
              onSelectBlend(currentBlend);
              if (onClose) onClose();
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>{insertButtonLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span>Select two emojis above</span>
        )}
      </div>
    </div>
  );
};

export const EmojiKitchenModal: React.FC<EmojiKitchenProps> = ({
  isOpen = true,
  onClose,
  ...props
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 select-none"
    >
      <div className="w-full max-w-md animate-in zoom-in-95 duration-150">
        <EmojiKitchenComposer onClose={onClose} {...props} />
      </div>
    </div>
  );
};
