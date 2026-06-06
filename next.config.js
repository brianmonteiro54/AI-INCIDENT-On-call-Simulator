/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  // Baseline security headers applied to every route. Safe set (no CSP, which
  // would need careful tuning for inline styles / framer-motion).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // anti-clickjacking (the game isn't meant to be framed cross-origin)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // stop MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // don't leak full URLs to other origins
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // the app uses none of these device APIs — deny them
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
