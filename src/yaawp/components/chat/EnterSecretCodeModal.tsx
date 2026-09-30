// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState } from 'react';
import { X, Lock, Key, Shield, AlertCircle, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HiddenVaultConfig } from '../../types';

interface EnterSecretCodeModalProps {
  isOpen: boolean;
  conversationId: string | null;
  conversationTitle?: string;
  onClose: () => void;
  onOpenForgotCode: () => void;
}

export const EnterSecretCodeModal: React.FC<EnterSecretCodeModalProps> = ({
  isOpen,
  conversationId,
  conversationTitle,
  onClose,
  onOpenForgotCode,
}) => {
  const { chatSecretCode, hideChatWithCode, defaultVaultConfig } = useApp();

  const isFirstTime = !chatSecretCode;

  const [code, setCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // What to hide options:
  const [hideChat, setHideChat] = useState(defaultVaultConfig.hideChat);
  const [hideStories, setHideStories] = useState(defaultVaultConfig.hideStories);
  const [hidePosts, setHidePosts] = useState(defaultVaultConfig.hidePosts);

  if (!isOpen || !conversationId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isFirstTime) {
      if (!code) {
        setErrorMsg('Please enter a secret security code.');
        return;
      }
      if (code !== confirmCode) {
        setErrorMsg('Security codes do not match. Please verify both entries.');
        return;
      }
    } else {
      if (!code) {
        setErrorMsg('Please enter your security code.');
        return;
      }
    }

    const config: Partial<HiddenVaultConfig> = {
      hideChat,
      hideStories,
      hidePosts,
    };

    const success = hideChatWithCode(conversationId, code, config);
    if (success) {
      setCode('');
      setConfirmCode('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('Incorrect security code. Please check your code or use "Forgot code?".');
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <EyeOff className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isFirstTime ? 'Set Secret Security Code' : 'Enter Security Code'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isFirstTime
                  ? 'First-time setup: Create a secret code to protect hidden chats'
                  : `Enter your code to hide "${conversationTitle || 'this chat'}"`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isFirstTime ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Set Security Code
                </label>
                <input
                  type="text"
                  autoFocus
                  value={code}
                  onChange={e => {
                    setCode(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="e.g. 1234, Secret 🔒, or any characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Security Code
                </label>
                <input
                  type="text"
                  value={confirmCode}
                  onChange={e => {
                    setConfirmCode(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Re-enter to confirm code"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Secret code can be anything: letters, numbers, emojis, spaces, or special characters. It is case-sensitive and space-sensitive.
              </p>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Security Code
              </label>
              <input
                type="text"
                autoFocus
                value={code}
                onChange={e => {
                  setCode(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Enter your security code"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Granular Hide Preferences for this contact */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Choose what to hide for this contact:
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideChat}
                  onChange={e => setHideChat(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-950"
                />
                <span>Hide direct messages & chat history</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideStories}
                  onChange={e => setHideStories(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-950"
                />
                <span>Hide stories from main feed</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hidePosts}
                  onChange={e => setHidePosts(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-950"
                />
                <span>Hide posts from feed & explore</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            {!isFirstTime ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenForgotCode();
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Forgot code?
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {isFirstTime ? 'Set Code & Hide' : 'Hide Chat'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
