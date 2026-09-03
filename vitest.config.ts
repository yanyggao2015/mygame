import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // See vitest.stubs/server-only.ts for why this is aliased in tests.
      "server-only": path.resolve(__dirname, "vitest.stubs/server-only.ts"),
    },
  },
});
