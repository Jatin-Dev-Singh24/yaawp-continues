import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  Cookie,
  Users,
  Search,
  CheckCircle2,
  Printer,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Download,
  Share2,
  Check,
  Scale,
  Calendar,
  Clock,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ALL_LEGAL_DOCUMENTS } from '../../data/metaLegalDocuments';
import { LegalDocType } from '../../types';

interface LegalViewProps {
  isStandalone?: boolean;
}

export const LegalView: React.FC<LegalViewProps> = ({ isStandalone = false }) => {
  const {
    activeLegalDoc,
    setActiveLegalDoc,
    showToast,
    systemTheme,
    theme
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();

  // If URL search param is present (e.g. ?doc=privacy), prioritize and sync it
  const urlDoc = searchParams.get('doc') as LegalDocType | null;
  const currentDocKey = (urlDoc && ALL_LEGAL_DOCUMENTS[urlDoc]) ? urlDoc : (activeLegalDoc || 'terms');
  const currentDoc = ALL_LEGAL_DOCUMENTS[currentDocKey] || ALL_LEGAL_DOCUMENTS.terms;

  useEffect(() => {
    if (urlDoc && ALL_LEGAL_DOCUMENTS[urlDoc] && activeLegalDoc !== urlDoc) {
      setActiveLegalDoc(urlDoc);
    }
  }, [urlDoc, activeLegalDoc, setActiveLegalDoc]);

  const handleSelectDoc = (doc: LegalDocType) => {
    setActiveLegalDoc(doc);
    setSearchParams({ doc });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

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

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    showToast('Document link copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportText = () => {
    const textContent = `${currentDoc.title}\n${currentDoc.metaSubtitle}\nLast Updated: ${currentDoc.lastUpdated}\nEffective Date: ${currentDoc.effectiveDate}\n\n${currentDoc.introduction.join('\n\n')}\n\n` +
      currentDoc.sections.map(s => `${s.title}\n${s.content.join('\n')}${s.subsections ? '\n' + s.subsections.map(sub => `  ${sub.title}\n  ${sub.content.join('\n  ')}`).join('\n') : ''}`).join('\n\n');
    
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentDoc.id}_yaawp_official.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Legal document downloaded');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col legal-page-container">
      {/* ========================================================================= */}
      {/* WRINKLE TEXTURED WEBPAGE OVERLAY (Dynamically follows App Theme)           */}
      {/* Authentic parchment crease maps, tactile folds, and light refraction       */}
      {/* ========================================================================= */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-60 dark:opacity-50 transition-opacity duration-300"
        aria-hidden="true"
      >
        {/* SVG Filter Definition for Realistic Paper Wrinkling */}
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <filter id="paper-wrinkle-filter" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.025 0.04"
              numOctaves="4"
              result="noise"
            />
            <feDiffuseLighting
              in="noise"
              lightingColor="currentColor"
              surfaceScale="2.5"
              result="light"
            >
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feBlend mode="multiply" in="SourceGraphic" in2="light" />
          </filter>
        </svg>

        {/* Dynamic Wrinkle Creases SVG Vector Layer */}
        <svg
          className="absolute inset-0 w-full h-full object-cover text-slate-800 dark:text-white"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 1600"
        >
          <defs>
            {/* Primary Crease Gradients */}
            <linearGradient id="creaseGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.09" />
              <stop offset="45%" stopColor="currentColor" stopOpacity="0.22" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.32" />
              <stop offset="55%" stopColor="currentColor" stopOpacity="0.03" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.12" />
            </linearGradient>

            <linearGradient id="creaseGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
              <stop offset="48%" stopColor="currentColor" stopOpacity="0.18" />
              <stop offset="52%" stopColor="currentColor" stopOpacity="0.28" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
            </linearGradient>

            {/* Specular Ridge Highlights */}
            <linearGradient id="ridgeHighlight" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Handled Page Diagonal Wrinkles */}
          <path
            d="M -50,120 Q 280,310 490,260 T 920,440 T 1250,380"
            fill="none"
            stroke="url(#creaseGrad1)"
            strokeWidth="3.5"
          />
          <path
            d="M -50,122 Q 280,312 490,262 T 920,442 T 1250,382"
            fill="none"
            stroke="url(#ridgeHighlight)"
            strokeWidth="1.5"
          />

          {/* Secondary Crumple Fold Vectors */}
          <path
            d="M 1250,180 Q 980,420 710,530 T 320,890 T -30,1050"
            fill="none"
            stroke="url(#creaseGrad2)"
            strokeWidth="4"
          />
          <path
            d="M 1250,178 Q 980,418 710,528 T 320,888 T -30,1048"
            fill="none"
            stroke="url(#ridgeHighlight)"
            strokeWidth="1.2"
          />

          {/* Vertical Tension Creases */}
          <path
            d="M 380,-50 Q 420,380 340,780 T 430,1320 T 390,1650"
            fill="none"
            stroke="url(#creaseGrad1)"
            strokeWidth="2.8"
          />
          <path
            d="M 820,-50 Q 770,410 860,820 T 780,1290 T 840,1650"
            fill="none"
            stroke="url(#creaseGrad2)"
            strokeWidth="3.2"
          />

          {/* Lateral Stress Crinkles */}
          <path
            d="M 110,640 Q 320,720 540,680 T 960,760 T 1180,710"
            fill="none"
            stroke="url(#creaseGrad1)"
            strokeWidth="2.5"
          />
          <path
            d="M -20,1180 Q 280,1260 590,1210 T 980,1340 T 1240,1270"
            fill="none"
            stroke="url(#creaseGrad2)"
            strokeWidth="3"
          />
          <path
            d="M -20,1182 Q 280,1262 590,1212 T 980,1342 T 1240,1272"
            fill="none"
            stroke="url(#ridgeHighlight)"
            strokeWidth="1.2"
          />

          {/* Subtle Fine Micro-Wrinkle Branches */}
          <path d="M 490,260 Q 560,340 610,390" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1.2" />
          <path d="M 710,530 Q 640,600 580,620" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1.2" />
          <path d="M 340,780 Q 260,810 210,870" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1.2" />
          <path d="M 860,820 Q 940,860 1020,910" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1.2" />
          <path d="M 590,1210 Q 520,1270 470,1340" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1.2" />
        </svg>

        {/* Paper Grain & Shading Gradients (Warm or Cool based on theme) */}
        <div
          className="absolute inset-0 bg-radial-[at_20%_25%] from-white/10 dark:from-white/5 via-transparent to-black/10 dark:to-black/30 mix-blend-overlay"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-amber-500/5 dark:from-indigo-500/5 via-transparent to-transparent"
        />
      </div>

      {/* ========================================================================= */}
      {/* PAGE HEADER BAR                                                           */}
      {/* ========================================================================= */}
      <header className="relative z-10 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isStandalone && (
              <Link
                to="/"
                id="legal-back-to-home-btn"
                className="flex items-center gap-1.5 px-3 py-2 mr-1 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all shadow-xs shrink-0"
                title="Back to Yaawp Home"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Yaawp Legal &amp; Governance Center
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border border-slate-200 dark:border-slate-700">
                  Certified 2026
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentDoc.title}
              </h1>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {/* Print Button */}
            <button
              id="legal-print-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
              title="Print legal document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Download Text */}
            <button
              onClick={handleExportText}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
              title="Download text file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
              title="Copy link"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Document Navigation Tabs */}
        <div className="max-w-6xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => handleSelectDoc('terms')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              currentDocKey === 'terms'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Terms of Use
          </button>
          <button
            onClick={() => handleSelectDoc('privacy')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              currentDocKey === 'privacy'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Privacy Policy
          </button>
          <button
            onClick={() => handleSelectDoc('cookies')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              currentDocKey === 'cookies'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            Cookies Policy
          </button>
          <button
            onClick={() => handleSelectDoc('community')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              currentDocKey === 'community'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Community Standards
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN DOCUMENT BODY & SIDEBAR                                              */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Table of Contents Column (Sticky on Desktop) */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${currentDoc.title}...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Document Status & Timestamp Card */}
          <div className="p-4 rounded-2xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Effective:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{currentDoc.effectiveDate}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Last Revised:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{currentDoc.lastUpdated}</span>
            </div>
          </div>

          {/* Table of Contents Index */}
          <div className="p-4 rounded-2xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs space-y-2.5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sections Index ({filteredSections.length})
            </h3>
            <nav className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
              {filteredSections.map(section => {
                const isSelected = selectedSectionId === section.id;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={e => {
                      e.preventDefault();
                      setSelectedSectionId(section.id);
                      const el = document.getElementById(section.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`block px-3 py-2 rounded-xl text-xs transition-all ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 font-bold text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-600'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <div className="truncate">{section.title}</div>
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Main Legal Text Column */}
        <article className="lg:col-span-8 space-y-8">
          {/* Wrinkle Page Banner Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/90 dark:border-slate-800/90 backdrop-blur-xs shadow-lg space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              Official Terms of Agreement
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentDoc.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {currentDoc.metaSubtitle}
            </p>

            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
              {currentDoc.introduction.map((introParagraph, idx) => (
                <p
                  key={idx}
                  className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal"
                >
                  {introParagraph}
                </p>
              ))}
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-6">
            {filteredSections.map(section => (
              <section
                key={section.id}
                id={section.id}
                className="p-6 sm:p-8 rounded-3xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/90 dark:border-slate-800/90 backdrop-blur-xs shadow-md space-y-4 scroll-mt-24 transition-all hover:border-indigo-500/40"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {section.title}
                  </h3>
                  <a
                    href={`#${section.id}`}
                    onClick={e => {
                      e.preventDefault();
                      navigator.clipboard.writeText(`${window.location.origin}/app/legal#${section.id}`);
                      showToast(`Copied section link`);
                    }}
                    className="text-slate-400 hover:text-indigo-500 text-xs p-1"
                    title="Copy direct section link"
                  >
                    #
                  </a>
                </div>

                <div className="space-y-3">
                  {section.content.map((paragraph, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Subsections if present */}
                {section.subsections && section.subsections.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                    {section.subsections.map(sub => (
                      <div
                        key={sub.id}
                        id={sub.id}
                        className="pl-4 border-l-2 border-indigo-500/40 space-y-2"
                      >
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
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

            {filteredSections.length === 0 && (
              <div className="p-12 text-center rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">No sections matched your search</h4>
                <p className="text-xs text-slate-500 mt-1">Try a different keyword or clear your query.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* Bottom Legal Document Footer */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                <Shield className="w-4 h-4 text-indigo-500" />
                Yaawp Global Legal Commitment
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Official documentation for Yaawp platform governance, user privacy, and safety standards.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Print Copy
              </button>
              <button
                onClick={handleExportText}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Text
              </button>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default LegalView;
