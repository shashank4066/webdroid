/* WebDroid service worker — offline-first app shell + emulator engine cache.
 * Strategy:
 *  - /v86/*  (engine, wasm, bios, demo image): cache-first (immutable build artifacts)
 *  - navigations & everything else same-origin: network-first with cache fallback
 *  - /_next static: stale-while-revalidate
 */
const CACHE = 'webdroid-v2';

const PRECACHE = [
  '/',
  '/manifest.webmanifest',
  '/v86/libv86.js',
  '/v86/v86.wasm',
  '/v86/seabios.bin',
  '/v86/vgabios.bin',
  '/v86/images/demo-linux.iso',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/favicon-32.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Precache individually so one failure doesn't abort the whole install
      await Promise.allSettled(
        PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' })))
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never touch Next.js dev internals / HMR
  if (url.pathname.startsWith('/_next/webpack-hmr') || url.pathname.includes('__nextjs')) {
    return;
  }

  // Engine artifacts: cache-first (they are versioned by the CACHE name)
  if (url.pathname.startsWith('/v86/')) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE);
          cache.put(request, response.clone());
        }
        return response;
      })()
    );
    return;
  }

  // Navigations: network-first, fall back to cached "/"
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put('/', response.clone());
          return response;
        } catch (e) {
          const cached = (await caches.match(request)) || (await caches.match('/'));
          if (cached) return cached;
          return new Response('Offline and not cached yet.', { status: 503 });
        }
      })()
    );
    return;
  }

  // Everything else: stale-while-revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => undefined);
      return cached || (await network) || new Response('Offline', { status: 503 });
    })()
  );
});
