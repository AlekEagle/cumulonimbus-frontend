/// <reference lib="WebWorker" />
import { skipWaiting, clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  createHandlerBoundToURL,
  cleanupOutdatedCaches
} from 'workbox-precaching';
import { NavigationRoute, registerRoute, Route } from 'workbox-routing';
import { ManualHandlerCallbackOptions } from 'workbox-core';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

const BaseThumbnailURLs: { [key: string]: string } = {
  production: `previews.${self.location.hostname}`,
  prod_preview: 'previews.alekeagle.me',
  development: 'localhost:8100'
};

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);
skipWaiting();
clientsClaim();

// Make SPA available offline
// Register a route to serve /index.html from the cache when the user is offline or the webserver returns a 404.
registerRoute(
  async options => {
    if (
      options.request.method === 'GET' ||
      !options.url.pathname.match(/^\/api\/?/) ||
      !(await caches.match(options.url))
    )
      return false;
    return true;
  },
  async options => {
    const cachedResponse = await caches.match(options.request);
    const indexHTML = (await caches.match('/index.html')) as Response;
    if (cachedResponse) return cachedResponse;
    if (!self.navigator.onLine) return indexHTML;
    if ((await fetch(options.request)).status === 404) return indexHTML;
    return await fetch(options.request);
  }
);

// Register a route for preview thumbnails.
// This route will serve the preview thumbnail from the cache if it exists.
// If the thumbnail does not exist in the cache, it will be fetched and
// cached for future use.
// All preview thumbnails are cached for a lifetime of one day.
// Preview thumbnails are requested from "previews.${hostname}/filename" URLs.
const previewThumbnailRoute = new Route(
  ({ request }) =>
    new URL(request.url).hostname === BaseThumbnailURLs[import.meta.env.MODE],
  new CacheFirst({
    cacheName: 'preview-thumbnails',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 24 * 60 * 60,
        purgeOnQuotaError: true
      }),
      new CacheableResponsePlugin({
        statuses: [200, 304, 415]
      })
    ]
  })
);
registerRoute(previewThumbnailRoute);

// Register a route for the share target

registerRoute('/dashboard/upload', shareTargetHandler, 'POST');

async function shareTargetHandler(
  options: ManualHandlerCallbackOptions
): Promise<Response> {
  const formData = await (options.event as FetchEvent).request.formData();
  const file = formData.get('file');
  if (!file) {
    // If the file is not provided, redirect to upload page with no file.
    return Response.redirect('/dashboard/upload');
  }
  // Add file to share-target-cache.
  const cache = await caches.open('share-target-cache');
  await cache.put(
    'shared-file',
    new Response(file, { headers: { Filename: (file as File).name } })
  );
  // Redirect to upload page with the file.
  return Response.redirect(`/dashboard/upload?shared-file`);
}
