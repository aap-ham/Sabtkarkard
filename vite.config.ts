// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // تغییر کلیدی: @vitejs/plugin-react جایگزین @vitejs/plugin-react-swc شد
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

