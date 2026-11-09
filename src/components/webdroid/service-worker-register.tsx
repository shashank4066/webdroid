'use client';

import { useEffect } from 'react';
import { useOS } from './os/store';

/**
 * Registers the offline service worker only in production.
 * Alerts user via toast when an update is available.
 */
export function ServiceWorkerRegister() {
  const showToast = useOS((s) => s.showToast);

  useEffect(() => {
    // Only register service worker in production builds to prevent stale HMR caching
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showToast('Update ready. Refresh to apply.');
              }
            });
          });
        })
        .catch(() => {
          /* Offline service worker registration is best-effort */
        });
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
    return () => window.removeEventListener('load', register);
  }, [showToast]);

  return null;
}
