import { defineConfig } from 'vite';
import { createConfig } from './vite.config';

// Inherits everything from the production config (./vite.config.ts)
// and overrides only what's different for development.
export default defineConfig(
  createConfig({
    mode: 'development',
    sourcemap: true,
    define: {
      __VUE_PROD_DEVTOOLS__: true,
      __THUMBNAIL_BASE_URL__: JSON.stringify('http://localhost:8100'),
      __CDN_BASE_URL__: JSON.stringify('http://localhost:8200'),
      __API_BASE_URL__: JSON.stringify('http://localhost:8000/api'),
      __APP_BASE_URL__: JSON.stringify('http://localhost:5173'),
    },
    manifest: {
      name: 'Cumulonimbus Development',
      short_name: 'Cumulonimbus Dev',
      background_color: '#000000',
      id: 'cumulonimbus-development',
    },
  }),
);
