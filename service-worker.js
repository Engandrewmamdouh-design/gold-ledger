// Service Worker — يخزن نسخة من البرنامج على الجهاز عشان يفتح حتى من غير نت
const CACHE_NAME = 'gold-ledger-cache-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// أول مرة يتثبت فيها الـService Worker، يخزن كل ملفات البرنامج الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// يمسح أي نسخة قديمة من الكاش لما يبقى فيه نسخة جديدة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// أي طلب للصفحة: يجرب ينزل نسخة جديدة من النت، ولو مفيش نت يرجع للنسخة المخزنة
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
