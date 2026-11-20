'use strict';
// Build-release v20261111-hotfix3
const CACHE_NAME = 'calculator-shell-v20261111-hotfix3';
const SHELL_FILES = ["index.html","style.css","device.css","feedback.css","engine.js","complex.js","matrix.js","vector.js","verify.js","coefficient-editor.js","ratio.js","equation.js","inequality.js","statistics.js","distribution.js","base-n.js","table.js","keypad.js","ui.js","touch.js","keyboard.js","feedback.js","app.js","manifest.webmanifest","assets/device-face.svg","assets/device-face-blue.svg","assets/device-face-pink.svg","assets/menu-tiles.svg","assets/lcd-numerals.ttf","assets/lcd-text.ttf","assets/icon-180.png","assets/icon-192.png","assets/icon-512.png"];
const urls = SHELL_FILES.map(file => new URL(file, self.registration.scope).href);

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try { await cache.addAll(urls.map(url => new Request(url, { cache: 'reload' }))); }
    catch (error) { console.warn('Cache install warning:', error); }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name !== CACHE_NAME) {
        await caches.delete(name);
      }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;

  // Network-first with cache fallback
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.status === 200) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
      }
      return response;
    } catch (err) {
      const cache = await caches.open(CACHE_NAME);
      const relative = url.pathname.slice(scope.pathname.length) || 'index.html';
      const key = new URL(relative, scope).href;
      return (await cache.match(key)) || (await cache.match(request));
    }
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') { self.skipWaiting(); return; }
  if (event.data?.type !== 'CHECK_CACHE' || !event.ports[0]) return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const complete = (await Promise.all(urls.map(url => cache.match(url)))).every(Boolean);
    event.ports[0].postMessage({ ready: complete, version: CACHE_NAME });
  })());
});
