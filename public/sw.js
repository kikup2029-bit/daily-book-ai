/*
 * Service worker: makes the app open and stay usable without a connection.
 *
 * Two separate caches, deliberately:
 *   shell — code, icons, page HTML. Safe to keep around.
 *   data  — answers to read-only data requests, so the books are readable
 *           offline. This holds the owner's financial figures, so it is wiped
 *           on sign-out and never persists across accounts.
 *
 * Bump VERSION when this file changes; old caches are deleted on activate.
 */

const VERSION = "v2";
const SHELL_CACHE = `simplebooks-shell-${VERSION}`;
const DATA_CACHE = `simplebooks-data-${VERSION}`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [OFFLINE_URL, "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Don't let one missing file abort the whole install.
      await Promise.all(
        PRECACHE.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => undefined),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("simplebooks-") && name !== SHELL_CACHE && name !== DATA_CACHE)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

// The app asks us to forget the owner's data on sign-out.
self.addEventListener("message", (event) => {
  if (event.data === "clear-data-cache") {
    event.waitUntil(caches.delete(DATA_CACHE));
  }
});

const isAsset = (url) =>
  url.pathname.startsWith("/_build/") ||
  url.pathname.startsWith("/assets/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname === "/manifest.webmanifest" ||
  url.pathname === "/favicon.ico";

// TanStack Start's server functions. GETs are reads and safe to keep a copy of.
const isDataRead = (url) => url.pathname.includes("_serverFn");

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Anything that changes data goes straight to the network, always. A queued
  // write is the app's job (see offline-queue.ts), not the cache's.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never touch auth. A cached sign-in page or session response would be both
  // wrong and a privacy problem.
  if (url.pathname.startsWith("/auth")) return;

  if (isAsset(url)) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  if (isDataRead(url)) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(navigateWithFallback(request));
  }
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) {
    // Refresh in the background so a new build lands without a stale wait.
    fetchAndPut(request, cache);
    return hit;
  }
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const hit = await cache.match(request);
    if (hit) return hit;
    throw error;
  }
}

async function navigateWithFallback(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const hit = await cache.match(request, { ignoreSearch: true });
    if (hit) return hit;
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response("You're offline.", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

function fetchAndPut(request, cache) {
  fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
    })
    .catch(() => undefined);
}

// Reminder notifications are scheduled by the page and shown by us, so they
// still appear when the app is only installed rather than open.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const open = all.find((client) => client.url.includes("/dashboard"));
      if (open) return open.focus();
      return self.clients.openWindow("/dashboard");
    })(),
  );
});
