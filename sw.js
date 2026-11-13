/* Race the Clock — coherent offline shell.
   Bump SHELL_VERSION whenever bundled HTML, scripts, styles or icons change.
   A complete new shell installs before activation; existing tabs keep their
   current worker until closed. Do not replace individual shell files in place. */
const CACHE_PREFIX = 'rtc:' + encodeURIComponent(self.registration.scope) + ':';
const SHELL_VERSION = 'v10';
const SHELL_CACHE = CACHE_PREFIX + 'shell-' + SHELL_VERSION;
const FONT_CACHE = CACHE_PREFIX + 'fonts-v1';
const CONFIG_CACHE = CACHE_PREFIX + 'config-v1';
const SHELL = ['./index.html','./polish.css','./polish.js','./language.js','./studio-ui.js','./studio-ui.css','./manifest.webmanifest','./icon-192.png','./icon-512.png','./maskable-512.png','./apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL_CACHE);
    // addAll commits the complete bundle or rejects installation on failure.
    await c.addAll(SHELL.map(path => new Request(new URL(path, self.registration.scope), {cache: 'reload'})));
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keep = [SHELL_CACHE, FONT_CACHE, CONFIG_CACHE];
    for (const key of await caches.keys()) {
      if (key.startsWith(CACHE_PREFIX) && !keep.includes(key)) await caches.delete(key);
    }
    // Legacy unscoped caches may belong to another installation: preserve them.
  })());
});

async function shellResponse(req, navigation = false){
  const c = await caches.open(SHELL_CACHE);
  return (await c.match(navigation ? new URL('./index.html', self.registration.scope).href : req)) || fetch(req);
}

async function configResponse(req){
  const c = await caches.open(CONFIG_CACHE);
  try {
    const response = await fetch(req);
    if (response.ok) await c.put(req, response.clone());
    return response;
  } catch (err) {
    const cached = await c.match(req);
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate' && url.origin === location.origin) {
    e.respondWith(shellResponse(req, true));
    return;
  }
  if (url.origin === location.origin && url.pathname.endsWith('/lb-config.js')) {
    e.respondWith(configResponse(req));
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(shellResponse(req));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    const cache = caches.open(FONT_CACHE);
    const hit = cache.then(c => c.match(req));
    const refresh = cache.then(async c => {
      const response = await fetch(req);
      if (response.ok || response.type === 'opaque') await c.put(req, response.clone());
      return response;
    });
    e.waitUntil(refresh.then(() => {}, () => {}));
    e.respondWith(hit.then(cached => cached || refresh));
  }
});
