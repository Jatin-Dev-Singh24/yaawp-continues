// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';
import {
  sanitizeUsername,
  checkUsernameAvailability
} from '../../utils/usernameValidation';

export const SetUsernameModal: React.FC = () => {
  const {
    currentUser,
    userProfiles,
    updateProfile,
    isUsernameSetupRequired,
    setIsUsernameSetupRequired,
    showToast
  } = useApp();

  const [usernameInput, setUsernameInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize input with current user's draft username or suggested handle
  useEffect(() => {
    if (isUsernameSetupRequired && currentUser) {
      const base = sanitizeUsername(currentUser.username) || sanitizeUsername(currentUser.email?.split('@')[0] || '') || 'creator';
      setUsernameInput(base);
      triggerCheck(base);
    }
  }, [isUsernameSetupRequired, currentUser?.id]);

  const triggerCheck = async (val: string) => {
    const clean = sanitizeUsername(val);
    if (!clean || clean.length < 3) {
      setStatus('invalid');
      setErrorMessage(clean.length === 0 ? 'Please enter a username.' : 'Username must be at least 3 characters.');
      setSuggestions([]);
      return;
    }

    setIsChecking(true);
    setStatus('checking');
    setErrorMessage(null);

    try {
      const res = await checkUsernameAvailability(clean, userProfiles, currentUser?.id);
      if (!res.isValid) {
        setStatus('invalid');
        setErrorMessage(res.error || 'Invalid username format.');
        setSuggestions(res.suggestions);
      } else if (!res.isAvailable) {
        setStatus('taken');
        setErrorMessage(res.error || `This username @${clean} is already taken.`);
        setSuggestions(res.suggestions);
      } else {
        setStatus('available');
        setErrorMessage(null);
        setSuggestions([]);
      }
    } catch {
      setStatus('available');
    } finally {
      setIsChecking(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = sanitizeUsername(raw);
    setUsernameInput(clean);
    triggerCheck(clean);
  };

  const handleSelectSuggestion = (sug: string) => {
    setUsernameInput(sug);
    triggerCheck(sug);
  };

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeUsername(usernameInput);

    if (!clean || clean.length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await checkUsernameAvailability(clean, userProfiles, currentUser?.id);
      if (!res.isAvailable) {
        setStatus('taken');
        setErrorMessage(res.error || `This username @${clean} is already taken.`);
        setSuggestions(res.suggestions);
        setIsSaving(false);
        return;
      }

      // Update current user profile with chosen unique username
      updateProfile({
        username: clean
      });

      // Clear flag in localStorage and context
      if (currentUser?.id) {
        localStorage.setItem(`yaawp_custom_username_${currentUser.id}`, 'true');
        localStorage.removeItem(`yaawp_needs_username_${currentUser.id}`);
      }
      localStorage.removeItem('yaawp_needs_username_prompt');
      setIsUsernameSetupRequired(false);
      showToast(`Welcome! Your unique handle is now @${clean}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update username. Please try another.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isUsernameSetupRequired) return null;

  return (
    <div
      id="set-username-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="set-username-title"
    >
      <div
        id="set-username-card"
        className="w-full max-w-[440px] bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-emerald-400 mb-3 shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2
            id="set-username-title"
            className="text-lg font-semibold tracking-wide text-zinc-100"
          >
            Claim Your Unique Handle
          </h2>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-sm mx-auto">
            Every creator on Yaawp has a distinct identity. Choose a unique handle for your profile.
          </p>
        </div>

        <form onSubmit={handleSaveUsername} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="set-unique-username-input"
              className="block text-[11px] tracking-[0.16em] uppercase font-light text-zinc-400"
            >
              Choose Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-500 font-mono text-sm pointer-events-none">
                @
              </span>
              <input
                id="set-unique-username-input"
                type="text"
                value={usernameInput}
                onChange={handleInputChange}
                autoFocus
                placeholder="yourhandle"
                className={`w-full bg-zinc-900/90 border pl-8 pr-10 py-2.5 rounded-xl text-sm font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-all duration-200 ${
                  status === 'available'
                    ? 'border-emerald-500/70 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/30'
                    : status === 'taken' || status === 'invalid'
                    ? 'border-rose-500/70 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/30'
                    : 'border-zinc-700/80 focus:border-zinc-300'
                }`}
              />
              <div className="absolute right-3 flex items-center">
                {isChecking ? (
                  <RefreshCw className="w-4 h-4 text-zinc-500 animate-spin" />
                ) : status === 'available' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : status === 'taken' || status === 'invalid' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : null}
              </div>
            </div>

            {/* Status Feedback Message */}
            {status === 'available' && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium mt-1">
                <Check className="w-3 h-3 shrink-0" />
                <span>@<strong>{usernameInput}</strong> is available!</span>
              </p>
            )}

            {(status === 'taken' || status === 'invalid') && errorMessage && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}
          </div>

          {/* Similar Available Usernames Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-2">
              <span className="text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Available suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 hover:border-emerald-500/50 text-zinc-200 hover:text-emerald-300 transition-all cursor-pointer font-mono"
                  >
                    @{sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            id="save-unique-username-btn"
            type="submit"
            disabled={isSaving || isChecking || status !== 'available'}
            className="w-full mt-2 py-3 rounded-xl text-xs tracking-[0.2em] uppercase font-semibold text-black bg-zinc-100 hover:bg-white active:bg-zinc-300 transition-all duration-200 disabled:opacity-40 cursor-pointer shadow-md disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Confirming...</span>
              </>
            ) : (
              <span>Claim Handle & Continue</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
