const CACHE_NAME = 'my-site-cache-v2';
const OFFLINE_URL = 'offline.html';

const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/style.css', // أضف باقي الملفات التي تريد تخزينها
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching offline page');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker ...', event);
  // يمكنك هنا تنفيذ عملية تنظيف للكاشات القديمة إن وجدت
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // نحاول تنفيذ الطلب أولاً
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // في حالة نجاح الاتصال، نقوم بتحديث الكاش لاحقاً (اختياري)
        return response;
      })
      .catch(error => {
        console.log('[Service Worker] Fetch failed; returning offline page instead.', error);
        return caches.match(event.request)
          .then(cachedResponse => {
            // إذا كان الطلب في الكاش قم بإرجاعه
            if (cachedResponse) return cachedResponse;

            // إذا كان الطلب للتصفح (navigate)
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});