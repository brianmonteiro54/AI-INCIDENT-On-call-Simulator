import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Tests target pure, framework-free logic (ranking, anti-cheat sanitization),
// so the default Node environment is enough — no jsdom/browser needed.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // mirror the "@/*" → project root alias from tsconfig.json
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
