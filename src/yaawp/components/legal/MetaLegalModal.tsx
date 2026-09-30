// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useMemo } from 'react';
import {
  X,
  Shield,
  FileText,
  Cookie,
  Users,
  Search,
  CheckCircle2,
  ExternalLink,
  Printer,
  ChevronRight,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ALL_LEGAL_DOCUMENTS } from '../../data/metaLegalDocuments';
import { LegalDocType } from '../../types';

export const MetaLegalModal: React.FC = () => {
  const {
    isLegalModalOpen,
    closeLegalModal,
    activeLegalDoc,
    openLegalModal,
    hasAgreedToTerms,
    agreeToTermsAndContinue,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const currentDoc = ALL_LEGAL_DOCUMENTS[activeLegalDoc] || ALL_LEGAL_DOCUMENTS.terms;

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return currentDoc.sections;
    const q = searchQuery.toLowerCase();
    return currentDoc.sections.filter(s => {
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchContent = s.content.some(c => c.toLowerCase().includes(q));
      const matchSub = s.subsections?.some(
        sub => sub.title.toLowerCase().includes(q) || sub.content.some(c => c.toLowerCase().includes(q))
      );
      return matchTitle || matchContent || matchSub;
    });
  }, [currentDoc, searchQuery]);

  if (!isLegalModalOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleAcceptThisDoc = () => {
    agreeToTermsAndContinue();
    showToast(`Accepted ${currentDoc.title}`);
    closeLegalModal();
  };

  return (
    <div
      id="yaawp-legal-modal-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 md:p-6"
      onClick={closeLegalModal}
    >
      <div
        id="yaawp-legal-modal-container"
        className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Yaawp Legal &amp; Privacy Center
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  Official 2026
                </span>
              </div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                {currentDoc.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              id="close-yaawp-legal-modal-btn"
              onClick={closeLegalModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close legal modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 overflow-x-auto text-xs">
          <button
            onClick={() => {
              openLegalModal('terms');
              setSearchQuery('');
              setSelectedSectionId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeLegalDoc === 'terms'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Terms of Use
          </button>

          <button
            onClick={() => {
              openLegalModal('privacy');
              setSearchQuery('');
              setSelectedSectionId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeLegalDoc === 'privacy'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Privacy Policy
          </button>

          <button
            onClick={() => {
              openLegalModal('cookies');
              setSearchQuery('');
              setSelectedSectionId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeLegalDoc === 'cookies'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            Cookies Policy
          </button>

          <button
            onClick={() => {
              openLegalModal('community');
              setSearchQuery('');
              setSelectedSectionId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeLegalDoc === 'community'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Community Guidelines
          </button>
        </div>

        {/* Search and Metadata Sub-bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search within ${currentDoc.title} (e.g., license, age 13, cookies)...`}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Effective: <strong>{currentDoc.effectiveDate}</strong></span>
            <span>•</span>
            <span>Platform: <strong>Yaawp</strong></span>
          </div>
        </div>

        {/* Content Body: Left Index (desktop) + Right Text Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Quick Index Sidebar (Desktop) */}
          <div className="hidden lg:block w-64 border-r border-slate-200 dark:border-slate-800 p-3 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block mb-2">
              Table of Contents
            </span>
            <nav className="space-y-1">
              {currentDoc.sections.map(section => (
                <a
                  key={section.id}
                  href={`#legal-section-${section.id}`}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`block px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors truncate ${
                    selectedSectionId === section.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {section.title}
                </a>
              ))}
            </nav>

            <div className="mt-6 p-3 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-300">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Legally Binding</span>
              </div>
              <p className="leading-snug">
                These terms govern your account and use of Yaawp. Agreement is required upon sign up.
              </p>
            </div>
          </div>

          {/* Legal Scroll Area */}
          <div className="flex-1 p-5 md:p-8 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
            {/* Meta Subtitle & Intro */}
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentDoc.metaSubtitle}
                </span>
              </div>
              {currentDoc.introduction.map((paragraph, idx) => (
                <p key={idx} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* If search query has no results */}
            {filteredSections.length === 0 && (
              <div className="text-center py-12 space-y-2">
                <Search className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No matches found for "{searchQuery}"
                </p>
                <p className="text-xs text-slate-500">
                  Try searching for keywords like "age", "liability", "license", or "cookies".
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Reset search
                </button>
              </div>
            )}

            {/* Sections */}
            {filteredSections.map(section => (
              <section
                key={section.id}
                id={`legal-section-${section.id}`}
                className="space-y-3 pt-2 border-b border-slate-100 dark:border-slate-800/60 pb-5"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  {section.title}
                </h3>

                <div className="space-y-2">
                  {section.content.map((p, idx) => (
                    <p
                      key={idx}
                      className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                    >
                      {p}
                    </p>
                  ))}
                </div>

                {/* Subsections if any */}
                {section.subsections && (
                  <div className="space-y-4 pl-3 sm:pl-4 border-l-2 border-indigo-200 dark:border-indigo-900/60 mt-3">
                    {section.subsections.map(sub => (
                      <div key={sub.id} className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {sub.title}
                        </h4>
                        {sub.content.map((subP, subIdx) => (
                          <p
                            key={subIdx}
                            className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed"
                          >
                            {subP}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}

            {/* Footer Notice */}
            <div className="pt-4 text-center text-[11px] text-slate-400 dark:text-slate-500 space-y-1">
              <p>Yaawp • All Rights Reserved</p>
              <p>Governed by applicable legal and consumer standards.</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs">
            {hasAgreedToTerms ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Agreed and Accepted for Current Account
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                You must agree to these terms when creating an account.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!hasAgreedToTerms && (
              <button
                onClick={handleAcceptThisDoc}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
              >
                I Agree and Accept
              </button>
            )}
            <button
              onClick={closeLegalModal}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
