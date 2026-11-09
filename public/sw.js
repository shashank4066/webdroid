/* WebDroid Service Worker
 *
 * Strategies:
 *  - App Shell: Precaches lightweight core assets (HTML shell, manifest, icons).
 *  - /v86/* (WebAssembly, BIOS, and demo ISO): On-demand runtime caching.
 *    Only cached when Terminal is launched or downloaded, saving ~8 MB on initial visit.
 *  - Navigations: Network-first with offline cache fallback (validating response.ok).
 *  - Static assets: Stale-while-revalidate with clean cache eviction.
 */

const CACHE_SHELL = 'webdroid-shell-v4';
const CACHE_RUNTIME = 'webdroid-runtime-v4';

const PRECACHE_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/logo.svg',
  '/icons/favicon-32.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_SHELL);
      await Promise.allSettled(
        PRECACHE_SHELL.map((url) => cache.add(new Request(url, { cache: 'reload' })))
      );
      // Do not force skipWaiting() automatically: allows user to see update prompt
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const validCaches = new Set([CACHE_SHELL, CACHE_RUNTIME]);
      await Promise.all(
        keys.filter((key) => !validCaches.has(key)).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept Next.js development internals or HMR
  if (url.pathname.startsWith('/_next/webpack-hmr') || url.pathname.includes('__nextjs')) {
    return;
  }

  // 1. /v86/* (Large WebAssembly engine & Linux disk images): On-demand runtime cache
  if (url.pathname.startsWith('/v86/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_RUNTIME);
        const cached = await cache.match(request, { ignoreSearch: true });
        if (cached) return cached;

        try {
          const response = await fetch(request);
          if (response && response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (err) {
          if (cached) return cached;
          throw err;
        }
      })()
    );
    return;
  }

  // 2. Navigation requests: Network-first, fall back to cached shell
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          // Only update cached shell when response is completely successful (prevent caching 404/500)
          if (response && response.ok) {
            const cache = await caches.open(CACHE_SHELL);
            cache.put('/', response.clone());
          }
          return response;
        } catch {
          const cache = await caches.open(CACHE_SHELL);
          const cached = (await cache.match(request)) || (await cache.match('/'));
          if (cached) return cached;
          return new Response('Offline and shell is not cached yet.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        }
      })()
    );
    return;
  }

  // 3. Static assets & bundles: Stale-while-revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_SHELL);
      const cached = await cache.match(request);

      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })()
  );
});
