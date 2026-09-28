import React, { useState } from 'react';
import { Download, Share, PlusSquare, CheckCircle, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'minimal' | 'full' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'minimal',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed or running as standalone PWA, do not show install CTA
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // If not installable and not on iOS Safari, hide button
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      {variant === 'minimal' ? (
        <button
          type="button"
          id="pwa-install-app-btn"
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase border border-zinc-700 bg-zinc-900/90 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all shadow-xs cursor-pointer ${className}`}
          title="Install Yaawp as Progressive Web App"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>{isIOS ? 'Install PWA' : isInstalling ? 'Installing...' : 'Install App'}</span>
        </button>
      ) : (
        <button
          type="button"
          id="pwa-install-app-full-btn"
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide border border-indigo-500/30 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 hover:text-white transition-all shadow-sm cursor-pointer ${className}`}
        >
          <Smartphone className="w-4 h-4 text-indigo-400" />
          <span>{isIOS ? 'Install on iPhone / iPad' : 'Install Yaawp App'}</span>
        </button>
      )}

      {/* iOS Safari Guided Install Modal */}
      {showIOSGuide && (
        <div
          id="ios-pwa-install-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Install Yaawp on iOS</h3>
              </div>
              <button
                type="button"
                id="ios-pwa-modal-close-btn"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              To install Yaawp as a standalone app with offline support on your iPhone or iPad:
            </p>

            <ol className="space-y-3 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span className="flex-1">
                  Tap the <Share className="w-3.5 h-3.5 inline mx-1 text-indigo-400" /> <strong>Share</strong> button in the Safari bottom toolbar.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span className="flex-1">
                  Scroll down and select <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" /> <strong>Add to Home Screen</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span className="flex-1">
                  Tap <strong>Add</strong> in the top-right corner to launch Yaawp right from your home screen.
                </span>
              </li>
            </ol>

            <button
              type="button"
              id="ios-pwa-modal-gotit-btn"
              onClick={() => setShowIOSGuide(false)}
              className="w-full mt-2 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
