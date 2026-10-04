const CACHE_NAME = 'sales-system-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// نمرّر كل الطلبات مباشرة (بدون تخزين مؤقت للبيانات) — النظام يحتاج اتصال إنترنت دايماً للعمل صح
// هذا الملف موجود بس عشان متصفح أندرويد يعتبر الموقع "قابل للتثبيت"
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
