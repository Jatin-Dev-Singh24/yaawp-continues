// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from '@/yaawp/compat/router';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/Sidebar';
import { MobileHeader } from '../../components/MobileHeader';
import { MobileNav } from '../../components/MobileNav';
import { StoryViewerModal } from '../../components/StoryViewerModal';
import { PostDetailModal } from '../../components/PostDetailModal';
import { CreatePostModal } from '../../components/CreatePostModal';
import { EditProfileModal } from '../../components/EditProfileModal';
import { CreateAccountModal } from '../../components/CreateAccountModal';
import { SetUsernameModal } from '../../components/auth/SetUsernameModal';
import { AmbientCursor } from '../../components/AmbientCursor';
import { SecurityModal } from '../../components/SecurityModal';
import { BehindTheScenesModal } from '../../components/BehindTheScenesModal';
import { GlobalSearchModal } from '../../components/GlobalSearchModal';
import { PermissionRequestModal } from '../../components/PermissionRequestModal';
import { FloatingSupportBotWidget } from '../../components/chat/FloatingSupportBotWidget';

const pathToTab: Record<string, string> = {
  '/app/home': 'feed',
  '/app/explore': 'explore',
  '/app/reels': 'reels',
  '/app/chats': 'messages',
  '/app/communities': 'communities',
  '/app/profile': 'profile',
  '/app/notifications': 'notifications',
  '/app/settings': 'settings',
  '/app/legal': 'legal',
};

const tabToPath: Record<string, string> = {
  feed: '/app/home',
  explore: '/app/explore',
  reels: '/app/reels',
  messages: '/app/chats',
  communities: '/app/communities',
  profile: '/app/profile',
  notifications: '/app/notifications',
  settings: '/app/settings',
  legal: '/app/legal',
};

export const AppLayout: React.FC = () => {
  const { activeTab, setActiveTab, isAuthenticated } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isInternalSync = useRef(false);

  // Strict route protection: unauthenticated users cannot access /app/* (only public /app/legal)
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/app/legal') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // When location changes, update activeTab
  useEffect(() => {
    const matchedTab = pathToTab[location.pathname];
    if (matchedTab && matchedTab !== activeTab) {
      isInternalSync.current = true;
      setActiveTab(matchedTab as any);
    }
  }, [location.pathname]);

  // When activeTab changes programmatically, sync to route
  useEffect(() => {
    if (isInternalSync.current) {
      isInternalSync.current = false;
      return;
    }
    const targetPath = tabToPath[activeTab];
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath);
    }
  }, [activeTab]);

  if (!isAuthenticated && location.pathname !== '/app/legal') {
    return (
      <div className="min-h-screen w-full bg-[#09090b] text-[#f4f4f5] flex items-center justify-center">
        <div className="text-center">
          <div className="font-monte-carlo text-6xl">YAAWP</div>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">Checking your session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col md:flex-row transition-colors selection:bg-indigo-500 selection:text-white relative">
      {/* Ambient Cursor Aura for Dark Premium Theme */}
      <AmbientCursor />

      {/* Desktop Sidebar Navigation */}
      <Sidebar />

      {/* Mobile Top Header */}
      <MobileHeader />

      {/* Main Routed Content Area */}
      <div className="flex-1 md:pl-18 xl:pl-[244px] pb-16 md:pb-0 min-h-screen overflow-x-hidden relative z-10">
        <Outlet />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Global Modals */}
      <StoryViewerModal />
      <PostDetailModal />
      <CreatePostModal />
      <EditProfileModal />
      <CreateAccountModal />
      <SetUsernameModal />
      <SecurityModal />
      <BehindTheScenesModal />
      <GlobalSearchModal />
      <PermissionRequestModal />

      {/* Yaawp@Support bot Floating Assistant Widget */}
      <FloatingSupportBotWidget />
    </div>
  );
};

export default AppLayout;
