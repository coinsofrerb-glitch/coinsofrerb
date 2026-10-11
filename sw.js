// Coin Soft ERP — Service Worker
// • صفحة البرنامج وملفاته: من السيرفر دايماً (عشان التحديثات تظهر فوراً)، ولو ما في نت → من النسخة المحفوظة
// • المكتبات الخارجية (الأيقونات، Excel، …): تتحفظ أول مرة وتشتغل بدون نت
// • طلبات قاعدة البيانات (Supabase): ما بتتحفظ أبداً
const CACHE = 'coinsoft-v3';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co') || url.hostname.endsWith('supabase.in')) return; // قاعدة البيانات: مباشرة
  if (url.origin === self.location.origin) {
    // البرنامج نفسه: الشبكة أولاً، والنسخة المحفوظة لو ما في نت
    event.respondWith((async () => {
      try {
        const res = await fetch(req, { cache: 'no-cache' });
        if (res && res.ok) { const c = await caches.open(CACHE); c.put(req, res.clone()); }
        return res;
      } catch (e) {
        const hit = await caches.match(req, { ignoreSearch: true });
        if (hit) return hit;
        if (req.mode === 'navigate') { const idx = await caches.match('./', { ignoreSearch: true }) || await caches.match('index.html', { ignoreSearch: true }); if (idx) return idx; }
        throw e;
      }
    })());
    return;
  }
  // مكتبات خارجية: المحفوظ أولاً + تحديث بالخلفية
  event.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req);
    const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || Response.error();
  })());
});
