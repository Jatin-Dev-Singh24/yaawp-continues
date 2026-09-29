import React from 'react';
import { Home, Film, Send, Compass } from 'lucide-react';
import { useNavigate } from '@/yaawp/compat/router';
import { useApp } from '../context/AppContext';

export const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeTab,
    setActiveTab,
    currentUser,
    viewedUserId,
    openUserProfile,
    unreadMessagesCount,
    t
  } = useApp();

  const isProfileActive = activeTab === 'profile' && (!viewedUserId || viewedUserId === currentUser.id);

  return (
    <nav
      id="mobile-nav-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800"
    >
      {/* 1. Home */}
      <button
        id="mobile-nav-feed"
        onClick={() => {
          setActiveTab('feed');
          navigate('/app/home');
        }}
        className={`p-2 transition-colors ${
          activeTab === 'feed'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        aria-label={t('nav.home')}
      >
        <Home className={`w-5 h-5 ${activeTab === 'feed' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
      </button>

      {/* 2. Reels */}
      <button
        id="mobile-nav-reels"
        onClick={() => {
          setActiveTab('reels');
          navigate('/app/reels');
        }}
        className={`p-2 transition-colors ${
          activeTab === 'reels'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        aria-label={t('nav.reels')}
      >
        <Film className={`w-5 h-5 ${activeTab === 'reels' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
      </button>

      {/* 3. Messages */}
      <button
        id="mobile-nav-messages"
        onClick={() => {
          setActiveTab('messages');
          navigate('/app/chats');
        }}
        className={`p-2 transition-colors ${
          activeTab === 'messages'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        aria-label={`${t('nav.messages')}${unreadMessagesCount > 0 ? ` (${unreadMessagesCount} unread)` : ''}`}
      >
        <div className="relative inline-flex items-center justify-center">
          <Send className={`w-5 h-5 ${activeTab === 'messages' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          {unreadMessagesCount > 0 && (
            <span
              id="mobile-nav-messages-badge"
              className="absolute -top-1.5 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white leading-none shadow-sm ring-2 ring-white dark:ring-slate-900 transition-transform animate-in zoom-in-75"
            >
              {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
            </span>
          )}
        </div>
      </button>

      {/* 4. Explore */}
      <button
        id="mobile-nav-explore"
        onClick={() => {
          setActiveTab('explore');
          navigate('/app/explore');
        }}
        className={`p-2 transition-colors ${
          activeTab === 'explore'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        aria-label={t('nav.explore')}
      >
        <Compass className={`w-5 h-5 ${activeTab === 'explore' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
      </button>

      {/* 5. Profile */}
      <button
        id="mobile-nav-profile"
        onClick={() => {
          openUserProfile(currentUser.id);
          navigate('/app/profile');
        }}
        className="p-1.5 flex items-center justify-center"
        aria-label={t('nav.profile')}
      >
        <img
          src={currentUser.avatar}
          alt={currentUser.username}
          className={`w-6 h-6 rounded-full object-cover ring-2 transition-all ${
            isProfileActive
              ? 'ring-indigo-600 dark:ring-indigo-400 scale-105'
              : 'ring-transparent opacity-85 hover:opacity-100'
          }`}
        />
      </button>
    </nav>
  );
};
