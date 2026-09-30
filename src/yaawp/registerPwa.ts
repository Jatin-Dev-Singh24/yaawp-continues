// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import { registerSW } from 'virtual:pwa-register';

export function registerPwaServiceWorker() {
  // Only register service worker in production build; in dev mode Vite serves modules directly
  if (import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          console.log('[PWA] New version available.');
        },
        onOfflineReady() {
          console.log('[PWA] Application ready to work offline.');
        },
        onRegisteredSW(swUrl, registration) {
          console.log('[PWA] Service worker registered:', swUrl, registration);
        },
        onRegisterError(error) {
          console.warn('[PWA] Service worker registration error:', error);
        },
      });

      return updateSW;
    } catch (e) {
      console.warn('[PWA] Error initializing registerSW:', e);
    }
  } else if (!import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    } catch {}
  }
  return () => {};
}
