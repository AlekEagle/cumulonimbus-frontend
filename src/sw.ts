/// <reference lib="WebWorker" />

declare var self: ServiceWorkerGlobalScope;

import { Router, RouteParams } from './utils/swRouter';

// ---- Constants ----

///@ts-ignore
const precacheManifest = self.__WB_MANIFEST;

// Router setup
const router = new Router();

// BaseThumbnailURLs is a map of environments to regexps that match the base URL of the thumbnail server.
const BaseThumbnailURLs: { [key: string]: RegExp } = {
  production: new RegExp(
    `previews\\.${self.location.hostname.replace('.', '\\.')}`,
  ),
  ptb: new RegExp('previews\\.alekeagle\\.me'),
  development: /localhost(?::\d{1,5})?/,
};

// ---- Debugging functions ----

function debugLog(component: string = 'ServiceWorker', ...data: any[]) {
  console.debug(`[${component}]`, ...data);
}

function errorLog(component: string = 'ServiceWorker', ...data: any[]) {
  console.error(`[${component}]`, ...data);
}

// Bind router to fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const response = await router.handleRequest(event as FetchEvent);
      if (!response) {
        return (
          (await caches.match(event.request)) || (await fetch(event.request))
        );
      }
      return response;
    })(),
  );
});

// ---- Helper functions ----

async function claimClients(skipWaiting: boolean = false): Promise<void> {
  debugLog('ServiceWorkerClaimClients', 'Claiming clients...');
  if (skipWaiting) await self.skipWaiting();
  return await self.clients.claim();
}

async function messageClients(message: any): Promise<void> {
  debugLog('ServiceWorkerMessageClients', 'Messaging clients...', message);
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage(message);
  }
  debugLog('ServiceWorkerMessageClients', 'Messaging complete.');
}

// Create our own precache function that uses multiple threads to precache.
// that way we can precache
async function threadedPrecache(urls: string[], threads: number = 4) {
  debugLog('ServiceWorkerThreadedPrecache', 'Precaching...');
  const chunkSize = Math.ceil(urls.length / threads);
  const chunks = [];
  for (let i = 0; i < urls.length; i += chunkSize) {
    chunks.push(urls.slice(i, i + chunkSize));
  }
  const promises = [];
  for (const chunk of chunks) {
    promises.push(
      new Promise<void>(async (resolve, reject) => {
        const cache = await caches.open('offline-cache');
        for (const url of chunk) {
          try {
            debugLog('ServiceWorkerThreadedPrecache', `URL: ${url}`);
            await cache.add(url);
          } catch (err) {
            reject(err);
          }
        }
        resolve();
      }),
    );
  }
  await Promise.all(promises);
  debugLog('ServiceWorkerThreadedPrecache', 'Precaching complete.');
}

// ---- Service worker lifecycle ----

self.addEventListener('install', async (event) => {
  debugLog('ServiceWorkerInstall', 'Install Event!');
  const urlsToCache = precacheManifest.map((entry: any) => entry.url);
  try {
    await threadedPrecache(urlsToCache);
    await claimClients(true);
    await messageClients({ type: 'update-complete' });
  } catch (err) {
    errorLog('ServiceWorkerInstall', err);
    await claimClients(true);
    await messageClients({ type: 'update-failed' });
    // Unregister the service worker if precaching fails so that the user can still use the site.
    self.registration.unregister();
  }
});

// ---- Router routes ----

// Make SPA available offline
// Register a route to serve /index.html from the cache when the user is offline or the webserver returns a 404.
router.addRoute(
  async (options) => {
    if (
      options.request.method !== 'GET' || // Only cache GET requests
      options.url.pathname.match(/^\/api\/?/) || // Don't cache API requests
      options.url.host.match(BaseThumbnailURLs[import.meta.env.MODE]) || // Don't cache thumbnails, they have their own cache.
      options.url.protocol === 'chrome-extension:' // Don't cache chrome extensions
    ) {
      debugLog(
        'ServiceWorkerOfflineCacheManager',
        'Rejected request for caching',
        `URL: ${options.url}`,
      );
      return false;
    }
    debugLog(
      'ServiceWorkerOfflineCacheManager',
      'Request passed all checks for cache',
      `URL: ${options.url}`,
    );
    return true;
  },
  async (options) => {
    // Implement a cache-first strategy with network fallback, revalidating the cache in the background.
    // If the cache is not available, use the network.
    // If the network fails, use the cache.
    // If the network succeeds, update the cache.
    const cache = await caches.open('offline-cache');
    const response = await cache.match(options.url);
    if (response !== undefined) {
      // Cache hit
      // Revalidate the cache in the background
      debugLog(
        'ServiceWorkerOfflineCacheManager',
        'Cache hit',
        `URL: ${options.url}`,
      );
      if (navigator.onLine) {
        debugLog(
          'ServiceWorkerOfflineCacheManager',
          'Revalidating cache',
          `URL: ${options.url}`,
        );
        options.event.waitUntil(cache.add(options.url));
      }
      return response;
    }
    // Cache miss
    // Fetch from network
    // If we aren't online, return the offline page.
    debugLog(
      'ServiceWorkerOfflineCacheManager',
      'Cache miss',
      `URL: ${options.url}`,
    );
    if (!navigator.onLine) {
      debugLog(
        'ServiceWorkerOfflineCacheManager',
        'Offline, serving default route',
        `URL: ${options.url}`,
      );
      return (await caches.match('/index.html')) as Response;
    }
    // Otherwise, fetch from the network.
    debugLog(
      'ServiceWorkerOfflineCacheManager',
      'Fetching fresh resource...',
      `URL: ${options.url}`,
    );
    const freshResponse = await fetch(options.request);
    if (freshResponse.status === 404) {
      // If the network returns a 404, return the offline page.
      debugLog(
        'ServiceWorkerOfflineCacheManager',
        'Fresh resource returned 404, serving default route',
        `URL: ${options.url}`,
      );
      return (await caches.match('/index.html')) as Response;
    }
    // If the network returns a 200, cache the response and return it.
    debugLog(
      'ServiceWorkerOfflineCacheManager',
      'Fresh resource OK, serving and caching',
      `URL: ${options.url}`,
    );
    cache.put(options.url, freshResponse.clone());
    return freshResponse;
  },
);

