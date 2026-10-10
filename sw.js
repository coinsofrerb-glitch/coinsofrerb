const CACHE_NAME = 'sales-system-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// نمرّر كل الطلبات مباشرة (بدون تخزين مؤقت) — النظام يحتاج اتصال إنترنت دايماً للعمل صح
// صفحة البرنامج نفسها تُطلب دايماً من السيرفر (no-cache) عشان أي تحديث يظهر فوراً بدون Ctrl+F5
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isPage = req.mode === 'navigate' || (url.origin === self.location.origin && /\.(html|js)$|\/$/.test(url.pathname));
  event.respondWith(isPage ? fetch(req, { cache: 'no-cache' }) : fetch(req));
});
