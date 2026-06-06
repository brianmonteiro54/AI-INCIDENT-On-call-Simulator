/** @type {import('next').NextConfig} */

// ──────────────────────────────────────────────────────────────────────────────
// Content-Security-Policy
//
// Shipped as REPORT-ONLY: the browser EVALUATES this policy and logs anything it
// WOULD block to the console (and to report-to, if configured), but blocks
// NOTHING. This makes it 100% safe to deploy without risk of white-screening the
// app, and lets you verify the policy against the real running site first.
//
// HOW TO TURN IT ON (after verifying the console shows no legit violations):
//   change the header key below from
//     "Content-Security-Policy-Report-Only"  →  "Content-Security-Policy"
//
// NOTE ON 'unsafe-inline' FOR SCRIPTS: this app has no manual inline scripts, but
// Next injects its own inline bootstrap/hydration scripts, and without a per-
// request nonce those require 'unsafe-inline'. This policy therefore reduces the
// BLAST RADIUS of an XSS (no data exfiltration to other origins via connect-src,
// no external script loading, no clickjacking) but does NOT block inline event-
// handler XSS. Fully blocking that needs a nonce-based CSP via middleware (which
// makes pages dynamic) — a deliberate next step, not done here.
//
// 'unsafe-eval' is intentionally omitted; if a dependency needs eval in prod,
// the report-only console will tell you before you enforce.
// ──────────────────────────────────────────────────────────────────────────────
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // ⚠️ Report-Only for now — see the block above to enforce.
          { key: "Content-Security-Policy-Report-Only", value: csp },
          // anti-clickjacking (older browsers; CSP frame-ancestors covers modern)
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
