/* Race the Clock — offline + auto-update service worker.
   Game page is cached once (27 MB), then opens instantly and works offline.
   On each launch it does a tiny HEAD request; if the host reports a new
   ETag/Last-Modified for index.html it silently downloads the new version
   (used the NEXT time the game opens). No manual version bump needed. */
const SHELL_CACHE = 'rtc-shell-v1';
const FONT_CACHE  = 'rtc-fonts-v1';
const META_CACHE  = 'rtc-meta-v1';
const SMALL = ['./manifest.webmanifest','./icon-192.png','./icon-512.png','./maskable-512.png','./apple-touch-icon.png'];
const SIG_KEY = './__sig';

const sigOf = r => (r.headers.get('etag') || '') + '|' + (r.headers.get('last-modified') || '');
async function saveSig(s){ const c = await caches.open(META_CACHE); await c.put(SIG_KEY, new Response(s)); }
async function loadSig(){ const c = await caches.open(META_CACHE); const r = await c.match(SIG_KEY); return r ? r.text() : ''; }

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL_CACHE);
    const res = await fetch('./index.html');
    if (!res.ok) throw new Error('index.html fetch failed');
    await c.put('./index.html', res);
    await c.addAll(SMALL);
    try { const h = await fetch('./index.html', { method: 'HEAD', cache: 'no-store' }); if (h.ok) await saveSig(sigOf(h)); } catch (_) {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keep = [SHELL_CACHE, FONT_CACHE, META_CACHE];
    for (const k of await caches.keys()) if (!keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

let lastCheck = 0;
async function checkForUpdate(){
  if (Date.now() - lastCheck < 60000) return;
  lastCheck = Date.now();
  try {
    const h = await fetch('./index.html', { method: 'HEAD', cache: 'no-store' });
    if (!h.ok) return;
    const s = sigOf(h);
    if (s === '|' || s === await loadSig()) return;      // no validators, or unchanged
    const res = await fetch('./index.html', { cache: 'no-store' });
    if (!res.ok) return;
    await (await caches.open(SHELL_CACHE)).put('./index.html', res);
    await saveSig(s);
  } catch (_) { /* offline: ignore */ }
}

async function fontsSWR(req){
  const c = await caches.open(FONT_CACHE);
  const hit = await c.match(req);
  const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => hit);
  return hit || net;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./index.html').then(r => r || fetch(req)));
    e.waitUntil(checkForUpdate());
    return;
  }
  if (url.origin === location.origin && url.pathname.endsWith('/lb-config.js')) {
    e.respondWith(fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(SHELL_CACHE).then(x => x.put(req, c)); } return r; }).catch(() => caches.match(req)));
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(fontsSWR(req));
  }
});
