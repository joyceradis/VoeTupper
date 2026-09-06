const CACHE_NAME = 'voetupper-v2-shell-v1';
const SHELL_ASSETS = ['/', '/manifest.webmanifest', '/logo-192.png', '/logo-512.png'];

async function discoverStaticAssets() {
  try {
    const response = await fetch('/');
    if (!response.ok) return [];
    const html = await response.clone().text();
    const references = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(match => match[1]);
    return [...new Set(references.filter(path => path.startsWith('/_next/static/')))];
  } catch {
    return [];
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const staticAssets = await discoverStaticAssets();
    await cache.addAll([...SHELL_ASSETS, ...staticAssets]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        await cache.put('/', response.clone());
        return response;
      } catch {
        return caches.match('/');
      }
    })());
    return;
  }

  const isShellAsset = url.pathname.startsWith('/_next/static/')
    || SHELL_ASSETS.includes(url.pathname);
  if (!isShellAsset) return;
  event.respondWith((async () => {
    const cached = await caches.match(request);
    return cached || fetch(request);
  })());
});
