import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: "src/main.ts",
      name: "TourifyWidget",
      fileName: "tourify-widget",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "tourify-widget.js",
        assetFileNames: "tourify-widget.[ext]",
        inlineDynamicImports: true,
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    copyPublicDir: true,
  },
  server: {
    open: "/test/index.html",
    port: 3000,
  },
  optimizeDeps: {
    include: ["three"],
  },
  publicDir: "public",
  base: "./",
});