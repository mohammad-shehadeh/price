// service-worker.js

const CACHE_NAME = 'my-site-cache-v1';
const OFFLINE_URL = 'offline.html';

const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/style.css', // أضف ملفات أخرى حسب حاجتك
];

// عند التثبيت، خزّن الملفات
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// عند الطلب
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then(response => {
        if (response) return response;
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});