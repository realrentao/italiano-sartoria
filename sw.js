const CACHE = 'ita-audio-v1';
const AUDIO_RE = /\/audio\/[^?]+\.mp3(\?.*)?$/;

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;
  if (!AUDIO_RE.test(url.pathname)) return;
  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (resp) {
          if (resp && resp.status === 200 && resp.type === 'basic') {
            cache.put(req, resp.clone());
          }
          return resp;
        });
      });
    })
  );
});
