import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'TourWidget',
      fileName: 'tour-widget',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        entryFileNames: 'tour-widget.js',
        assetFileNames: 'tour-widget.[ext]'
      }
    }
  },
  server: {
    open: '/test/index.html'
  }
});