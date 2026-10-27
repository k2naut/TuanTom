const CACHE = 'cua-minh-v2';
const FILES = ['./', './index.html', './manifest.json', './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Mạng trước, lỗi mạng thì dùng bản đã lưu (để luôn nhận bản cập nhật mới)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  // Không lưu ảnh nền bản đồ (nặng); chỉ lưu file của app và thư viện Leaflet
  const cacheable = u.origin === location.origin || u.hostname === 'cdnjs.cloudflare.com';
  if (!cacheable) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
