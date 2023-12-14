import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  mode: 'ptb',
  build: {
    sourcemap: true,
  },
  define: {
    __VUE_PROD_DEVTOOLS__: true,
  },

  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      manifest: {
        name: 'Cumulonimbus Production Preview',
        short_name: 'Cumulonimbus Prod Preview',
        start_url: '/dashboard',
        display: 'standalone',
        scope: '/',
        background_color: '#000000',
        screenshots: [
          {
            src: 'https://alekeagle.me/DVAQGiggrG.png',
            form_factor: 'wide',
            sizes: '1920x1080',
          },
          {
            src: 'https://alekeagle.me/jUf_rGepqK.png',
            form_factor: 'narrow',
            sizes: '1080x2260',
          },
        ],
        icons: [
          {
            src: 'icons/72x72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: 'icons/96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: 'icons/128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'icons/144x144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: 'icons/152x152.png',
            sizes: '152x152',
            type: 'image/png',
          },
          {
            src: 'icons/192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icons/512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/maskable.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        description: 'The funny cloud platform.',
        lang: 'en',
        dir: 'ltr',
        orientation: 'portrait-primary',
        // @ts-ignore
        share_target: {
          action: '/dashboard/upload',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            files: [{ name: 'file', accept: ['*/*', '.*'] }],
          },
        },
        theme_color: '#808080',
        id: 'cumulonimbus-prod-preview',
      },
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: 'script',
      injectManifest: {
        globPatterns: ['**/*'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
    vue(),
    legacy(),
  ],
});
