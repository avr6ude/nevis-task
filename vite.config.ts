import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
      "@": resolve("./src"),
    },
  },
  server: {
    proxy: {
      "/api": `http://localhost:${API_PORT}`,
    },
  },
});
