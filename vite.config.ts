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
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      manifest: {
        name: 'Cumulonimbus',
        short_name: 'Cumulonimbus',
        start_url: '/dashboard',
        display: 'standalone',
        scope: '/',
        background_color: '#808080',
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
        id: 'cumulonimbus',
      },
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: 'script',
      injectManifest: {
        globPatterns: ['**/*'],
      },
      devOptions: {
        enabled: true,
      },
    }),
    vue(),
    legacy(),
  ],
});
