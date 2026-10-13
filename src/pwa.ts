import { registerSW } from 'virtual:pwa-register';

export function initPWA() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[PWA] New version detected, updating service worker...');
        updateSW(true);
      },
      onOfflineReady() {
        console.log('[PWA] RedAesthetic Pro is now cached and ready for offline use.');
      },
      onRegisterError(error) {
        console.warn('[PWA] Service worker registration error:', error);
      },
    });
  }
}
