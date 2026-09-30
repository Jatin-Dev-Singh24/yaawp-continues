// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState } from 'react';
import { X, Key, Mail, ShieldCheck, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ChangeSecretCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeSecretCodeModal: React.FC<ChangeSecretCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { chatSecretCode, setChatSecretCode, currentUser, showToast } = useApp();

  // If no code is currently set, go straight to setting new code
  const [step, setStep] = useState<'verify' | 'forgot' | 'new'>(chatSecretCode ? 'verify' : 'new');
  const [currentCodeInput, setCurrentCodeInput] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmNewCode, setConfirmNewCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleVerifyCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCodeInput) {
      setErrorMsg('Please enter your current secret code.');
      return;
    }
    if (currentCodeInput !== chatSecretCode) {
      setErrorMsg('Incorrect secret code. If you forgot your code, click "Forgot code?" below.');
      return;
    }
    setErrorMsg('');
    setStep('new');
  };

  const handleSendEmailOtp = () => {
    // Generate a secure 6-digit random numeric OTP
    setErrorMsg('Email verification is not available yet.');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    if (!generatedOtp || enteredOtp.trim() !== generatedOtp.trim()) {
      setErrorMsg('Invalid verification code. Please check your email or resend.');
      return;
    }
    setErrorMsg('');
    showToast('Email verified successfully! You may now set a new secret code.');
    setStep('new');
  };

  const handleSaveNewCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) {
      setErrorMsg('Please enter a new secret code.');
      return;
    }
    if (newCode !== confirmNewCode) {
      setErrorMsg('Secret codes do not match. Please ensure both fields match exactly.');
      return;
    }
    setErrorMsg('');
    setChatSecretCode(newCode);
    showToast('Secret code updated successfully! Use your new code to unlock the vault.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {step === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setStep('verify');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Key className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {step === 'verify' && 'Verify Current Secret Code'}
                {step === 'forgot' && 'Reset Code via Email'}
                {step === 'new' && 'Set New Secret Code'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {step === 'verify' && 'Enter your existing code to continue'}
                {step === 'forgot' && 'Verify your account identity to reset your code'}
                {step === 'new' && 'Create your new secret vault unlock code'}
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

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Verify Current Code */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCurrent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Current Secret Code
              </label>
              <input
                type="text"
                autoFocus
                value={currentCodeInput}
                onChange={e => {
                  setCurrentCodeInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Enter your current code"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setStep('forgot');
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Forgot code?
              </button>

              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Verify & Continue
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Forgot Code / Email Verification */}
        {step === 'forgot' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>Account Email</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] truncate">
                {currentUser.email || 'jatindevsingh644@gmail.com'}
              </p>
            </div>

            {!emailOtpSent ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click below to receive a 6-digit one-time security verification code at your registered email address.
                </p>
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Send Verification Code
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
                  <span>Verification code sent!</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Enter 6-digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={enteredOtp}
                    onChange={e => {
                      setEnteredOtp(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="e.g. 748291"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono tracking-widest text-center text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    Resend code
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Verify Code
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Step 3: Set New Secret Code */}
        {step === 'new' && (
          <form onSubmit={handleSaveNewCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                New Secret Code
              </label>
              <input
                type="text"
                autoFocus
                value={newCode}
                onChange={e => {
                  setNewCode(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Any letter, number, emoji, space, or symbol"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Secret Code
              </label>
              <input
                type="text"
                value={confirmNewCode}
                onChange={e => {
                  setConfirmNewCode(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Confirm your secret code"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Note: This code is case-sensitive and space-sensitive. Typing this exact code in the Messages search bar unlocks your Secret Vault.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
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
                Save New Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
