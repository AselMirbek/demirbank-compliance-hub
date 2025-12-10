import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/demirbank-compliance-hub/", // <-- ОБЯЗАТЕЛЬНО для GitHub Pages

  server: {
    host: "::",
    port: 8080,
  },

  build: {
    outDir: "docs", // GitHub Pages будет использовать docs/
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
