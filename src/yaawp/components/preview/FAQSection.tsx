import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight, MessageCircle, ShieldCheck, UserCheck, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Privacy' | 'Features';
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-what-is-yaawp',
    question: 'What is Yaawp?',
    answer:
      'Yaawp is a modern social platform built for authentic visual storytelling and genuine community connection. Enjoy distraction-free photo sharing, high-definition reels, daily stories, and real-time messaging without intrusive algorithmic bloat.',
    category: 'General'
  },
  {
    id: 'faq-how-to-start',
    question: 'How do I create an account or log in?',
    answer:
      'Click the "Login / Signup" button on this page. You can register an account in seconds with your name, handle, and password, or sign into an existing profile to immediately access your feed and messages.',
    category: 'General'
  },
  {
    id: 'faq-is-free',
    question: 'Is Yaawp free to use?',
    answer:
      'Yes, Yaawp is 100% free to join and explore. You can post photos, share stories, watch reels, join community groups, and chat with friends at no cost.',
    category: 'General'
  },
  {
    id: 'faq-privacy-security',
    question: 'How do privacy and chat passcode security work?',
    answer:
      'You have complete sovereignty over your profile and conversations. Yaawp offers secret chats protected by individual passcodes, private account toggles, and customized story viewing circles.',
    category: 'Privacy'
  },
  {
    id: 'faq-safety-blocking',
    question: 'How do I block users or report inappropriate content?',
    answer:
      'Safety is built in. Tap the three-dots (•••) menu on any post, comment, or chat to submit a report to our safety review team, or tap "Block User" on any creator\'s profile to immediately restrict them from interacting with you.',
    category: 'Privacy'
  },
  {
    id: 'faq-communities',
    question: 'What are Communities on Yaawp?',
    answer:
      'Communities are dedicated spaces centered on creative niches such as Photography, UI/UX Design, Cyberpunk Aesthetics, and Streetwear. Join existing public or private collectives, or launch your own community to cultivate shared passions.',
    category: 'Features'
  },
  {
    id: 'faq-content-controls',
    question: 'Can I customize who reacts to my posts?',
    answer:
      'Yes! With creator emoji reaction settings, you can curate custom quick reactions, restrict specific emojis, or highlight your favorite feedback for any post you share.',
    category: 'Features'
  }
];

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);
  const [activeCategory, setActiveCategory] = useState<'All' | 'General' | 'Privacy' | 'Features'>('All');

  const filteredFaqs = activeCategory === 'All'
    ? FAQS
    : FAQS.filter(f => f.category === activeCategory);

  const toggleItem = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <section
      id="landing-faq-section"
      className="w-full max-w-4xl mx-auto py-16 sm:py-24 px-4 relative z-10"
      aria-label="Frequently Asked Questions"
    >
      {/* Section Header */}
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs font-medium tracking-wider uppercase">
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span>Questions &amp; Answers</span>
        </div>
        <h2
          id="faq-heading"
          className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-zinc-100"
        >
          Frequently Asked Questions
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
          Everything you need to know about the Yaawp experience, your privacy, and community features.
        </p>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
          {(['All', 'General', 'Privacy', 'Features'] as const).map(cat => (
            <button
              key={cat}
              id={`faq-filter-${cat.toLowerCase()}`}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-zinc-200 text-zinc-950 font-semibold shadow-xs'
                  : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map(item => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              id={`faq-item-${item.id}`}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-zinc-900/90 border-zinc-700 shadow-md'
                  : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700/80 hover:bg-zinc-900/60'
              }`}
            >
              <button
                type="button"
                id={`faq-toggle-${item.id}`}
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                className="w-full py-4.5 px-5 sm:px-6 flex items-center justify-between gap-4 text-left cursor-pointer transition-colors"
              >
                <span className="text-sm sm:text-base font-normal text-zinc-200 tracking-wide">
                  {item.question}
                </span>
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                    isOpen
                      ? 'bg-zinc-800 border-zinc-600 text-white rotate-180'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <ChevronDown className="w-4 h-4 stroke-[1.75]" />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-content-${item.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed font-light border-t border-zinc-800/50">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Quick Action Footer inside FAQ */}
      <div className="mt-10 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center space-y-3">
        <p className="text-xs sm:text-sm text-zinc-300 font-light">
          Ready to experience genuine social connection?
        </p>
        <Link
          to="/auth/login"
          id="faq-cta-login-btn"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold tracking-wider uppercase transition-all shadow-sm"
        >
          <span>Get Started on Yaawp</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};
