import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const API_PORT = process.env.PORT ?? "8787";

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@api": resolve("./src/api"),
      "@domain": resolve("./src/domain"),
      "@components": resolve("./src/components"),
      "@hooks": resolve("./src/hooks"),
      "@": resolve("./src"),
    },
  },
  server: {
    proxy: {
      "/api": `http://localhost:${API_PORT}`,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
