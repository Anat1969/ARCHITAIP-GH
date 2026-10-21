// Pages come from the network so a new version is seen at once; images and
// built assets come from the cache, which is what makes a lecture survive a
// bad connection.
const CACHE = 'architaip-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put('/', copy));
        return res;
      }).catch(() => caches.match('/')),
    );
    return;
  }

  const cacheable = req.destination === 'image' || req.destination === 'font' ||
    url.pathname.startsWith('/assets/') || url.hostname.includes('fonts.g') ||
    url.pathname.includes('/storage/v1/object/public/');
  if (!cacheable || url.pathname.endsWith('.mp4')) return;

  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok || res.type === 'opaque') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    })),
  );
});
