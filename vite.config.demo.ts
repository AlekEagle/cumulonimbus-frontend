import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { createConfig } from './vite.config';

// Inherits everything from the production config (./vite.config.ts) and
// overrides only what's needed to build a self-contained single HTML file.
export default defineConfig(
  createConfig({
    mode: 'development',
    sourcemap: true,
    outDir: 'demo-dist',
    define: {
      __VUE_PROD_DEVTOOLS__: true,
    },
    manifest: {
      name: 'Cumulonimbus Demo',
      short_name: 'Cumulonimbus Demo',
      background_color: '#000000',
      id: 'cumulonimbus-demo',
    },
    pwa: {
      injectManifest: {
        // Single-file build inlines all JS/CSS into index.html, which can
        // exceed workbox's 2MB precache default — raise the cap.
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
      },
    },
    extraPlugins: [viteSingleFile()],
  }),
);
