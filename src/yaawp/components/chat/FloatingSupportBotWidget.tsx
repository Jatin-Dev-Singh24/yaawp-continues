// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Bot,
  Minimize2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  SUPPORT_BOT_USER,
  SUPPORT_BOT_WELCOME_MESSAGE,
  SUPPORT_BOT_SUGGESTED_PROMPTS,
  getAutomatedBotResponse
} from '../../utils/supportBot';
import { SupportBotActionButtons } from './SupportBotActionButtons';
import { FormattedText } from '../FormattedText';
import { useNavigate, useLocation } from '@/yaawp/compat/router';

interface LocalBotMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  suggestedActions?: any[];
  quickReplies?: string[];
}

export const FloatingSupportBotWidget: React.FC = () => {
  const { setActiveConvId, activeTab } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolledVisible, setIsScrolledVisible] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Route availability check:
  // Available on Feed/Home, Explore, Messages/Chats, and Profile
  const path = location.pathname;
  const isHomePage = path === '/' || path === '/app' || path.startsWith('/app/home') || activeTab === 'feed';
  const isExplorePage = path.startsWith('/app/explore') || activeTab === 'explore';
  const isMessagesPage = path.startsWith('/app/chats') || path.startsWith('/app/messages') || activeTab === 'messages';
  const isProfilePage = path.startsWith('/app/profile') || activeTab === 'profile';

  const isAllowedPage = isHomePage || isExplorePage || isMessagesPage || isProfilePage;

  const [messages, setMessages] = useState<LocalBotMessage[]>(() => {
    return [
      {
        id: 'msg_welcome_init',
        senderId: SUPPORT_BOT_USER.id,
        text: SUPPORT_BOT_WELCOME_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: SUPPORT_BOT_SUGGESTED_PROMPTS
      }
    ];
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Reset visibility when navigating to a new route
  useEffect(() => {
    setIsScrolledVisible(true);
    lastScrollY.current = window.pageYOffset || document.documentElement.scrollTop || 0;
  }, [location.pathname, activeTab]);

  // Scroll detection to disappear on scroll down and appear on scroll up
  useEffect(() => {
    let ticking = false;

    const handleScroll = (e: Event) => {
      // If the chat modal is currently open, do not auto-hide it while the user is actively chatting
      if (isOpen) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          let currentY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

          // If the event came from an internal scrollable container (e.g. feed list, explore column, message thread)
          const target = e.target as HTMLElement | Document;
          if (
            target &&
            target !== document &&
            target !== document.documentElement &&
            (target as HTMLElement).scrollTop !== undefined
          ) {
            const el = target as HTMLElement;
            // Ignore scrolling inside the bot chat window itself
            if (el.closest('#yaawp-support-bot-window')) {
              ticking = false;
              return;
            }
            currentY = el.scrollTop;
          }

          const delta = currentY - lastScrollY.current;

          // Scrolling DOWN -> disappear
          if (delta > 10 && currentY > 50) {
            setIsScrolledVisible(false);
          } else if (delta < -10 || currentY <= 30) {
            // Scrolling UP or back near top -> appear
            setIsScrolledVisible(true);
          }

          lastScrollY.current = Math.max(0, currentY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  if (!isAllowedPage) {
    return null;
  }

  const handleSendMessage = (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg: LocalBotMessage = {
      id: `msg_user_${Date.now()}`,
      senderId: 'current_user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = getAutomatedBotResponse(text);
      const botMsg: LocalBotMessage = {
        id: `msg_bot_${Date.now()}`,
        senderId: SUPPORT_BOT_USER.id,
        text: botResponse.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: botResponse.suggestedActions,
        quickReplies: botResponse.quickReplies
      };
      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  const handleOpenFullChat = () => {
    setActiveConvId('conv_support_bot');
    navigate('/app/chats');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end pointer-events-auto select-none">
      {/* Floating Trigger Button (Smoothly hides on scroll down, appears on scroll up) */}
      <AnimatePresence>
        {!isOpen && isScrolledVisible && (
          <motion.div
            key="bot-trigger"
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex items-center"
          >
            <button
              id="yaawp-support-bot-trigger"
              type="button"
              onClick={() => setIsOpen(true)}
              className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/25 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer border border-indigo-400/40"
              title="Open yaawp_support bot"
            >
              <div className="relative">
                <Bot className="w-4 h-4 text-white" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-indigo-600" />
              </div>
              <div className="text-left pr-1">
                <span className="text-xs font-bold tracking-tight block leading-tight">yaawp_support bot</span>
                <span className="text-[9px] text-indigo-200 font-medium block leading-none">Need help? Ask here</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="yaawp-support-bot-window"
            key="bot-chat-window"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="w-[340px] sm:w-[380px] h-[490px] max-h-[82vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={SUPPORT_BOT_USER.avatar}
                    alt={SUPPORT_BOT_USER.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-indigo-700" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold leading-none">{SUPPORT_BOT_USER.name}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/20 text-white">Bot</span>
                  </div>
                  <p className="text-[10px] text-indigo-100/80 mt-0.5">Automated Help &amp; Privacy Guide</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleOpenFullChat}
                  className="px-2 py-1 rounded-lg text-white/90 hover:text-white hover:bg-white/15 text-[10px] font-semibold transition-colors"
                  title="Open full conversation in Messages"
                >
                  Open in Chat
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/60 dark:bg-slate-950/50 text-xs">
              {messages.map(msg => {
                const isBot = msg.senderId === SUPPORT_BOT_USER.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        isBot
                          ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 shadow-xs'
                          : 'bg-indigo-600 text-white rounded-tr-xs'
                      }`}
                    >
                      <FormattedText text={msg.text} />

                      {/* Deep-link Action Chips */}
                      {isBot && (
                        <SupportBotActionButtons
                          actions={msg.suggestedActions}
                          quickReplies={msg.quickReplies}
                          onQuickReplyClick={reply => handleSendMessage(reply)}
                        />
                      )}

                      <span
                        className={`block text-[9px] mt-1.5 text-right ${
                          isBot ? 'text-slate-400' : 'text-indigo-200'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-2 px-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask about privacy, hidden chats, settings..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
