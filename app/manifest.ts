import type { MetadataRoute } from "next";

// App Router serves this at /manifest.webmanifest and auto-injects the
// <link rel="manifest"> tag. Enables "Add to Home Screen" / standalone mode.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI INCIDENT · On-call Simulator",
    short_name: "AI Incident",
    description: "Simulador de plantão pra estudar o AWS Certified AI Practitioner sob pressão real.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFBEF",
    theme_color: "#FFFBEF",
    categories: ["education", "games"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
