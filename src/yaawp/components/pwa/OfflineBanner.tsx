import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      id="pwa-offline-status-banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900/95 border border-amber-500/40 text-amber-200 shadow-2xl backdrop-blur-md animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
        <WifiOff className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-100">You're Offline</p>
        <p className="text-[11px] text-zinc-400 truncate">Browsing cached Yaawp moments & state.</p>
      </div>
    </div>
  );
};
