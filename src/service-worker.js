const URLSToCache = [
  '/service-worker.js',
  ...self.__precacheManifest.map(a => a.url)
];

async function nagUpdate(claimClients) {
  console.debug('[UpdateNagManager] Nagging clients to update...');
  if (claimClients) await clients.claim();
  let cs = await clients.matchAll();
  cs.forEach(c => {
    c.postMessage({ op: 0, d: true });
  });
}

self.addEventListener('install', async e => {
  try {
    await self.skipWaiting();
    await caches.delete('offline-cache');
    await caches.delete('shared-files');
    e.waitUntil(
      (async function () {
        let offlineCache = await caches.open('offline-cache');
        for (let url of URLSToCache) {
          console.debug(
            `[ServiceWorkerInstallManager] Adding ${url} to cache...`
          );
          await offlineCache.add(new Request(url));
        }
        nagUpdate(true);
        return;
      })()
    );
  } catch (error) {}
});

self.addEventListener('fetch', async e => {
  const url = new URL(e.request.url);
  if (e.request.method === 'POST' && url.pathname === '/dashboard/upload/') {
    console.debug('[ExternalShareManager] External share request detected...');
    e.respondWith(
      (async () => {
        const cache = await caches.open('shared-files'),
          reqData = await e.request.formData(),
          file = reqData.get('file'),
          now = Date.now();

        await cache.put(
          `/shared-files/${now}`,
          new Response(file, {
            headers: {
              'Content-Type': file.type,
              'Content-Length': file.size,
              'X-Filename': file.name
            }
          })
        );

        return Response.redirect(`/dashboard/upload/?file=${now}`);
      })()
    );
  } else if (e.request.method !== 'POST') {
    let newlyAdded = false;
    e.respondWith(
      (async () => {
        let cacheMatch = await caches.match(e.request);
        if (cacheMatch) {
          console.debug(`[CacheManager] Cache hit for ${url}`);
          return cacheMatch;
        } else {
          try {
            let response = await fetch(e.request);
            if (
              !response.ok &&
              !url.pathname.startsWith('/api') &&
              !url.host.startsWith('previews')
            ) {
              if (e.request.url.includes('/shared-files/')) {
                console.debug(
                  `[ExternalShareManager] Shared file not found: ${url}`
                );
                return new Response('', { status: 404 });
              } else {
                console.debug(
                  `[CacheManager] Page not found: ${url}, serving default page`
                );
                let cachedIndex = await (
                  await caches.open('offline-cache')
                ).match('/index.html');
                return cachedIndex;
              }
            }
            if (
              !response ||
              (!response.ok && !url.host.startsWith('previews')) ||
              (!response.ok &&
                url.host.startsWith('previews') &&
                response.status !== 415) ||
              response.type === 'opaque' ||
              url.pathname.startsWith('/api') ||
              (response.headers.get('Cache-Control') === 'no-cache' &&
                !url.host.startsWith('previews')) ||
              (url.pathname === '/' && url.host.startsWith('previews'))
            ) {
              console.debug(
                `[CacheManager] ${url} is not eligible for caching`
              );
              return response;
            } else {
              newlyAdded = true;
              let responseToCache = response.clone();
              if (url.host.startsWith('previews')) {
                let cache = await caches.open('preview-icons');
                console.debug(
                  `[CacheManager] Adding ${e.request.url} to preview cache...`
                );
                await cache.put(e.request, responseToCache);
              } else {
                let cache = await caches.open('offline-cache');
                console.debug(
                  `[CacheManager] Adding ${e.request.url} to offline cache...`
                );
                await cache.put(e.request, responseToCache);
              }
              return response;
            }
          } catch (error) {
            console.error('[CacheManager] ', error);
            if (
              !url.pathname.startsWith('/api') &&
              !url.host.startsWith('previews') &&
              !url.pathname.startsWith('/shared-files/')
            )
              return await (
                await caches.open('offline-cache')
              ).match('/index.html');
            else return new Response('', { status: 500 });
          }
        }
      })()
    );

    if (
      newlyAdded ||
      url.host.startsWith('previews') ||
      url.pathname.startsWith('/shared-files/') ||
      url.pathname.startsWith('/api')
    ) {
      console.debug(`[CacheManager] ${url} is not eligible for update check`);
      return;
    }
    let offlineCache = await caches.open('offline-cache'),
      cached = await offlineCache.match(e.request);

    if (navigator.onLine && cached) {
      let res = await fetch(e.request);
      if (
        res.headers.get('Last-Modified') &&
        new Date(res.headers.get('Last-Modified')).getTime()
      ) {
        if (
          new Date(cached.headers.get('Last-Modified')).getTime() <
          new Date(res.headers.get('Last-Modified')).getTime()
        ) {
          console.debug(
            `[CacheManager] ${
              new URL(e.request.url).pathname
            } from cache is outdated, updating cache!`
          );
          await offlineCache.delete(e.request.url);
          await offlineCache.put(e.request, res);
        } else {
          console.debug(`[CacheManager] ${url} is up to date`);
        }
      } else {
        console.debug(
          `[CacheManager] ${url} has no Last-Modified header or is not a valid date`
        );
      }
    } else {
      console.debug(
        `[CacheManager] UA is offline or ${url} is not cached, unnessary to check for updates`
      );
    }
  }
});
self.addEventListener('message', async e => {
  switch (e.data.op) {
    case 0:
      let shareCache = await caches.open('shared-files');
      await shareCache.delete(e.data.d);
      break;
    case 2:
      console.debug('[MessageManager] Deleting preview thumbnail cache!');
      await caches.delete('preview-icons');
      break;
    case 3:
      console.debug('[MessageManager] Deleting all caches!');
      await caches.delete('shared-files');
      await caches.delete('preview-icons');
      await caches.delete('offline-cache');
      break;
  }
});
