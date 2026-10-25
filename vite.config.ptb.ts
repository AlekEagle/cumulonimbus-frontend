import { defineConfig } from 'vite';
import { createConfig } from './vite.config';

// Inherits everything from the production config (./vite.config.ts)
// and overrides only what's different for the production preview.
export default defineConfig(
  createConfig({
    mode: 'ptb',
    sourcemap: true,
    define: {
      __VUE_PROD_DEVTOOLS__: true,
    },
    manifest: {
      name: 'Cumulonimbus Production Preview',
      short_name: 'Cumulonimbus Prod Preview',
      background_color: '#000000',
      id: 'cumulonimbus-prod-preview',
    },
  }),
);
