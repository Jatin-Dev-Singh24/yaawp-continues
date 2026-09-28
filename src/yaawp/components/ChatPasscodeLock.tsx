import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, CheckCircle2, KeyRound, Fingerprint, Delete, ShieldAlert, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ChatPasscodeLock: React.FC = () => {
  const {
    chatPasscode,
    isChatLocked,
    unlockChat,
    setChatPasscode,
    showToast,
    failedLoginAttempts,
    recordFailedLogin,
    currentUser
  } = useApp();

  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  // Email Reset Flow States: 'lock' | 'email_request' | 'code_verify' | 'set_new_pin'
  const [resetStep, setResetStep] = useState<'lock' | 'email_request' | 'code_verify' | 'set_new_pin'>('lock');
  const [emailInput, setEmailInput] = useState(() => currentUser.email || `${currentUser.username || 'creator'}@gmail.com`);
  const [sentCode, setSentCode] = useState<string>('');
  const [codeDigits, setCodeDigits] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmNewPin, setConfirmNewPin] = useState<string>('');
  const [resetError, setResetError] = useState<string>('');
  const [isSendingCode, setIsSendingCode] = useState(false);

  if (!isChatLocked || !chatPasscode) {
    return null;
  }

  // --- Lock Screen Handlers ---
  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === 4) {
      setTimeout(() => {
        const success = unlockChat(nextPin);
        if (!success) {
          setErrorShake(true);
          recordFailedLogin();
          setTimeout(() => {
            setPin('');
            setErrorShake(false);
          }, 600);
        } else {
          setPin('');
        }
      }, 150);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleBiometricUnlock = () => {
    showToast('Biometric Face ID / Touch ID Authenticated');
    unlockChat(chatPasscode);
  };

  // --- Email Reset Handlers ---
  const handleSendResetEmail = () => {
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setResetError('Please enter a valid email address');
      return;
    }
    setResetError('');
    setIsSendingCode(true);

    setTimeout(() => {
      // Generate a 6-digit verification code
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(generated);
      setIsSendingCode(false);
      setResetStep('code_verify');
      showToast(`Passcode reset code sent to ${emailInput}! Code: ${generated}`);
    }, 700);
  };

  const handleVerifyCode = () => {
    if (codeDigits.trim() !== sentCode.trim()) {
      setResetError('Invalid verification code. Please check your inbox.');
      return;
    }
    setResetError('');
    setResetStep('set_new_pin');
  };

  const handleSaveNewPin = () => {
    if (newPin.length !== 4) {
      setResetError('Passcode must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmNewPin) {
      setResetError('Passcodes do not match. Please re-enter.');
      return;
    }

    setChatPasscode(newPin);
    setResetStep('lock');
    setPin('');
    setNewPin('');
    setConfirmNewPin('');
    setCodeDigits('');
    setResetError('');
    showToast('Passcode updated successfully! Enter your new PIN to unlock.');
  };

  const handleCancelReset = () => {
    setResetStep('lock');
    setResetError('');
    setCodeDigits('');
    setNewPin('');
    setConfirmNewPin('');
  };

  // 1. Email Reset Flow: Step 1 (Request Email Code)
  if (resetStep === 'email_request') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white select-none">
        <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
            <Mail className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reset Passcode via Email
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              We'll send a 6-digit security verification code to your registered email to confirm your identity.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Account Email Address
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {resetError && <p className="text-[11px] text-rose-500 font-medium">{resetError}</p>}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={isSendingCode}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingCode ? 'Sending Security Code...' : 'Send Verification Code'}</span>
            </button>

            <button
              type="button"
              onClick={handleCancelReset}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to PIN Entry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Email Reset Flow: Step 2 (Verify 6-digit Code)
  if (resetStep === 'code_verify') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white select-none">
        <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Enter Verification Code
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter the 6-digit code sent to <span className="font-semibold text-slate-800 dark:text-slate-200">{emailInput}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <input
              type="text"
              maxLength={6}
              value={codeDigits}
              onChange={e => setCodeDigits(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full tracking-widest text-center text-xl font-mono py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {sentCode && (
              <p className="text-[11px] text-center text-slate-400">
                Code helper: <span className="font-mono text-indigo-500 dark:text-indigo-400 font-bold">{sentCode}</span>
              </p>
            )}
            {resetError && <p className="text-[11px] text-center text-rose-500 font-medium">{resetError}</p>}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={codeDigits.length < 6}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verify Code</span>
            </button>

            <button
              type="button"
              onClick={handleSendResetEmail}
              className="w-full py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-center"
            >
              Resend verification code
            </button>

            <button
              type="button"
              onClick={handleCancelReset}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Email Reset Flow: Step 3 (Set New 4-digit PIN)
  if (resetStep === 'set_new_pin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white select-none">
        <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Set New Chat Passcode
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Identity verified! Create a new 4-digit PIN for your secret messages.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                New 4-Digit Passcode
              </label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full tracking-widest text-center text-lg font-mono py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Confirm Passcode
              </label>
              <input
                type="password"
                maxLength={4}
                value={confirmNewPin}
                onChange={e => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full tracking-widest text-center text-lg font-mono py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {resetError && <p className="text-[11px] text-center text-rose-500 font-medium">{resetError}</p>}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSaveNewPin}
              disabled={newPin.length !== 4 || confirmNewPin.length !== 4}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save &amp; Update PIN</span>
            </button>

            <button
              type="button"
              onClick={handleCancelReset}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: Protected Lock Screen with Keypad
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white select-none">
      <div className={`w-full max-w-xs flex flex-col items-center text-center ${errorShake ? 'animate-shake' : ''}`}>
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-md mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Protected Direct Messages
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
          Enter your 4-digit security PIN to access end-to-end encrypted conversations
        </p>

        {/* 4 PIN Dots */}
        <div className="flex items-center gap-4 my-6">
          {[0, 1, 2, 3].map(index => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-indigo-600 dark:bg-indigo-500 scale-110 shadow-[0_0_10px_rgba(79,70,229,0.5)]'
                    : 'border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              />
            );
          })}
        </div>

        {failedLoginAttempts > 0 && (
          <p className="text-[11px] text-rose-500 mb-2 font-medium">
            Incorrect PIN ({failedLoginAttempts} attempts)
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 text-lg font-semibold text-slate-900 dark:text-white active:scale-95 transition-all flex items-center justify-center shadow-xs cursor-pointer"
            >
              {num}
            </button>
          ))}

          {/* Biometric Face/Touch ID Simulation */}
          <button
            type="button"
            onClick={handleBiometricUnlock}
            className="h-14 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            title="Biometric Instant Unlock"
          >
            <Fingerprint className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 text-lg font-semibold text-slate-900 dark:text-white active:scale-95 transition-all flex items-center justify-center shadow-xs cursor-pointer"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Secure Reset Helper via Email */}
        <div className="flex items-center justify-center w-full mt-6 text-[11px] text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setResetStep('email_request')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
            <span>Forgot PIN? Reset passcode via email</span>
          </button>
        </div>
      </div>
    </div>
  );
};
