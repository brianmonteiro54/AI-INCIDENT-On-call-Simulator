/* ──────────────────────────────────────────────────────────────────────────
 * AI INCIDENT — Service Worker (no framework, no build step)
 *
 * Makes the app usable offline. All mission content (incidents, findings, quiz)
 * ships inside the app's JS, so once the app shell + its assets are cached, the
 * game is playable with no connection.
 *
 * Why scrape the shell on install? In the Next App Router, the first page load
 * happens BEFORE this SW takes control, and subsequent in-app navigation is
 * client-side (no HTML document is fetched). So the SW would otherwise never
 * cache the home HTML or its JS/CSS. On install (while online) we fetch "/",
 * cache it, and cache every /_next/static asset it references — guaranteeing the
 * app boots offline on a reload or when the installed PWA is reopened.
 *
 * Strategies:
 *   • Static assets (/_next/static, icons, images, fonts) → stale-while-revalidate.
 *   • Navigations (HTML) → network-first → exact cache → cached home shell →
 *     /offline.html. Falling back to the home shell (instead of the offline page)
 *     drops the user back INTO the app, where cached missions still work.
 *   • GET /api/leaderboard → network-first → last cached board → empty board
 *     (never errors offline).
 *   • Everything else (POST /api/submit, cross-origin) → not intercepted.
 *
 * Bump VERSION to ship a new SW; old caches are purged on activate.
 * ────────────────────────────────────────────────────────────────────────── */

const VERSION = "v4";
const STATIC_CACHE = `ai-incident-static-${VERSION}`;
const RUNTIME_CACHE = `ai-incident-runtime-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const APP_SHELL_URL = "/";

const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];

// Fetch a URL, cache the document, and precache every /_next/static asset it
// references. Returns the HTML (or null on failure).
async function precacheUrlAndAssets(cache, url) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res || !res.ok) return null;
  await cache.put(url, res.clone());
  const html = await res.text();
  const assets = new Set();
  const re = /(?:src|href)="(\/_next\/static\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) assets.add(m[1]);
  await Promise.all([...assets].map((u) => cache.add(u).catch(() => {})));
  return html;
}

// Precache the home shell AND one mission page. Opening an /incident/[id] page
// pulls in the route chunk shared by EVERY mission, so caching it once (via a
// mission link found on the home page) makes all missions playable offline —
// even ones never opened this session. Mission content lives in the JS bundle,
// so no per-mission server data is required.
async function precacheAppShell(cache) {
  try {
    const homeHtml = await precacheUrlAndAssets(cache, APP_SHELL_URL);
    // Find a mission link to pull in the route chunk shared by all missions.
    let missionUrl = null;
    if (homeHtml) {
      const link = homeHtml.match(/href="(\/incident\/[^"?]+)"/);
      if (link) missionUrl = link[1];
    }
    // The home HTML may server-render the welcome screen (no mission links yet),
    // so fall back to a stable intro mission. This guarantees the shared
    // /incident/[id] chunk is cached at install — so missions work offline even
    // if the user goes offline before Next prefetches anything.
    await precacheUrlAndAssets(cache, missionUrl || "/incident/polly-mispronounce").catch(() => {});
  } catch {
    /* offline/blocked during install — runtime caching fills in later */
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      await cache.addAll(PRECACHE).catch(() => {});
      await precacheAppShell(cache);
      await self.skipWaiting();
    })
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

  // Only GETs; POST /api/submit etc. go straight to the network.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Ignore cross-origin (CDNs, Upstash, analytics, …).
  if (url.origin !== self.location.origin) return;

  // Leaderboard: fresh when online, last-known (or empty) when offline.
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

  // Other API routes: don't cache.
  if (url.pathname.startsWith("/api/")) return;

  // Navigations: network-first → exact cache → home shell → offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ||
            (await caches.match(APP_SHELL_URL)) ||
            (await caches.match(OFFLINE_URL))
          );
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
