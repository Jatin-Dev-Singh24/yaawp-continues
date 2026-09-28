import React from 'react';
import { Shield, FileText, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TermsConsentBanner: React.FC = () => {
  const {
    hasAgreedToTerms,
    agreeToTermsAndContinue,
    openLegalModal,
    setIsCreateAccountModalOpen
  } = useApp();

  if (hasAgreedToTerms) return null;

  return (
    <div
      id="yaawp-terms-consent-banner"
      className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 p-4 rounded-xl bg-slate-900/95 dark:bg-slate-900/95 text-white shadow-2xl border border-slate-700/80 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-xs">
          <Shield className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Yaawp Legal Agreement
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-100 leading-snug">
            Welcome to Yaawp! Please agree to our Terms of Use and Privacy Policy to continue.
          </p>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            By continuing, you agree to the{' '}
            <button
              onClick={() => openLegalModal('terms')}
              className="text-indigo-400 hover:text-indigo-300 underline font-semibold"
            >
              Yaawp Terms of Service
            </button>{' '}
            and acknowledge the{' '}
            <button
              onClick={() => openLegalModal('privacy')}
              className="text-indigo-400 hover:text-indigo-300 underline font-semibold"
            >
              Yaawp Privacy Policy
            </button>
            .
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              id="banner-agree-btn"
              onClick={agreeToTermsAndContinue}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Agree &amp; Continue
            </button>

            <button
              id="banner-create-account-btn"
              onClick={() => setIsCreateAccountModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1"
            >
              Create Account
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
