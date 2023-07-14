/// <reference lib="WebWorker" />

declare var self: ServiceWorkerGlobalScope;

import { Router, RouteParams } from "./utils/swRouter";

const router = new Router();

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const response = await router.handleRequest(event as FetchEvent);
      if (!response) {
        return (
          (await caches.match(event.request)) || (await fetch(event.request))
        );
      }
      return response;
    })()
  );
});

///@ts-ignore
const precacheManifest = self.__WB_MANIFEST;

async function nagToUpdate(claim: boolean = false): Promise<void> {
  console.debug("[UpdateNag] Nagging clients to update...");
  if (claim) {
    console.debug("[UpdateNag] Claiming clients...");
    await self.clients.claim();
  }
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage({ type: "update-nag" });
  }
}

self.addEventListener("install", async (event) => {
  console.debug("[ServiceWorker] Install event");
  try {
    await self.skipWaiting();
    await caches.delete("offline-cache");
    await caches.delete("share-target-cache");
    const cache = await caches.open("offline-cache");
    for (const file of precacheManifest) {
      console.debug(`[ServiceWorkerInstallManager] Caching ${file.url}...`);
      await cache.add(new Request(file.url));
    }
    console.debug("[ServiceWorkerInstallManager] Caching complete.");
    // Nag clients to update.
    await nagToUpdate(true);
  } catch (e) {
    console.error("[ServiceWorker] Install event failed", e);
  }
});

const BaseThumbnailURLs: { [key: string]: RegExp } = {
  production: new RegExp(
    `previews\\.${self.location.hostname.replace(".", "\\.")}`
  ),
  ptb: new RegExp("previews\\.alekeagle\\.me"),
  development: /localhost(?::\d{1,5})?/,
};

// Make SPA available offline
// Register a route to serve /index.html from the cache when the user is offline or the webserver returns a 404.
router.addRoute(
  async (options) => {
    if (
      options.request.method !== "GET" ||
      options.url.pathname.match(/^\/api\/?/) ||
      (await caches.match(options.url)) ||
      options.url.host.match(BaseThumbnailURLs[import.meta.env.MODE])
    )
      return false;
    return true;
  },
  async (options) => {
    const cachedResponse = await caches.match(options.request);
    const indexHTML = (await caches.match("/index.html")) as Response;
    if (cachedResponse) return cachedResponse;
    if (!self.navigator.onLine) return indexHTML;
    const freshResponse = await fetch(options.request);
    if (freshResponse.status === 404) return indexHTML;
    return freshResponse;
  }
);

// Register a route for preview thumbnails.
// This route will serve the preview thumbnail from the cache if it exists.
// If the thumbnail does not exist in the cache, it will be fetched and
// cached for future use.
// Preview thumbnails are requested from "previews.${hostname}/filename" URLs.
async function previewThumbnailHandler(
  options: RouteParams
): Promise<Response> {
  // First, open the 'thumbnails' cache
  const cache = await caches.open("thumbnails");
  // Next, check if there is a thumbnail in cache.
  const thumb = await cache.match((options.event as FetchEvent).request);
  // If there is a thumbnail in cache, return it.
  if (thumb) return thumb;
  // Otherwise, fetch the thumbnail
  const freshThumb = await fetch((options.event as FetchEvent).request);
  // Check if the thumbnail's status is one of the allowable statuses (200, 415)
  switch (freshThumb.status) {
    case 200:
      // If the status is 200, Check if the thumbnail actually has content.
      if (freshThumb.headers.get("content-length") === "0") {
        // The thumbnail server timed out, FFMPEG is still processing the thumbnail. Return Gateway Timeout.
        return new Response(null, {
          status: 504,
          statusText: "Gateway Timeout",
        });
      }
      // The thumbnail server returned a thumbnail. Cache it and return it.
      cache.put((options.event as FetchEvent).request, freshThumb.clone());
      return freshThumb;
    case 415:
      // The thumbnail server can't process the file. Cache it so we don't have to keep asking for it and return it.
      cache.put((options.event as FetchEvent).request, freshThumb.clone());
      return freshThumb;
    default:
      // The thumbnail server returned an error. Return it.
      return freshThumb;
  }
}
router.addRoute((options) => {
  // Disable thumbnail caching in development mode. (The regex will match the localhost API and make it think all requests are thumbnails.)
  if (import.meta.env.MODE === "development") return false;

  if (
    options.request.method === "GET" &&
    options.url.host.match(BaseThumbnailURLs[import.meta.env.MODE])
  )
    return true;
  return false;
}, previewThumbnailHandler);

// Register a route for the share target

router.addRoute("/dashboard/upload", shareTargetHandler, "POST");

async function shareTargetHandler(options: RouteParams): Promise<Response> {
  const formData = await (options.event as FetchEvent).request.formData();
  const file = formData.get("file");
  if (!file) {
    // If the file is not provided, redirect to upload page with no file.
    return Response.redirect("/dashboard/upload");
  }
  // Add file to share-target-cache.
  const cache = await caches.open("share-target-cache");
  await cache.put(
    "shared-file",
    new Response(file, { headers: { Filename: (file as File).name } })
  );
  // Redirect to upload page with the file.
  return Response.redirect(`/dashboard/upload?shared-file`);
}
