import React, { useState, useMemo } from 'react';
import { Search, Check, Globe } from 'lucide-react';
import { INITIAL_LANGUAGES, LanguageOption, getLanguageByCode } from '../../translations';

interface ChooseLanguageStepProps {
  selectedCode: string;
  onSelectCode: (code: string) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const ChooseLanguageStep: React.FC<ChooseLanguageStepProps> = ({
  selectedCode,
  onSelectCode,
  onConfirm,
  isSubmitting = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return INITIAL_LANGUAGES;
    return INITIAL_LANGUAGES.filter(
      lang =>
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const currentSelected = getLanguageByCode(selectedCode);

  return (
    <div
      id="choose-language-step"
      className="w-full flex flex-col items-center animate-in fade-in duration-200"
    >
      {/* Step Indicator & Header */}
      <div className="w-full text-center mb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-semibold uppercase tracking-wider mb-2.5">
          <Globe className="w-3.5 h-3.5" />
          <span>Required Step • 2 of 2</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Choose your preferred language
        </h2>
        <p className="text-xs text-zinc-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Select your interface language to personalize your Yaawp experience. You can always change this in Settings.
        </p>
      </div>

      {/* Search Input */}
      <div className="w-full relative mb-4">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id="language-search-input"
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search 30 languages (e.g., Español, हिन्दी, French)..."
          className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* 30 Languages Scrollable Grid */}
      <div
        id="languages-selection-grid"
        className="w-full max-h-[300px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent rounded-xl"
        role="radiogroup"
        aria-label="Preferred Language"
      >
        {filteredLanguages.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No languages matching &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredLanguages.map(lang => {
              const isSelected = selectedCode === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`lang-opt-${lang.code}`}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelectCode(lang.code)}
                  className={`w-full p-2.5 px-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/40'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 text-zinc-300'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-bold text-zinc-100 tracking-wide truncate">
                      {lang.nativeName}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate">
                      {lang.name} {lang.dir === 'rtl' ? '• RTL' : ''}
                    </span>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'border-zinc-600 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Indicator & Confirmation Button */}
      <div className="w-full mt-5 pt-4 border-t border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span>Selected Language:</span>
          <span className="font-semibold text-indigo-400">
            {currentSelected.nativeName} ({currentSelected.name})
          </span>
        </div>

        <button
          id="confirm-preferred-language-btn"
          type="button"
          disabled={isSubmitting}
          onClick={onConfirm}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>Setting up your account...</span>
          ) : (
            <span>Continue to Yaawp</span>
          )}
        </button>

        <p className="text-[10px] text-center text-zinc-500">
          English remains the fallback language wherever custom translations are pending.
        </p>
      </div>
    </div>
  );
};
