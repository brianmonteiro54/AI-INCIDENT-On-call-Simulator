// ──────────────────────────────────────────────────────────────────────────────
// LEADERBOARD NAME SANITIZATION (pure, framework-free → unit-testable)
//
// Used by the /api/submit route to clean a player-supplied display name before
// it ever reaches storage or the leaderboard UI. Strips XSS-prone characters,
// blocks impersonation via whitespace/zero-width tricks, enforces length, and
// reserves the "anon" name.
// ──────────────────────────────────────────────────────────────────────────────

export const NAME_MAX_LEN = 16;
export const NAME_MIN_LEN = 1;

/**
 * Returns a safe display name, or null if the input can't be made into a valid
 * name. Allows letters (incl. accented), digits, space, hyphen, underscore, dot
 * and emoji; strips everything else.
 */
export function sanitizeName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let s = raw.trim();
  if (s.length < NAME_MIN_LEN) return null;
  if (s.length > NAME_MAX_LEN) s = s.slice(0, NAME_MAX_LEN);

  // Remove HTML tag chars, quotes, backticks, control chars, zero-width chars
  s = s.replace(/[<>"'`\u0000-\u001F\u007F\u200B-\u200F\u2028-\u202F\u2060-\u206F]/g, "");
  // Collapse runs of whitespace
  s = s.replace(/\s+/g, " ").trim();

  if (s.length < NAME_MIN_LEN) return null;

  // Reserved name
  if (s.toLowerCase() === "anon") return null;

  return s;
}
