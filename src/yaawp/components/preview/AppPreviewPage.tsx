// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React from 'react';
import { Link, useNavigate } from '@/yaawp/compat/router';
import { HelpCircle, ArrowDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FAQSection } from './FAQSection';
import { LegalDocType } from '../../types';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export const AppPreviewPage: React.FC = () => {
  const { setActiveLegalDoc } = useApp();
  const navigate = useNavigate();

  const navigateToLegalDoc = (doc: LegalDocType) => {
    setActiveLegalDoc(doc);
    navigate(`/legal?doc=${doc}`);
  };

  const scrollToFaqs = () => {
    const el = document.getElementById('landing-faq-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      id="yaawp-landing-page"
      className="min-h-screen w-full bg-[#09090b] text-[#f4f4f5] flex flex-col justify-between selection:bg-zinc-200 selection:text-black relative px-6 sm:px-12 md:px-20 py-8 sm:py-10 overflow-x-hidden"
    >
      {/* Top Header: Nav + FAQs anchor + Login / Signup */}
      <header
        id="landing-header"
        className="w-full flex items-center justify-between z-10"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="landing-header-faqs-btn"
            onClick={scrollToFaqs}
            className="flex items-center gap-1.5 text-xs tracking-wider uppercase text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQs</span>
          </button>
          <PWAInstallButton />
        </div>

        <nav
          id="landing-auth-nav"
          className="flex items-center gap-6 sm:gap-8 ml-auto"
          aria-label="Authentication"
        >
          <div className="flex items-center gap-3">
            <Link
              to="/auth/login"
              id="landing-login-btn"
              className="px-4 py-2 text-xs sm:text-[13px] tracking-[0.16em] uppercase font-light text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              Log In
            </Link>
            <Link
              to="/auth/signup"
              id="landing-signup-btn"
              className="px-5 py-2 rounded-full border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-xs sm:text-[13px] tracking-[0.18em] uppercase font-medium text-zinc-100 hover:text-white transition-all duration-300 cursor-pointer shadow-xs"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Centerpiece: Prominent YAAWP Wordmark & Catchy Tagline */}
      <main
        id="landing-main"
        className="flex-1 flex flex-col items-center justify-center my-auto min-h-[75vh] z-10 text-center select-none"
      >
        <h1
          id="yaawp-landing-wordmark"
          className="font-monte-carlo text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] xl:text-[13rem] leading-none text-zinc-100 font-normal tracking-wide transition-all duration-500 hover:scale-[1.01]"
        >
          YAAWP
        </h1>

        {/* Catchy tagline replacing the old tap to enter feed text */}
        <p
          id="landing-tagline"
          className="text-zinc-400 text-sm sm:text-base md:text-lg tracking-[0.14em] font-light mt-3 max-w-lg px-4"
        >
          Pure social expression. Real moments, genuine connections.
        </p>

        {/* Prominent Login / Signup Action Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5">
          <Link
            to="/auth/signup"
            id="landing-center-signup-btn"
            className="px-8 py-3 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-medium tracking-[0.16em] uppercase shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            Sign Up to Enter
          </Link>
          <Link
            to="/auth/login"
            id="landing-center-login-btn"
            className="px-6 py-3 rounded-full border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs sm:text-sm font-normal tracking-[0.16em] uppercase transition-all duration-200 cursor-pointer"
          >
            Log In
          </Link>
        </div>

        {/* Scroll indicator to FAQs */}
        <button
          type="button"
          id="landing-scroll-to-faqs-btn"
          onClick={scrollToFaqs}
          className="mt-14 inline-flex items-center gap-2 text-xs font-light tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors uppercase cursor-pointer"
        >
          <span>Frequently Asked Questions</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </button>
      </main>

      {/* FAQ Section on the first page */}
      <FAQSection />

      {/* Bottom Footer: Simple text buttons that open legal documents */}
      <footer
        id="landing-footer"
        className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-900/80 text-[12px] text-zinc-400/90 z-10"
      >
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2">
          <Link
            to="/legal?doc=privacy"
            id="footer-privacy-policy-btn"
            onClick={e => {
              e.preventDefault();
              navigateToLegalDoc('privacy');
            }}
            className="hover:text-white transition-colors cursor-pointer text-zinc-400 hover:underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <Link
            to="/legal?doc=terms"
            id="footer-terms-of-use-btn"
            onClick={e => {
              e.preventDefault();
              navigateToLegalDoc('terms');
            }}
            className="hover:text-white transition-colors cursor-pointer text-zinc-400 hover:underline underline-offset-4"
          >
            Terms of Use
          </Link>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <Link
            to="/legal?doc=cookies"
            id="footer-cookie-uses-btn"
            onClick={e => {
              e.preventDefault();
              navigateToLegalDoc('cookies');
            }}
            className="hover:text-white transition-colors cursor-pointer text-zinc-400 hover:underline underline-offset-4"
          >
            Cookie Uses
          </Link>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <Link
            to="/legal?doc=community"
            id="footer-community-guidelines-btn"
            onClick={e => {
              e.preventDefault();
              navigateToLegalDoc('community');
            }}
            className="hover:text-white transition-colors cursor-pointer text-zinc-400 hover:underline underline-offset-4"
          >
            Community Guidelines
          </Link>
        </div>

        <div className="text-[11px] tracking-[0.15em] text-zinc-600 font-light">
          © {new Date().getFullYear()} YAAWP
        </div>
      </footer>
    </div>
  );
};