// Register a route for preview thumbnails.
// This route will serve the preview thumbnail from the cache if it exists.
// If the thumbnail does not exist in the cache, it will be fetched and
// cached for future use.
// Preview thumbnails are requested from "previews.${hostname}/filename" URLs.
async function previewThumbnailHandler(
  options: RouteParams,
): Promise<Response> {
  debugLog('ServiceWorkerThumbnailCacheManager', 'Thumbnail cache triggered');
  // First, open the 'thumbnails' cache
  const cache = await caches.open('thumbnails');
  // Next, check if there is a thumbnail in cache.
  const thumb = await cache.match((options.event as FetchEvent).request);
  // If there is a thumbnail in cache, return it.
  if (thumb) {
    debugLog(
      'ServiceWorkerThumbnailCacheManager',
      'Serving thumbnail from cache',
    );
    return thumb;
  }
  // Otherwise, fetch the thumbnail
  debugLog(
    'ServiceWorkerThumbnailCacheManager',
    'Cache miss, fetching fresh thumbnail',
  );
  const freshThumb = await fetch((options.event as FetchEvent).request);
  // Check if the thumbnail's status is one of the allowable statuses (200, 415)
  switch (freshThumb.status) {
    case 200:
      // If the status is 200, Check if the thumbnail actually has content.
      if (freshThumb.headers.get('content-length') === '0') {
        // The thumbnail server timed out, FFMPEG is still processing the thumbnail. Return Gateway Timeout.
        debugLog(
          'ServiceWorkerThumbnailCacheManager',
          'Thumbnail failed to generate, not caching.',
        );
        return new Response(null, {
          status: 504,
          statusText: 'Gateway Timeout',
        });
      }
      debugLog(
        'ServiceWorkerThumbnailCacheManager',
        'Successfully fetched fresh thumbnail, caching and serving',
      );
      // The thumbnail server returned a thumbnail. Cache it and return it.
      cache.put((options.event as FetchEvent).request, freshThumb.clone());
      return freshThumb;
    case 415:
      // The thumbnail server can't process the file. Cache it so we don't have to keep asking for it and return it.
      debugLog(
        'ServiceWorkerThumbnailCacheManager',
        'Thumbnail not available, caching nonavailability',
      );
      cache.put((options.event as FetchEvent).request, freshThumb.clone());
      return freshThumb;
    default:
      // The thumbnail server returned an error. Don't cache it and return it.
      return freshThumb;
  }
}
router.addRoute((options) => {
  // Disable thumbnail caching in development mode. (The regex will match the localhost API and make it think all requests are thumbnails.)
  if (import.meta.env.MODE === 'development') return false;

  if (
    options.request.method === 'GET' &&
    options.url.host.match(BaseThumbnailURLs[import.meta.env.MODE])
  )
    return true;
  return false;
}, previewThumbnailHandler);

// Register a route for the share target

router.addRoute('/dashboard/upload', shareTargetHandler, 'POST');

async function shareTargetHandler(options: RouteParams): Promise<Response> {
  debugLog('ServiceWorkerShareTargetHandler', 'Share target triggered');
  const formData = await (options.event as FetchEvent).request.formData();
  const file = formData.get('file');
  if (!file) {
    // If the file is not provided, redirect to upload page with no file.
    debugLog(
      'ServiceWorkerShareTargetHandler',
      'No file provided to share target, ignoring',
    );
    return Response.redirect('/dashboard/upload');
  }
  // Add file to share-target-cache.
  debugLog(
    'ServiceWorkerShareTargetHandler',
    'Adding shared file to share cache...',
  );
  const cache = await caches.open('share-target-cache');
  await cache.put(
    'shared-file',
    new Response(file, { headers: { Filename: (file as File).name } }),
  );
  // Redirect to upload page with the file.
  debugLog(
    'ServiceWorkerShareTargetHandler',
    'Redirecting user to upload view',
  );
  return Response.redirect(`/dashboard/upload?shared-file`);
}
