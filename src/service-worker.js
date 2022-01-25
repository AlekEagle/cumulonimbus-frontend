const URLSToCache = [
  'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Source+Code+Pro:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap',
  '/service-worker.js',
  '/manifest.json',
  ...self.__precacheManifest.map(a => a.url)
];

async function nagTimeoutFn(claimClients) {
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
          console.log(`Adding ${url} to cache...`);
          await offlineCache.add(new Request(url));
        }
        nagTimeoutFn(true);
        return;
      })()
    );
  } catch (error) {}
});

self.addEventListener('fetch', async e => {
  if (
    e.request.method === 'POST' &&
    e.request.url.endsWith('/dashboard/upload/')
  ) {
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
        if (cacheMatch) return cacheMatch;
        else {
          try {
            let response = await fetch(e.request);
            if (
              !response.ok &&
              !response.url.includes('/api') &&
              !response.url.includes('previews') &&
              !e.request.url.includes('/shared-files/')
            ) {
              if (e.request.url.includes('/shared-files/')) {
                return new Response('', { status: 404 });
              } else {
                let cachedIndex = await (
                  await caches.open('offline-cache')
                ).match('/index.html');
                return cachedIndex;
              }
            }
            if (
              !response ||
              !response.ok ||
              response.type === 'opaque' ||
              response.url.includes('/api')
            )
              return response;
            else {
              console.log(`Adding ${e.request.url} to cache...`);
              newlyAdded = true;
              let responseToCache = response.clone();
              if (e.request.url.includes('previews.')) {
                let cache = await caches.open('preview-icons');

                await cache.put(e.request, responseToCache);
              } else {
                let cache = await caches.open('offline-cache');

                await cache.put(e.request, responseToCache);
              }
              return response;
            }
          } catch (error) {
            if (
              !e.request.url.includes('/api') &&
              !e.request.url.includes('previews') &&
              !e.request.url.includes('/shared-files/')
            )
              return await (
                await caches.open('offline-cache')
              ).match('/index.html');
            console.error(error);
          }
        }
      })()
    );

    if (newlyAdded || e.request.url.includes('previews.')) return;

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
          console.log(
            `${
              new URL(e.request.url).pathname
            } from cache is outdated, updating cache!`
          );
          await offlineCache.delete(e.request.url);
          await offlineCache.put(e.request, res);
        }
      }
    }
  }
});
self.addEventListener('message', async e => {
  switch (e.data.op) {
    case 0:
      let shareCache = await caches.open('shared-files');
      await shareCache.delete(e.data.d);
      break;
    case 1:
      console.log(
        `Turns out ${e.data.d} doesn't really exist, removing from cache.`
      );
      let offlineCache = await caches.open('offline-cache');
      await offlineCache.delete(e.data.d);
      break;
    case 2:
      console.log('Deleting preview thumbnail cache!');
      await caches.delete('preview-icons');
      break;
    case 3:
      console.log('Deleting offline cache!');
      await caches.delete('offline-cache');
      break;
  }
});
