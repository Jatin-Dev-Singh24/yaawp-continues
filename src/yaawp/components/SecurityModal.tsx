// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useMemo } from 'react';
import {
  X,
  Shield,
  Lock,
  KeyRound,
  AlertTriangle,
  History,
  Download,
  Trash2,
  CheckCircle2,
  Smartphone,
  Eye,
  EyeOff,
  Clock,
  FileSpreadsheet,
  Link2,
  RefreshCw,
  Bell,
  Mail,
  Check,
  Send,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SecurityModal: React.FC = () => {
  const {
    isSecurityModalOpen,
    setIsSecurityModalOpen,
    chatPasscode,
    setChatPasscode,
    verifyPreviousPasscode,
    failedLoginAttempts,
    lockoutUntil,
    failedLoginsAlert,
    resetFailedLogins,
    auditLogs,
    exportGDPRData,
    deleteAccountPermanently,
    changePassword,
    twoFactorEnabled,
    enableTwoFactorWithPassword,
    changeTwoFactorPassword,
    disableTwoFactorWithPassword,
    resetTwoFactorViaEmail,
    privateMediaSignedUrlsEnabled,
    setPrivateMediaSignedUrlsEnabled,
    currentUser,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'passcode' | 'password' | 'audit' | 'privacy' | 'lockout'>('passcode');

  // Chat passcode state
  const [passcodeMode, setPasscodeMode] = useState<'update' | 'disable' | 'forgot'>('update');
  const [previousPin, setPreviousPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Passcode forgot flow
  const [passcodeResetCode, setPasscodeResetCode] = useState('');
  const [enteredPasscodeCode, setEnteredPasscodeCode] = useState('');
  const [isPasscodeCodeSent, setIsPasscodeCodeSent] = useState(false);

  // 2FA state
  const [twoFaMode, setTwoFaMode] = useState<'change' | 'disable' | 'forgot'>('change');
  const [initialTwoFaPw, setInitialTwoFaPw] = useState('');
  const [initialTwoFaConfirm, setInitialTwoFaConfirm] = useState('');
  const [showInitialTwoFaPw, setShowInitialTwoFaPw] = useState(false);

  const [currentTwoFaPw, setCurrentTwoFaPw] = useState('');
  const [newTwoFaPw, setNewTwoFaPw] = useState('');
  const [confirmNewTwoFaPw, setConfirmNewTwoFaPw] = useState('');
  const [showCurrentTwoFa, setShowCurrentTwoFa] = useState(false);
  const [showNewTwoFa, setShowNewTwoFa] = useState(false);

  // 2FA forgot flow
  const [twoFaResetCode, setTwoFaResetCode] = useState('');
  const [enteredTwoFaCode, setEnteredTwoFaCode] = useState('');
  const [isTwoFaCodeSent, setIsTwoFaCodeSent] = useState(false);

  if (!isSecurityModalOpen) return null;

  // --- Chat Passcode Handlers ---
  const handleSetNewPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('Passcode must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PIN codes do not match');
      return;
    }
    setChatPasscode(newPin);
    setNewPin('');
    setConfirmPin('');
    showToast('Chat Passcode Lock configured successfully');
  };

  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (!verifyPreviousPasscode(previousPin)) {
      setPinError('Incorrect previous passcode. Verify your PIN or use Forgot Passcode.');
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('New passcode must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('New PIN codes do not match');
      return;
    }
    setChatPasscode(newPin);
    setPreviousPin('');
    setNewPin('');
    setConfirmPin('');
    showToast('Chat Passcode updated successfully');
  };

  const handleDisablePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (!verifyPreviousPasscode(previousPin)) {
      setPinError('Incorrect previous passcode. Cannot disable lock without valid PIN.');
      return;
    }
    setChatPasscode(null);
    setPreviousPin('');
    showToast('Chat Passcode Lock disabled');
  };

  const handleSendPasscodeOtp = () => {
    showToast('Email reset is not available yet.');
  };

  const handleResetPasscodeViaEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (!passcodeResetCode || enteredPasscodeCode !== passcodeResetCode) {
      setPinError('Invalid 6-digit email verification code');
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('Passcode must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('Passcodes do not match');
      return;
    }
    setChatPasscode(newPin);
    setEnteredPasscodeCode('');
    setPasscodeResetCode('');
    setIsPasscodeCodeSent(false);
    setNewPin('');
    setConfirmPin('');
    setPasscodeMode('update');
    showToast('Chat passcode successfully reset via email verification!');
  };

  // --- 2FA Handlers ---
  const handleEnableInitial2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialTwoFaPw || initialTwoFaPw.length < 4) {
      showToast('2FA Password must be at least 4 characters');
      return;
    }
    if (initialTwoFaPw !== initialTwoFaConfirm) {
      showToast('2FA Passwords do not match');
      return;
    }
    const success = enableTwoFactorWithPassword(initialTwoFaPw);
    if (success) {
      setInitialTwoFaPw('');
      setInitialTwoFaConfirm('');
    }
  };

  const handleChange2FAPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTwoFaPw) {
      showToast('Please enter your current 2FA password');
      return;
    }
    if (!newTwoFaPw || newTwoFaPw.length < 4) {
      showToast('New 2FA password must be at least 4 characters');
      return;
    }
    if (newTwoFaPw !== confirmNewTwoFaPw) {
      showToast('New passwords do not match');
      return;
    }
    const success = changeTwoFactorPassword(currentTwoFaPw, newTwoFaPw);
    if (success) {
      setCurrentTwoFaPw('');
      setNewTwoFaPw('');
      setConfirmNewTwoFaPw('');
    }
  };

  const handleDisable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTwoFaPw) {
      showToast('Enter your current 2FA password to disable');
      return;
    }
    const success = disableTwoFactorWithPassword(currentTwoFaPw);
    if (success) {
      setCurrentTwoFaPw('');
    }
  };

  const handleSend2FAOtp = () => {
    showToast('Email reset is not available yet.');
  };

  const handleReset2FAViaEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFaResetCode || enteredTwoFaCode !== twoFaResetCode) {
      showToast('Invalid 6-digit email verification code');
      return;
    }
    if (!newTwoFaPw || newTwoFaPw.length < 4) {
      showToast('New 2FA password must be at least 4 characters');
      return;
    }
    if (newTwoFaPw !== confirmNewTwoFaPw) {
      showToast('Passwords do not match');
      return;
    }
    const success = resetTwoFactorViaEmail(enteredTwoFaCode, newTwoFaPw);
    if (success) {
      setEnteredTwoFaCode('');
      setTwoFaResetCode('');
      setIsTwoFaCodeSent(false);
      setNewTwoFaPw('');
      setConfirmNewTwoFaPw('');
      setTwoFaMode('change');
    }
  };

  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;
  const lockoutRemainingHours = lockoutUntil
    ? Math.max(0, Math.ceil((lockoutUntil - Date.now()) / (1000 * 60 * 60)))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Yaawp Security Suite
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-lime-400 font-bold border border-lime-400/20">
                  ISO-27001
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Zero-knowledge chat protection, 2FA, and authentication audit</p>
            </div>
          </div>
          <button
            onClick={() => setIsSecurityModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Failed Logins Alert Banner */}
        {failedLoginsAlert && (
          <div className="bg-amber-950/40 border-b border-amber-800/60 p-3 px-5 flex items-start gap-2.5 text-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-amber-300">Security Alert:</span> Abnormal login failures detected. Daily attempt limit is monitored to prevent brute-force attacks.
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 pt-3 border-b border-zinc-800/60 overflow-x-auto no-scrollbar bg-zinc-900/20">
          {[
            { id: 'passcode', label: 'Chat Lock', icon: Lock },
            { id: 'password', label: 'Password & 2FA', icon: KeyRound },
            { id: 'audit', label: 'Audit Trail', icon: History },
            { id: 'lockout', label: 'Login Protection', icon: AlertTriangle },
            { id: 'privacy', label: 'GDPR & Storage', icon: Download }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-lime-400 border-b-2 border-lime-400 bg-zinc-800/60'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* TAB 1: Chat Passcode Lock */}
          {activeTab === 'passcode' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-lime-400/10 text-lime-400 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Direct Message Passcode Lock</h4>
                      <p className="text-[11px] text-zinc-400">
                        {chatPasscode ? 'Lock is currently ACTIVE (4-digit PIN required)' : 'No lock configured'}
                      </p>
                    </div>
                  </div>
                  {chatPasscode ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-lime-400/20 text-lime-300 border border-lime-400/30">
                      ENABLED
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      OFF
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  When enabled, entering your Messages tab requires your 4-digit PIN. Protects confidential threads, photos, and voice notes from casual snooping.
                </p>

                {pinError && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{pinError}</span>
                  </div>
                )}
              </div>

              {/* Case 1: If Chat Lock is NOT configured yet */}
              {!chatPasscode ? (
                <form onSubmit={handleSetNewPasscode} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <h5 className="text-xs font-bold text-zinc-200">Set New 4-Digit Passcode</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Set 4-digit PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={newPin}
                        onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-center tracking-widest text-sm text-lime-400 font-mono focus:outline-none focus:ring-1 focus:ring-lime-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Confirm PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={confirmPin}
                        onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-center tracking-widest text-sm text-lime-400 font-mono focus:outline-none focus:ring-1 focus:ring-lime-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={newPin.length !== 4 || confirmPin.length !== 4}
                    className="px-4 py-2 rounded-lg bg-lime-400 text-zinc-950 font-bold text-xs hover:bg-lime-300 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Enable Chat PIN Lock
                  </button>
                </form>
              ) : (
                /* Case 2: Chat Lock IS active -> Require previous passcode to update or disable, plus forgot passcode method */
                <div className="space-y-3">
                  {/* Mode switcher */}
                  <div className="flex items-center gap-2 p-1 bg-zinc-900 rounded-lg border border-zinc-800 text-xs">
                    <button
                      type="button"
                      onClick={() => { setPasscodeMode('update'); setPinError(''); }}
                      className={`flex-1 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        passcodeMode === 'update' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Change Passcode
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPasscodeMode('disable'); setPinError(''); }}
                      className={`flex-1 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        passcodeMode === 'disable' ? 'bg-zinc-800 text-rose-300 shadow-xs' : 'text-zinc-400 hover:text-rose-300'
                      }`}
                    >
                      Disable Lock
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPasscodeMode('forgot'); setPinError(''); }}
                      className={`flex-1 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        passcodeMode === 'forgot' ? 'bg-zinc-800 text-amber-300 shadow-xs' : 'text-zinc-400 hover:text-amber-300'
                      }`}
                    >
                      Forgot Passcode?
                    </button>
                  </div>

                  {/* Mode A: Change Passcode (Requires Previous Passcode) */}
                  {passcodeMode === 'update' && (
                    <form onSubmit={handleUpdatePasscode} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                      <h5 className="text-xs font-bold text-zinc-200">Confirm Previous Passcode & Set New PIN</h5>
                      
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Previous 4-digit Passcode (Required)</label>
                        <input
                          type="password"
                          maxLength={4}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={previousPin}
                          onChange={e => setPreviousPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••"
                          className="w-40 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-center tracking-widest text-sm text-lime-400 font-mono focus:outline-none focus:ring-1 focus:ring-lime-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">New 4-digit PIN</label>
                          <input
                            type="password"
                            maxLength={4}
                            pattern="[0-9]*"
                            inputMode="numeric"
                            value={newPin}
                            onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••"
                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-center tracking-widest text-sm text-lime-400 font-mono focus:outline-none focus:ring-1 focus:ring-lime-400"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Confirm New PIN</label>
                          <input
                            type="password"
                            maxLength={4}
                            pattern="[0-9]*"
                            inputMode="numeric"
                            value={confirmPin}
                            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••"
                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-center tracking-widest text-sm text-lime-400 font-mono focus:outline-none focus:ring-1 focus:ring-lime-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="submit"
                          disabled={previousPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4}
                          className="px-4 py-2 rounded-lg bg-lime-400 text-zinc-950 font-bold text-xs hover:bg-lime-300 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          Verify & Update Passcode
                        </button>
                        <button
                          type="button"
                          onClick={() => setPasscodeMode('forgot')}
                          className="text-xs text-amber-400 hover:underline cursor-pointer"
                        >
                          Forgot previous passcode?
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Mode B: Disable Passcode (Requires Previous Passcode) */}
                  {passcodeMode === 'disable' && (
                    <form onSubmit={handleDisablePasscode} className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <h5 className="text-xs font-bold text-rose-300">Disable Chat Lock</h5>
                      </div>
                      <p className="text-xs text-zinc-400">
                        To prevent unauthorized tampering, you must enter your current 4-digit passcode before disabling chat lock.
                      </p>
                      
                      <div className="w-48">
                        <label className="text-[11px] text-zinc-400 block mb-1">Enter Previous 4-Digit Passcode</label>
                        <input
                          type="password"
                          maxLength={4}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={previousPin}
                          onChange={e => setPreviousPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••"
                          className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-center tracking-widest text-sm text-rose-400 font-mono focus:outline-none focus:ring-1 focus:ring-rose-400"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={previousPin.length !== 4}
                          className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          Confirm & Disable Passcode
                        </button>
                        <button
                          type="button"
                          onClick={() => setPasscodeMode('forgot')}
                          className="text-xs text-zinc-400 hover:text-amber-400 underline cursor-pointer"
                        >
                          Forgot Passcode?
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Mode C: Forgot Passcode (Reset via Email Verification) */}
                  {passcodeMode === 'forgot' && (
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-amber-800/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-amber-400" />
                        <h5 className="text-xs font-bold text-amber-300">Reset Passcode via Email Verification</h5>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        If you do not remember your 4-digit PIN, we can send a 6-digit security code to your registered email address ({currentUser.email || 'jatindevsingh644@gmail.com'}).
                      </p>

                      {!isPasscodeCodeSent ? (
                        <button
                          type="button"
                          onClick={handleSendPasscodeOtp}
                          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Send 6-Digit Verification Code
                        </button>
                      ) : (
                        <form onSubmit={handleResetPasscodeViaEmail} className="space-y-3 pt-2">
                          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Verification code dispatched to your email. (Code: <span className="font-mono font-bold text-white">{passcodeResetCode}</span>)</span>
                          </div>

                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Enter 6-Digit Email Code</label>
                            <input
                              type="text"
                              maxLength={6}
                              value={enteredPasscodeCode}
                              onChange={e => setEnteredPasscodeCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="123456"
                              className="w-48 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-center tracking-widest text-sm text-lime-400 font-mono focus:outline-none focus:ring-1 focus:ring-lime-400"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-zinc-400 block mb-1">Set New 4-digit PIN</label>
                              <input
                                type="password"
                                maxLength={4}
                                pattern="[0-9]*"
                                inputMode="numeric"
                                value={newPin}
                                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="••••"
                                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-center tracking-widest text-sm text-lime-400 font-mono focus:outline-none focus:ring-1 focus:ring-lime-400"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-zinc-400 block mb-1">Confirm New PIN</label>
                              <input
                                type="password"
                                maxLength={4}
                                pattern="[0-9]*"
                                inputMode="numeric"
                                value={confirmPin}
                                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="••••"
                                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-center tracking-widest text-sm text-lime-400 font-mono focus:outline-none focus:ring-1 focus:ring-lime-400"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="submit"
                              disabled={enteredPasscodeCode.length !== 6 || newPin.length !== 4 || confirmPin.length !== 4}
                              className="px-4 py-2 rounded-lg bg-lime-400 text-zinc-950 font-bold text-xs hover:bg-lime-300 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              Verify Code & Reset Passcode
                            </button>
                            <button
                              type="button"
                              onClick={handleSendPasscodeOtp}
                              className="text-xs text-zinc-400 hover:text-white"
                            >
                              Resend Code
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Two-Factor Authentication (2FA) & Security Password */}
          {activeTab === 'password' && (
            <div className="space-y-4">
              {/* Top Summary Card */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-lime-400/10 text-lime-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</h5>
                      <p className="text-[11px] text-zinc-400">
                        {twoFactorEnabled
                          ? '2FA is ACTIVE and protected by your dedicated security password'
                          : '2FA is currently INACTIVE. Set a security password to activate.'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    twoFactorEnabled
                      ? 'bg-lime-400/20 text-lime-300 border border-lime-400/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {twoFactorEnabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
              </div>

              {/* Case 1: 2FA is NOT enabled yet */}
              {!twoFactorEnabled ? (
                <form onSubmit={handleEnableInitial2FA} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <div>
                    <h5 className="text-xs font-bold text-zinc-200">Set Up 2FA Security Protection</h5>
                    <p className="text-xs text-zinc-400 mt-1">
                      Choose a dedicated 2FA security password. This password will be required when authenticating new devices or accessing sensitive settings.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Set 2FA Security Password</label>
                    <div className="relative">
                      <input
                        type={showInitialTwoFaPw ? 'text' : 'password'}
                        value={initialTwoFaPw}
                        onChange={e => setInitialTwoFaPw(e.target.value)}
                        placeholder="Minimum 4 characters"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-lime-400 pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowInitialTwoFaPw(!showInitialTwoFaPw)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        {showInitialTwoFaPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Confirm 2FA Password</label>
                    <input
                      type="password"
                      value={initialTwoFaConfirm}
                      onChange={e => setInitialTwoFaConfirm(e.target.value)}
                      placeholder="Re-enter 2FA password"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!initialTwoFaPw || initialTwoFaPw.length < 4 || initialTwoFaPw !== initialTwoFaConfirm}
                    className="px-4 py-2 rounded-lg bg-lime-400 text-zinc-950 font-bold text-xs hover:bg-lime-300 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Save & Enable 2FA Protection
                  </button>
                </form>
              ) : (
                /* Case 2: 2FA IS enabled -> Show Current, New, Confirm, and Forgot Password */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-1 bg-zinc-900 rounded-lg border border-zinc-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setTwoFaMode('change')}
                      className={`flex-1 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        twoFaMode === 'change' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Change 2FA Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setTwoFaMode('disable')}
                      className={`flex-1 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        twoFaMode === 'disable' ? 'bg-zinc-800 text-rose-300 shadow-xs' : 'text-zinc-400 hover:text-rose-300'
                      }`}
                    >
                      Disable 2FA
                    </button>
                    <button
                      type="button"
                      onClick={() => setTwoFaMode('forgot')}
                      className={`flex-1 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        twoFaMode === 'forgot' ? 'bg-zinc-800 text-amber-300 shadow-xs' : 'text-zinc-400 hover:text-amber-300'
                      }`}
                    >
                      Forgot 2FA Password?
                    </button>
                  </div>

                  {/* Mode A: Change 2FA Password (Current, New, Confirm) */}
                  {twoFaMode === 'change' && (
                    <form onSubmit={handleChange2FAPassword} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                      <h5 className="text-xs font-bold text-zinc-200">Change 2FA Security Password</h5>

                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Current 2FA Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentTwoFa ? 'text' : 'password'}
                            value={currentTwoFaPw}
                            onChange={e => setCurrentTwoFaPw(e.target.value)}
                            placeholder="Enter current 2FA password"
                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-lime-400 pr-9"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentTwoFa(!showCurrentTwoFa)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                          >
                            {showCurrentTwoFa ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">New 2FA Password</label>
                          <div className="relative">
                            <input
                              type={showNewTwoFa ? 'text' : 'password'}
                              value={newTwoFaPw}
                              onChange={e => setNewTwoFaPw(e.target.value)}
                              placeholder="Minimum 4 characters"
                              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-lime-400 pr-9"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewTwoFa(!showNewTwoFa)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                            >
                              {showNewTwoFa ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Confirm New 2FA Password</label>
                          <input
                            type="password"
                            value={confirmNewTwoFaPw}
                            onChange={e => setConfirmNewTwoFaPw(e.target.value)}
                            placeholder="Re-enter new 2FA password"
                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-lime-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="submit"
                          disabled={!currentTwoFaPw || !newTwoFaPw || newTwoFaPw !== confirmNewTwoFaPw}
                          className="px-4 py-2 rounded-lg bg-lime-400 text-zinc-950 font-bold text-xs hover:bg-lime-300 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          Update 2FA Password
                        </button>
                        <button
                          type="button"
                          onClick={() => setTwoFaMode('forgot')}
                          className="text-xs text-amber-400 hover:underline cursor-pointer"
                        >
                          Forgot 2FA Password?
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Mode B: Disable 2FA (Requires Current 2FA Password) */}
                  {twoFaMode === 'disable' && (
                    <form onSubmit={handleDisable2FA} className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <h5 className="text-xs font-bold text-rose-300">Disable Two-Factor Authentication</h5>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Enter your current 2FA password to confirm disabling two-factor protection:
                      </p>

                      <div className="w-64">
                        <label className="text-[11px] text-zinc-400 block mb-1">Current 2FA Password</label>
                        <input
                          type="password"
                          value={currentTwoFaPw}
                          onChange={e => setCurrentTwoFaPw(e.target.value)}
                          placeholder="Current 2FA password"
                          className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={!currentTwoFaPw}
                          className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          Confirm & Disable 2FA
                        </button>
                        <button
                          type="button"
                          onClick={() => setTwoFaMode('forgot')}
                          className="text-xs text-zinc-400 hover:text-amber-400 underline cursor-pointer"
                        >
                          Forgot 2FA Password?
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Mode C: Forgot 2FA Password (Reset via Email OTP) */}
                  {twoFaMode === 'forgot' && (
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-amber-800/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-amber-400" />
                        <h5 className="text-xs font-bold text-amber-300">Reset 2FA Password via Email Verification</h5>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Forgot your 2FA password? We can send a secure 6-digit recovery code to your registered email ({currentUser.email || 'jatindevsingh644@gmail.com'}).
                      </p>

                      {!isTwoFaCodeSent ? (
                        <button
                          type="button"
                          onClick={handleSend2FAOtp}
                          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Send 6-Digit 2FA Recovery Code
                        </button>
                      ) : (
                        <form onSubmit={handleReset2FAViaEmail} className="space-y-3 pt-2">
                          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Recovery code sent to your email. (Code: <span className="font-mono font-bold text-white">{twoFaResetCode}</span>)</span>
                          </div>

                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Enter 6-Digit Email Code</label>
                            <input
                              type="text"
                              maxLength={6}
                              value={enteredTwoFaCode}
                              onChange={e => setEnteredTwoFaCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="123456"
                              className="w-48 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-center tracking-widest text-sm text-lime-400 font-mono focus:outline-none focus:ring-1 focus:ring-lime-400"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-zinc-400 block mb-1">Set New 2FA Password</label>
                              <input
                                type="password"
                                value={newTwoFaPw}
                                onChange={e => setNewTwoFaPw(e.target.value)}
                                placeholder="Minimum 4 characters"
                                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-lime-400"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-zinc-400 block mb-1">Confirm New 2FA Password</label>
                              <input
                                type="password"
                                value={confirmNewTwoFaPw}
                                onChange={e => setConfirmNewTwoFaPw(e.target.value)}
                                placeholder="Repeat new password"
                                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-lime-400"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="submit"
                              disabled={enteredTwoFaCode.length !== 6 || !newTwoFaPw || newTwoFaPw !== confirmNewTwoFaPw}
                              className="px-4 py-2 rounded-lg bg-lime-400 text-zinc-950 font-bold text-xs hover:bg-lime-300 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              Verify Code & Reset 2FA Password
                            </button>
                            <button
                              type="button"
                              onClick={handleSend2FAOtp}
                              className="text-xs text-zinc-400 hover:text-white"
                            >
                              Resend Code
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Audit Trail */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white">Immutable Security Audit Trail</h5>
                  <p className="text-[11px] text-zinc-400">
                    Live logs of connections, message reads, media opens, and auth events
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-lime-400">
                  {auditLogs.length} Events Logged
                </span>
              </div>

              <div className="border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800/80 bg-zinc-900/40">
                {auditLogs.slice(0, 8).map(log => (
                  <div key={log.id} className="p-2.5 px-3 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        log.status === 'warning' ? 'bg-amber-400' : 'bg-lime-400'
                      }`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-200">{log.action}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                            {log.actor}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">{log.details}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 text-[10px] text-zinc-500 font-mono">
                      <div>{log.timestamp}</div>
                      <div>{log.ipAddress}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Login Protection & Lockout */}
          {activeTab === 'lockout' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white">Daily Failed-Login Rate Limiting</h5>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isLockedOut ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-lime-400/10 text-lime-400'
                  }`}>
                    {isLockedOut ? 'ACCOUNT LOCKED (24-HR)' : 'NORMAL OPERATION'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  5 wrong chat PINs in a row lock the chat on this device for 60 seconds. The lock survives page refreshes and cannot be skipped.
                </p>

                <div className="p-3 rounded-lg bg-zinc-800/60 border border-zinc-750 flex items-center justify-between text-xs">
                  <span className="text-zinc-300">Consecutive Failed Attempts:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lime-400">{failedLoginAttempts} / 5</span>
                    <span className="text-[11px] text-zinc-400">({5 - failedLoginAttempts} attempts remaining)</span>
                  </div>
                </div>

                {isLockedOut && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs space-y-1">
                    <p className="font-bold">Chat Locked</p>
                    <p className="text-[11px]">Try again in about a minute</p>
                  </div>
                )}

                {/* Explanation of Reset Failed Logins Counter */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300 font-bold text-[11px]">
                    <HelpCircle className="w-3.5 h-3.5 text-lime-400" />
                    <span>What happens when you click "Reset Failed Logins Counter"?</span>
                  </div>
                  <ul className="text-[11px] text-zinc-400 space-y-1 pl-4 list-disc leading-relaxed">
                    <li>It <strong className="text-zinc-200">clears the failed authentication tally back to 0/5</strong>.</li>
                    <li>It <strong className="text-zinc-200">does not lift an active lock</strong> — you must wait for the timer to end.</li>
                    <li>It restores all <strong className="text-zinc-200">5 login attempts</strong> fresh.</li>
                    <li>It records an event in the Audit Trail for security tracking.</li>
                  </ul>
                </div>

                <div className="pt-1">
                  <button
                    onClick={resetFailedLogins}
                    className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer border border-zinc-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-lime-400" />
                    Reset Failed Logins Counter (Restore 5 Attempts)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GDPR & Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              {/* Private Media Signed Links */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-lime-400" />
                    <h5 className="text-xs font-bold text-white">Private Media Signed URLs</h5>
                  </div>
                  <button
                    onClick={() => {
                      setPrivateMediaSignedUrlsEnabled(!privateMediaSignedUrlsEnabled);
                      showToast(privateMediaSignedUrlsEnabled ? 'Standard URLs restored' : 'Short-lived signed URLs (15m expiry) active');
                    }}
                    className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                      privateMediaSignedUrlsEnabled ? 'bg-lime-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {privateMediaSignedUrlsEnabled ? 'Enabled (15m)' : 'Standard'}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  All photos and videos in chats and private communities are delivered via cryptographically signed temporary tokens that expire after 15 minutes.
                </p>
              </div>

              {/* GDPR Data Export */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-lime-400" />
                  GDPR Article 20: Data Portability Export
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Download a machine-readable JSON archive containing all your profile data, posts, messages, comments, and security audit records.
                </p>
                <button
                  onClick={exportGDPRData}
                  className="px-3.5 py-1.5 rounded-lg bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-bold hover:bg-lime-400/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Complete Data (.json)
                </button>
              </div>

              {/* Permanent Account Deletion */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-2">
                <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  Permanent Account Deletion (Right to Erasure)
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Irreversibly delete your account, posts, direct messages, followers, and private media buckets from database servers.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to permanently delete your account? All data will be wiped.')) {
                      deleteAccountPermanently();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold hover:bg-rose-900 transition-colors cursor-pointer"
                >
                  Permanently Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
