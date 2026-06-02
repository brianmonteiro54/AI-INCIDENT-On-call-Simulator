"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (public/sw.js) so the app works offline.
 *
 * Only runs in production — in `next dev` a caching SW would serve stale HMR
 * chunks. Registration happens after `load` so it never competes with the
 * initial render/network. Renders nothing.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
