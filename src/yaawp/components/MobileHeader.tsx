// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React from 'react';
import { Heart, Moon, Sun, PenSquare, Download } from 'lucide-react';
import { useNavigate } from '@/yaawp/compat/router';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const MobileHeader: React.FC = () => {
  const navigate = useNavigate();
  const {
    setActiveTab,
    unreadNotifsCount,
    theme,
    toggleTheme,
    setIsCreateModalOpen
  } = useApp();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  return (
    <header
      id="mobile-header"
      className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"
    >
      <div
        id="mobile-logo-btn"
        onClick={() => {
          setActiveTab('feed');
          navigate('/app/home');
        }}
        className="flex items-center gap-1.5 cursor-pointer"
      >
        <span className="text-3xl font-normal tracking-tight text-slate-800 dark:text-slate-100 font-monte-carlo">
          Yaawp
        </span>
      </div>

      {/* Top Right: Dark mode, Notifications, Create button */}
      <div className="flex items-center gap-2">
        {/* PWA Install CTA if installable */}
        {!isInstalled && (isInstallable || isIOS) && (
          <button
            id="mobile-pwa-install-btn"
            onClick={install}
            className="text-emerald-600 dark:text-emerald-400 p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
            aria-label="Install App"
            title="Install Yaawp as PWA"
          >
            <Download className="w-5 h-5 animate-pulse" />
          </button>
        )}

        {/* 1. Dark Mode Toggle */}
        <button
          id="mobile-theme-btn"
          onClick={toggleTheme}
          className="text-slate-600 dark:text-slate-300 p-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-slate-700" />
          ) : (
            <Sun className="w-5 h-5 text-amber-400" />
          )}
        </button>

        {/* 2. Notifications */}
        <button
          id="mobile-notif-btn"
          onClick={() => {
            setActiveTab('notifications');
            navigate('/app/notifications');
          }}
          className={`relative p-1.5 rounded-lg transition-colors cursor-pointer ${
            unreadNotifsCount > 0
              ? 'text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300'
              : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label={
            unreadNotifsCount > 0
              ? `Notifications (${unreadNotifsCount} unread update${unreadNotifsCount > 1 ? 's' : ''})`
              : 'Notifications'
          }
          title={
            unreadNotifsCount > 0
              ? `${unreadNotifsCount} new notification${unreadNotifsCount > 1 ? 's' : ''}`
              : 'Notifications'
          }
        >
          <div className="relative flex items-center justify-center">
            <Heart
              className={`w-5 h-5 stroke-[1.9px] transition-all duration-300 ${
                unreadNotifsCount > 0
                  ? 'animate-notification-pulse fill-rose-500/20 text-rose-500 dark:text-rose-400'
                  : ''
              }`}
            />
            {unreadNotifsCount > 0 && (
              <span
                id="mobile-notif-pulse-indicator"
                className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center pointer-events-none"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 dark:bg-rose-500 opacity-75 duration-1000" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 ring-2 ring-white dark:ring-slate-900 shadow-xs animate-badge-pulse" />
              </span>
            )}
          </div>
        </button>

        {/* 3. Create Button with Pencil Composer Icon */}
        <button
          id="mobile-create-post-btn"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center p-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          aria-label="Create Post"
        >
          <PenSquare className="w-5 h-5 stroke-[1.8px]" />
        </button>
      </div>
    </header>
  );
};
