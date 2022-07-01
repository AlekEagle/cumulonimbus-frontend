/// <reference lib="WebWorker" />
import { skipWaiting, clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute, Route } from 'workbox-routing';
import { ManualHandlerCallbackOptions } from 'workbox-core';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
skipWaiting();
clientsClaim();

// Make SPA available offline
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/api\/?.*/]
  })
);

// Register a route for preview thumbnails.
// This route will serve the preview thumbnail from the cache if it exists.
// If the thumbnail does not exist in the cache, it will be fetched and
// cached for future use.
// All preview thumbnails are cached for a lifetime of one day.
// Preview thumbnails are requested from "previews.${hostname}/filename" URLs.
const previewThumbnailRoute = new Route(
  ({ request }) =>
    new URL(request.url).hostname === `previews.${self.location.hostname}`,
  new CacheFirst({
    cacheName: 'preview-thumbnails',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 24 * 60 * 60,
        purgeOnQuotaError: true
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
  const now = Date.now();
  await cache.put(now + '', new Response(file));
  // Redirect to upload page with the file.
  return Response.redirect(`/dashboard/upload?file=${now}`);
}
