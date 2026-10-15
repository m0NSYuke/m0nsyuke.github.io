import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Preload the two webfonts the first screen needs (body text and the wordmark).
const PRELOAD = [/inter-latin-400-normal-[\w-]+\.woff2$/, /barlow-condensed-latin-700-normal-[\w-]+\.woff2$/];
function preloadFonts() {
  return {
    name: "preload-fonts",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const base = process.env.BASE_PATH || "/";
        const files = Object.keys(ctx.bundle).filter((file) => PRELOAD.some((pattern) => pattern.test(file)));
        return {
          html,
          tags: files.map((file) => ({ tag: "link", attrs: { rel: "preload", href: base + file, as: "font", type: "font/woff2", crossorigin: "" }, injectTo: "head-prepend" })),
        };
      },
    },
  };
}

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  build: {
    outDir: "dist/client",
    // Fontsource ships .woff fallbacks too; every supported browser takes woff2.
    assetsInlineLimit: 0,
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    proxy: { '/api': 'http://127.0.0.1:8787' },
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(), preloadFonts()],
});
