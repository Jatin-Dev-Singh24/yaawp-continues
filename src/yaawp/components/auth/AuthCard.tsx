import React, { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff, AlertCircle, Check, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PeacockWatcher } from '../PeacockWatcher';
import { UserProfile, LegalDocType } from '../../types';
import { ChooseLanguageStep } from './ChooseLanguageStep';
import { getLanguageByCode } from '../../translations';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import {
  checkUsernameAvailability,
  sanitizeUsername
} from '../../utils/usernameValidation';

interface AuthCardProps {
  initialMode?: 'login' | 'signup';
  isModal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  initialMode = 'login',
  isModal = false,
  onClose,
  onSuccess
}) => {
  const navigate = useNavigate();
  const {
    createAccount,
    loginWithSupabase,
    userProfiles,
    switchAccount,
    showToast,
    isSupabaseConfigured,
    openLegalModal,
    setActiveLegalDoc,
    setActiveTab,
    loginWithGoogle,
    preferredLanguage,
    setPreferredLanguage
  } = useApp();

  const handleOpenLegalDoc = (doc: LegalDocType) => {
    setActiveLegalDoc(doc);
    setActiveTab('legal');
    if (isModal && onClose) {
      onClose();
    }
    navigate(`/app/legal?doc=${doc}`);
  };

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Form Fields - Signup
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [agreedToLegal, setAgreedToLegal] = useState(false);

  // Form Fields - Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Peacock Interaction Tracking
  const [activeField, setActiveField] = useState<
    'idle' | 'username' | 'email' | 'password' | 'confirmPassword'
  >('idle');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // hCaptcha state & refs
  // Default test sitekey works in development/testing without secret key issues: 10000000-ffff-ffff-ffff-000000000001
  const hcaptchaSiteKey = import.meta.env?.VITE_HCAPTCHA_SITEKEY || '10000000-ffff-ffff-ffff-000000000001';
  const [loginCaptchaToken, setLoginCaptchaToken] = useState<string | null>(null);
  const [signupCaptchaToken, setSignupCaptchaToken] = useState<string | null>(null);
  const loginCaptchaRef = useRef<HCaptcha | null>(null);
  const signupCaptchaRef = useRef<HCaptcha | null>(null);

  // Language Step (Required after signup)
  const [isLanguageStep, setIsLanguageStep] = useState(false);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>(() => preferredLanguage || 'en');
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsGoogleSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to authenticate with Google.');
        return;
      }
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/app/home');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  // Signup live username check state
  const [signupUsernameStatus, setSignupUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [signupUsernameMessage, setSignupUsernameMessage] = useState<string | null>(null);
  const [signupSuggestions, setSignupSuggestions] = useState<string[]>([]);
  const usernameCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  const checkSignupUsernameAvailability = async (raw: string) => {
    const clean = sanitizeUsername(raw);
    if (!clean) {
      setSignupUsernameStatus('idle');
      setSignupUsernameMessage(null);
      setSignupSuggestions([]);
      return;
    }
    if (clean.length < 3) {
      setSignupUsernameStatus('invalid');
      setSignupUsernameMessage('Username must be at least 3 characters.');
      setSignupSuggestions([]);
      return;
    }

    setSignupUsernameStatus('checking');
    try {
      const res = await checkUsernameAvailability(clean, userProfiles);
      if (!res.isValid) {
        setSignupUsernameStatus('invalid');
        setSignupUsernameMessage(res.error || 'Invalid username format.');
        setSignupSuggestions(res.suggestions);
      } else if (!res.isAvailable) {
        setSignupUsernameStatus('taken');
        setSignupUsernameMessage(res.error || `This username @${clean} is already taken.`);
        setSignupSuggestions(res.suggestions);
      } else {
        setSignupUsernameStatus('available');
        setSignupUsernameMessage(`@${clean} is available!`);
        setSignupSuggestions([]);
      }
    } catch {
      setSignupUsernameStatus('available');
      setSignupUsernameMessage(null);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (usernameCheckTimerRef.current) clearTimeout(usernameCheckTimerRef.current);
    };
  }, []);

  const handleFieldChange = (
    field: 'username' | 'email' | 'password' | 'confirmPassword',
    setter: (val: string) => void,
    value: string
  ) => {
    setter(value);
    setErrorMessage(null);
    setActiveField(field);
    setIsTyping(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 650);

    if (field === 'username') {
      if (usernameCheckTimerRef.current) clearTimeout(usernameCheckTimerRef.current);
      usernameCheckTimerRef.current = setTimeout(() => {
        checkSignupUsernameAvailability(value);
      }, 350);
    }
  };

  const handleFieldFocus = (field: 'username' | 'email' | 'password' | 'confirmPassword') => {
    setActiveField(field);
    setErrorMessage(null);
  };

  const handleFieldBlur = () => {
    setActiveField('idle');
    setIsTyping(false);
  };

  const switchAuthMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setErrorMessage(null);
    setActiveField('idle');
    setIsTyping(false);
    if (!isModal) {
      navigate(newMode === 'login' ? '/auth/login' : '/auth/signup');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = loginUsername.trim();
    const pass = loginPassword.trim();

    if (!identifier || !pass) {
      setErrorMessage('Please enter your username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured) {
        let emailToUse = identifier;
        const profilesList = Object.values(userProfiles) as UserProfile[];
        if (!identifier.includes('@')) {
          const matched = profilesList.find(
            p => p.username.toLowerCase() === identifier.toLowerCase()
          );
          if (matched?.email) {
            emailToUse = matched.email;
          } else {
            emailToUse = `${identifier.toLowerCase()}@yaawp.internal`;
          }
        }

        const res = await loginWithSupabase(emailToUse, pass, loginCaptchaToken || undefined);
        if (!res.success) {
          loginCaptchaRef.current?.resetCaptcha();
          setLoginCaptchaToken(null);
          const matchedProfile = profilesList.find(
            p => p.username.toLowerCase() === identifier.toLowerCase()
          );
          if (matchedProfile) {
            switchAccount(matchedProfile.id);
            showToast(`Welcome back, @${matchedProfile.username}`);
            if (onSuccess) onSuccess();
            else navigate('/app/home');
            return;
          }
          setErrorMessage(res.error || 'Invalid credentials.');
          return;
        }
      } else {
        const profilesList = Object.values(userProfiles) as UserProfile[];
        const matched = profilesList.find(
          p =>
            p.username.toLowerCase() === identifier.toLowerCase() ||
            p.email?.toLowerCase() === identifier.toLowerCase()
        );
        if (matched) {
          switchAccount(matched.id);
          showToast(`Welcome back, @${matched.username}`);
        } else {
          setErrorMessage('No account found with this username or email. Please create an account via Sign Up.');
          return;
        }
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/app/home');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = signupUsername.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    const cleanEmail = signupEmail.trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage('Please choose a username of at least 3 characters.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!agreedToLegal) {
      setErrorMessage('Please check the box to agree to the Terms of Service, Community Guidelines, Privacy Policy, and Cookie Uses.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAccount({
        username: cleanUsername,
        contact: cleanEmail,
        name: cleanUsername,
        password: signupPassword,
        birthday: '2000-01-01',
        agreedToTerms: agreedToLegal,
        agreedToPrivacy: agreedToLegal,
        agreedToCookies: agreedToLegal,
        agreedToCommunity: agreedToLegal,
        captchaToken: signupCaptchaToken || undefined
      });

      if (!res.success) {
        signupCaptchaRef.current?.resetCaptcha();
        setSignupCaptchaToken(null);
        setErrorMessage(res.error || 'Failed to create account.');
        return;
      }

      showToast(`Account created for @${cleanUsername}! Please choose your preferred language.`);
      setIsLanguageStep(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmLanguageAndEnter = async () => {
    setIsSavingLanguage(true);
    try {
      setPreferredLanguage(selectedLanguageCode);
      const langObj = getLanguageByCode(selectedLanguageCode);
      showToast(`Language set to ${langObj.nativeName} (${langObj.name})! Welcome to YAAWP.`);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/app/home');
      }
    } catch (err: any) {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/app/home');
      }
    } finally {
      setIsSavingLanguage(false);
    }
  };

  const currentPasswordVisible =
    mode === 'login'
      ? showLoginPassword
      : activeField === 'confirmPassword'
      ? showSignupConfirmPassword
      : showSignupPassword;

  return (
    <div
      id="yaawp-auth-panel"
      className="relative w-full max-w-[420px] bg-[#0c0c0e] border border-zinc-800/70 p-7 sm:p-9 my-auto select-none shadow-2xl rounded-2xl"
      onClick={e => e.stopPropagation()}
    >
      {/* Optional Close Button for Modal */}
      {isModal && onClose && !isLanguageStep && (
        <button
          id="auth-close-btn"
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-200 transition-colors p-1 focus:outline-none cursor-pointer"
          aria-label="Close authentication"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {isLanguageStep ? (
        <ChooseLanguageStep
          selectedCode={selectedLanguageCode}
          onSelectCode={setSelectedLanguageCode}
          onConfirm={handleConfirmLanguageAndEnter}
          isSubmitting={isSavingLanguage}
        />
      ) : (
        <>
          {/* Peacock Seated Naturally Above the Authentication Form */}
          <div className="w-full flex flex-col items-center justify-center pt-1 pb-2">
        <PeacockWatcher
          activeField={activeField}
          isTyping={isTyping}
          isPasswordVisible={currentPasswordVisible}
          isConfirmPasswordVisible={showSignupConfirmPassword}
        />
        {/* Subtle Yaawp Wordmark in MonteCarlo */}
        <span className="font-monte-carlo text-4xl sm:text-5xl text-zinc-100 font-normal tracking-wide mt-1 select-none">
          Yaawp
        </span>
      </div>

      {/* Seamless Tab Switcher: Log In | Sign Up */}
      <div
        id="auth-mode-tabs"
        className="flex items-center justify-center gap-8 mt-6 mb-7 text-xs tracking-[0.22em] uppercase font-light"
      >
        <button
          id="tab-login"
          type="button"
          onClick={() => switchAuthMode('login')}
          className={`pb-1 transition-all border-b cursor-pointer ${
            mode === 'login'
              ? 'text-zinc-100 border-zinc-200 font-normal'
              : 'text-zinc-500 border-transparent hover:text-zinc-300 font-light'
          }`}
        >
          Log in
        </button>
        <button
          id="tab-signup"
          type="button"
          onClick={() => switchAuthMode('signup')}
          className={`pb-1 transition-all border-b cursor-pointer ${
            mode === 'signup'
              ? 'text-zinc-100 border-zinc-200 font-normal'
              : 'text-zinc-500 border-transparent hover:text-zinc-300 font-light'
          }`}
        >
          Sign up
        </button>
      </div>

      {/* Error Feedback Message */}
      {errorMessage && (
        <div
          id="auth-error-message"
          className="mb-5 px-3 py-2 text-xs font-light text-rose-300 bg-rose-950/30 border border-rose-900/40 flex items-center gap-2 rounded-lg"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Forms Container */}
      <AnimatePresence mode="wait">
        {mode === 'login' ? (
          /* --- LOGIN FORM --- */
          <motion.form
            key="login-form"
            id="login-form"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            onSubmit={handleLoginSubmit}
            className="space-y-4"
          >
            {/* Continue with Google button */}
            <button
              id="auth-google-login-btn"
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleSubmitting || isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-700/80 bg-zinc-900/90 hover:bg-zinc-800 text-xs tracking-wider text-zinc-200 hover:text-white font-medium flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleSubmitting ? 'Connecting Google...' : 'Continue with Google'}</span>
            </button>

            {/* Subtle divider */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="w-full border-t border-zinc-800"></div>
              <span className="absolute bg-[#0c0c0e] px-2 text-[10px] tracking-widest uppercase text-zinc-500 font-light">
                or
              </span>
            </div>

            {/* Username field */}
            <div className="space-y-1">
              <label
                htmlFor="login-username"
                className="block text-[11px] tracking-[0.16em] uppercase font-light text-zinc-400"
              >
                Username
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={loginUsername}
                onChange={e => handleFieldChange('username', setLoginUsername, e.target.value)}
                onFocus={() => handleFieldFocus('username')}
                onBlur={handleFieldBlur}
                placeholder="name or @handle"
                className="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-300 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none transition-colors duration-200 font-light"
                required
              />
            </div>

            {/* Password field with show/hide eye control */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-[11px] tracking-[0.16em] uppercase font-light text-zinc-400"
                >
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={e => handleFieldChange('password', setLoginPassword, e.target.value)}
                  onFocus={() => handleFieldFocus('password')}
                  onBlur={handleFieldBlur}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-300 py-2 pr-10 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none transition-colors duration-200 font-light"
                  required
                />
                <button
                  id="toggle-login-password-visibility-btn"
                  type="button"
                  onClick={() => setShowLoginPassword(prev => !prev)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer rounded-md"
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* hCaptcha for Login */}
            <div className="flex justify-center pt-2 overflow-hidden">
              <HCaptcha
                id="login-hcaptcha"
                ref={loginCaptchaRef}
                sitekey={hcaptchaSiteKey}
                theme="dark"
                size="normal"
                onVerify={(token) => {
                  setLoginCaptchaToken(token);
                  setErrorMessage(null);
                }}
                onExpire={() => setLoginCaptchaToken(null)}
                onError={() => {
                  setLoginCaptchaToken(null);
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 py-3 text-xs tracking-[0.24em] uppercase font-normal text-black bg-zinc-100 hover:bg-white active:bg-zinc-300 transition-colors duration-200 disabled:opacity-40 cursor-pointer focus:outline-none rounded-lg"
            >
              {isSubmitting ? 'Entering...' : 'Log In'}
            </button>
          </motion.form>
        ) : (
          /* --- SIGNUP FORM --- */
          <motion.form
            key="signup-form"
            id="signup-form"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            onSubmit={handleSignupSubmit}
            className="space-y-3.5"
          >
            {/* Continue with Google button */}
            <button
              id="auth-google-signup-btn"
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleSubmitting || isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-700/80 bg-zinc-900/90 hover:bg-zinc-800 text-xs tracking-wider text-zinc-200 hover:text-white font-medium flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleSubmitting ? 'Connecting Google...' : 'Continue with Google'}</span>
            </button>

            {/* Subtle divider */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="w-full border-t border-zinc-800"></div>
              <span className="absolute bg-[#0c0c0e] px-2 text-[10px] tracking-widest uppercase text-zinc-500 font-light">
                or
              </span>
            </div>

            {/* Username field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="signup-username"
                  className="block text-[11px] tracking-[0.16em] uppercase font-light text-zinc-400"
                >
                  Username
                </label>
                {signupUsernameStatus === 'checking' && (
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Checking...
                  </span>
                )}
                {signupUsernameStatus === 'available' && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                    <Check className="w-2.5 h-2.5" /> Available
                  </span>
                )}
                {signupUsernameStatus === 'taken' && (
                  <span className="text-[10px] text-rose-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-2.5 h-2.5" /> Taken
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  id="signup-username"
                  type="text"
                  autoComplete="username"
                  value={signupUsername}
                  onChange={e => handleFieldChange('username', setSignupUsername, e.target.value)}
                  onFocus={() => handleFieldFocus('username')}
                  onBlur={handleFieldBlur}
                  placeholder="@yourhandle"
                  className={`w-full bg-transparent border-b py-1.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none transition-colors duration-200 font-light ${
                    signupUsernameStatus === 'available'
                      ? 'border-emerald-500/80 focus:border-emerald-400'
                      : signupUsernameStatus === 'taken' || signupUsernameStatus === 'invalid'
                      ? 'border-rose-500/80 focus:border-rose-400'
                      : 'border-zinc-800 focus:border-zinc-300'
                  }`}
                  required
                />
                <div className="absolute right-1">
                  {signupUsernameStatus === 'available' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : signupUsernameStatus === 'taken' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  ) : null}
                </div>
              </div>

              {/* Taken username message & suggestions */}
              {signupUsernameStatus === 'taken' && (
                <div className="pt-1 space-y-1.5">
                  <p className="text-[11px] text-rose-400 font-medium">
                    {signupUsernameMessage || `This username is already taken.`}
                  </p>
                  {signupSuggestions.length > 0 && (
                    <div className="bg-zinc-900/70 border border-zinc-800 p-2.5 rounded-lg space-y-1.5">
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                        Available suggestions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {signupSuggestions.map(sug => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => {
                              setSignupUsername(sug);
                              checkSignupUsernameAvailability(sug);
                            }}
                            className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 hover:border-emerald-500/60 text-zinc-300 hover:text-emerald-300 font-mono transition-colors cursor-pointer"
                          >
                            @{sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Email field */}
            <div className="space-y-1">
              <label
                htmlFor="signup-email"
                className="block text-[11px] tracking-[0.16em] uppercase font-light text-zinc-400"
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={signupEmail}
                onChange={e => handleFieldChange('email', setSignupEmail, e.target.value)}
                onFocus={() => handleFieldFocus('email')}
                onBlur={handleFieldBlur}
                placeholder="your.email@domain.com"
                className="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-300 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none transition-colors duration-200 font-light"
                required
              />
            </div>

            {/* Password field with eye toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="signup-password"
                  className="block text-[11px] tracking-[0.16em] uppercase font-light text-zinc-400"
                >
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <input
                  id="signup-password"
                  type={showSignupPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={signupPassword}
                  onChange={e => handleFieldChange('password', setSignupPassword, e.target.value)}
                  onFocus={() => handleFieldFocus('password')}
                  onBlur={handleFieldBlur}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-300 py-1.5 pr-10 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none transition-colors duration-200 font-light"
                  required
                />
                <button
                  id="toggle-signup-password-visibility-btn"
                  type="button"
                  onClick={() => setShowSignupPassword(prev => !prev)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer rounded-md"
                  aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                  title={showSignupPassword ? 'Hide password' : 'Show password'}
                >
                  {showSignupPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password field with eye toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="signup-confirm-password"
                  className="block text-[11px] tracking-[0.16em] uppercase font-light text-zinc-400"
                >
                  Confirm Password
                </label>
              </div>
              <div className="relative flex items-center">
                <input
                  id="signup-confirm-password"
                  type={showSignupConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={signupConfirmPassword}
                  onChange={e =>
                    handleFieldChange('confirmPassword', setSignupConfirmPassword, e.target.value)
                  }
                  onFocus={() => handleFieldFocus('confirmPassword')}
                  onBlur={handleFieldBlur}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-300 py-1.5 pr-10 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none transition-colors duration-200 font-light"
                  required
                />
                <button
                  id="toggle-signup-confirm-password-visibility-btn"
                  type="button"
                  onClick={() => setShowSignupConfirmPassword(prev => !prev)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer rounded-md"
                  aria-label={showSignupConfirmPassword ? 'Hide password' : 'Show password'}
                  title={showSignupConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showSignupConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Agreement Click Box with links to Privacy Policy, Terms, Cookie Uses, Community Guidelines */}
            <div className="pt-2">
              <label
                htmlFor="signup-agreement-checkbox"
                className="flex items-start gap-2.5 cursor-pointer select-none group"
              >
                <input
                  id="signup-agreement-checkbox"
                  type="checkbox"
                  checked={agreedToLegal}
                  onChange={e => {
                    setAgreedToLegal(e.target.checked);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="mt-0.5 w-4 h-4 rounded-xs border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer accent-indigo-500 shrink-0"
                />
                <span className="text-[11px] leading-relaxed text-zinc-400 font-light">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenLegalDoc('terms');
                    }}
                    className="text-zinc-200 hover:text-white underline underline-offset-2 transition-colors cursor-pointer font-normal"
                  >
                    Terms of Services
                  </button>
                  ,{' '}
                  <button
                    type="button"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenLegalDoc('community');
                    }}
                    className="text-zinc-200 hover:text-white underline underline-offset-2 transition-colors cursor-pointer font-normal"
                  >
                    Community Guidelines
                  </button>
                  ,{' '}
                  <button
                    type="button"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenLegalDoc('privacy');
                    }}
                    className="text-zinc-200 hover:text-white underline underline-offset-2 transition-colors cursor-pointer font-normal"
                  >
                    Privacy Policy
                  </button>
                  , and{' '}
                  <button
                    type="button"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenLegalDoc('cookies');
                    }}
                    className="text-zinc-200 hover:text-white underline underline-offset-2 transition-colors cursor-pointer font-normal"
                  >
                    Cookie Uses
                  </button>
                  .
                </span>
              </label>
            </div>

            {/* hCaptcha for Signup */}
            <div className="flex justify-center pt-2 overflow-hidden">
              <HCaptcha
                id="signup-hcaptcha"
                ref={signupCaptchaRef}
                sitekey={hcaptchaSiteKey}
                theme="dark"
                size="normal"
                onVerify={(token) => {
                  setSignupCaptchaToken(token);
                  setErrorMessage(null);
                }}
                onExpire={() => setSignupCaptchaToken(null)}
                onError={() => {
                  setSignupCaptchaToken(null);
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 py-3 text-xs tracking-[0.24em] uppercase font-normal text-black bg-zinc-100 hover:bg-white active:bg-zinc-300 transition-colors duration-200 disabled:opacity-40 cursor-pointer focus:outline-none rounded-lg"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
};
