/* ──────────────────────────────────────────────────────────────────────────
 * AI INCIDENT — Service Worker (no framework, no build step)
 *
 * Makes the app usable offline. All mission content (incidents, findings, quiz)
 * ships inside the app's JS, so once the shell + hashed assets are cached, the
 * game is fully playable with no connection.
 *
 * Strategies:
 *   • Hashed static assets (/_next/static, icons, images, fonts) → stale-while-
 *     revalidate. They're content-hashed (immutable), so we serve from cache
 *     instantly and refresh in the background.
 *   • Page navigations (HTML) → network-first, fall back to cache, then to a
 *     friendly /offline.html.
 *   • GET /api/leaderboard → network-first, fall back to the last cached board,
 *     then to an empty board — so the leaderboard never errors out offline.
 *   • Everything else (POST /api/submit, cross-origin) → not intercepted; the
 *     app already handles those failing gracefully when offline.
 *
 * Bump VERSION to ship a new SW; old caches are purged on activate.
 * ────────────────────────────────────────────────────────────────────────── */

const VERSION = "v1";
const STATIC_CACHE = `ai-incident-static-${VERSION}`;
const RUNTIME_CACHE = `ai-incident-runtime-${VERSION}`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GETs; let POST /api/submit etc. hit the network normally.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Ignore cross-origin requests (CDNs, Upstash, analytics, …).
  if (url.origin !== self.location.origin) return;

  // The leaderboard: network-first so it's fresh, but degrade to the last
  // cached standings (or an empty board) when offline — never error.
  if (url.pathname === "/api/leaderboard") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return (
            cached ||
            new Response(JSON.stringify({ entries: [], offline: true }), {
              headers: { "Content-Type": "application/json" },
            })
          );
        })
    );
    return;
  }

  // Other API routes (e.g. POST is already filtered): don't cache.
  if (url.pathname.startsWith("/api/")) return;

  // Page navigations: network-first, then cache, then offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
