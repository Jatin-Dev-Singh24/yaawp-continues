// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React from 'react';
import {
  Home,
  Compass,
  Film,
  Send,
  Heart,
  PenSquare,
  Sun,
  Moon,
  Feather,
  Shield,
  UserPlus,
  Settings,
  Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from '@/yaawp/compat/router';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SidebarNavItem {
  id: string;
  label: string;
  icon?: any;
  path?: string;
  onClick?: () => void;
  badge?: number;
  isProfile?: boolean;
  shortcut?: string;
}

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    currentUser,
    unreadNotifsCount,
    unreadMessagesCount,
    setIsCreateModalOpen,
    openUserProfile,
    openLegalModal,
    setIsCreateAccountModalOpen,
    t
  } = useApp();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Navigation order: Home -> Reels -> Messages -> Explore -> Notifications -> Create -> Profile
  const navItems: SidebarNavItem[] = [
    { id: 'feed', label: t('nav.home'), icon: Home, path: '/app/home' },
    { id: 'reels', label: t('nav.reels'), icon: Film, path: '/app/reels' },
    {
      id: 'messages',
      label: t('nav.messages'),
      icon: Send,
      path: '/app/chats',
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined
    },
    { id: 'explore', label: t('nav.explore'), icon: Compass, path: '/app/explore' },
    {
      id: 'notifications',
      label: t('nav.notifications'),
      icon: Heart,
      path: '/app/notifications',
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined
    },
    {
      id: 'create',
      label: t('nav.create'),
      icon: PenSquare,
      onClick: () => setIsCreateModalOpen(true)
    },
    { id: 'profile', label: t('nav.profile'), isProfile: true, path: '/app/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/app/settings' }
  ];

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col justify-between fixed top-0 left-0 h-screen w-18 xl:w-[244px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 xl:p-5 z-40 transition-colors shrink-0"
    >
      {/* Top Branding & Nav */}
      <div className="flex flex-col space-y-6">
        {/* Brand Logo */}
        <div
          id="sidebar-logo"
          onClick={() => {
            setActiveTab('feed');
            navigate('/app/home');
          }}
          className="cursor-pointer px-2 xl:px-3 py-2 flex items-center gap-3 transition-opacity hover:opacity-85"
        >
          <div className="xl:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-indigo-500 text-white shadow-xs">
            <Feather className="w-5 h-5" />
          </div>
          <div className="hidden xl:flex items-center gap-2">
            <span className="text-3xl font-normal tracking-tight text-slate-800 dark:text-slate-100 font-monte-carlo">
              Yaawp
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col space-y-1" aria-label="Main Navigation">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else if (item.id === 'profile') {
                    openUserProfile(currentUser.id);
                    navigate('/app/profile');
                  } else {
                    setActiveTab(item.id as any);
                    if (item.path) navigate(item.path);
                  }
                }}
                className={`relative flex items-center justify-center xl:justify-start space-x-3.5 p-3 rounded-lg transition-colors group text-left ${
                  isActive
                    ? 'bg-slate-50 dark:bg-slate-800 font-semibold text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
                }`}
                title={item.label}
              >
                {item.isProfile ? (
                  <div className="relative shrink-0">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className={`w-6 h-6 rounded-md object-cover ring-2 ${
                        isActive ? 'ring-indigo-600 dark:ring-indigo-400' : 'ring-transparent'
                      }`}
                    />
                  </div>
                ) : Icon ? (
                  <div className="relative shrink-0 flex items-center justify-center">
                    <Icon
                      className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                        isActive ? 'stroke-[2.4px]' : 'stroke-[1.8px]'
                      } ${
                        item.id === 'notifications' && item.badge !== undefined
                          ? 'animate-notification-pulse text-rose-500 dark:text-rose-400 fill-rose-500/20'
                          : ''
                      }`}
                    />
                    {item.badge !== undefined && (
                      <span
                        id={`sidebar-badge-${item.id}`}
                        className={`absolute -top-2 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-bold text-white leading-none shadow-sm ring-2 ring-white dark:ring-slate-900 transition-transform animate-in zoom-in-75 ${
                          item.id === 'notifications'
                            ? 'bg-rose-500 animate-badge-pulse'
                            : 'bg-indigo-600'
                        }`}
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                ) : null}

                <span className="hidden xl:inline text-sm">{item.label}</span>
                {item.badge !== undefined ? (
                  <span className={`hidden xl:inline-flex ml-auto items-center justify-center h-5 min-w-5 px-1.5 rounded-full border text-[11px] font-bold ${
                    item.id === 'notifications'
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 animate-badge-pulse'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : item.shortcut ? (
                  <span className="hidden xl:inline-block ml-auto text-[10px] font-mono text-zinc-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800/90 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700/60">
                    {item.shortcut}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-800 mt-auto">
        {/* Add / Switch Account Action */}
        <button
          id="sidebar-create-account-btn"
          onClick={() => setIsCreateAccountModalOpen(true)}
          className="flex items-center justify-center xl:justify-start space-x-3.5 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
          title="Add Account or Switch"
        >
          <UserPlus className="w-5 h-5 shrink-0" />
          <span className="hidden xl:inline text-xs font-bold">Add Account</span>
        </button>

        {/* PWA Install Button (Chromium prompt or iOS helper) */}
        {!isInstalled && (isInstallable || isIOS) && (
          <button
            id="sidebar-pwa-install-btn"
            onClick={install}
            className="flex items-center justify-center xl:justify-start space-x-3.5 p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            title="Install Yaawp as Progressive Web App"
          >
            <Download className="w-5 h-5 shrink-0 animate-bounce" />
            <span className="hidden xl:inline text-xs font-bold">Install App</span>
          </button>
        )}

        {/* Yaawp Legal & Privacy Center */}
        <button
          id="sidebar-legal-center-btn"
          onClick={() => {
            openLegalModal('terms');
            navigate('/app/legal');
          }}
          className={`flex items-center justify-center xl:justify-start space-x-3.5 p-2 rounded-lg transition-colors ${
            activeTab === 'legal'
              ? 'bg-slate-50 dark:bg-slate-800 font-semibold text-indigo-600 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
          title="Yaawp Terms & Privacy Policy (Wrinkle Textured Page)"
        >
          <Shield className="w-5 h-5 shrink-0" />
          <span className="hidden xl:inline text-xs font-semibold">Terms &amp; Privacy</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="flex items-center justify-center xl:justify-start space-x-3.5 p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-slate-700 shrink-0" />
          ) : (
            <Sun className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span className="hidden xl:inline text-xs font-semibold">
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </span>
        </button>

        {/* User preview profile card */}
        <button
          id="sidebar-profile-switch"
          onClick={() => {
            openUserProfile(currentUser.id);
            navigate('/app/profile');
          }}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-indigo-500 p-[2px] shrink-0">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 p-[2px]">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
          <div className="hidden xl:flex flex-col overflow-hidden min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {currentUser.username}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              Active Profile
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
};
