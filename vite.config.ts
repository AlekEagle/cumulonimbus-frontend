import {
  defineConfig,
  type BuildOptions,
  type PluginOption,
  type UserConfig,
} from 'vite';
import {
  VitePWA,
  type ManifestOptions,
  type VitePWAOptions,
} from 'vite-plugin-pwa';
import vue from '@vitejs/plugin-vue';

// Production is the single source of truth. The other environments
// (vite.config.development.ts, vite.config.ptb.ts) call `createConfig`
// with only the parts they need to change.

// PWA options identical across every environment.
const pwaOptions: Partial<VitePWAOptions> = {
  strategies: 'injectManifest',
  // The ['**/*'] glob below already captures the manifest icons from publicDir,
  // so skip the plugin's automatic icon injection — otherwise each icon is
  // listed twice in the precache manifest (once via glob, once here).
  includeManifestIcons: false,
  injectManifest: {
    globPatterns: ['**/*'],
    // The glob also picks up manifest.webmanifest, which the plugin injects on
    // its own (with an MD5 revision) — ignore it from the glob so it's listed
    // only once.
    globIgnores: ['manifest.webmanifest'],
    // vite-plugin-pwa defaults dontCacheBustURLsMatching to /^<assetsDir>\//,
    // which strips the content-hash revision from every Vite-hashed asset
    // (assets/*) — and viteSingleFile sets build.assetsDir="", widening it to
    // /^/ so it strips revisions from *everything*. Match nothing so every
    // precache entry keeps its content-hash revision.
    dontCacheBustURLsMatching: /$^/,
  },
  srcDir: 'src',
  filename: 'sw.ts',
  injectRegister: 'script',
  devOptions: {
    enabled: true,
    type: 'module',
  },
};

// Full production manifest; every env inherits this and overrides what differs.
// Kept as a plain object on purpose: `tab_strip` and `display_override: ['tabbed']`
// are ChromeOS-specific fields the PWA manifest type doesn't model, so the type
// escape is handled once at the `VitePWA(...)` call instead of per-line suppressions.
const baseManifest = {
  name: 'Cumulonimbus',
  short_name: 'Cumulonimbus',
  start_url: '/dashboard',
  display: 'standalone',
  display_override: ['tabbed'],
  tab_strip: {
    home_tab: {
      url: '/dashboard',
      icons: [
        { src: 'icons/72x72.png', sizes: '72x72', type: 'image/png' },
        { src: 'icons/96x96.png', sizes: '96x96', type: 'image/png' },
        { src: 'icons/128x128.png', sizes: '128x128', type: 'image/png' },
        { src: 'icons/144x144.png', sizes: '144x144', type: 'image/png' },
        { src: 'icons/152x152.png', sizes: '152x152', type: 'image/png' },
        { src: 'icons/192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icons/384x384.png', sizes: '384x384', type: 'image/png' },
        { src: 'icons/512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      new_tab_button: 'absent',
    },
  },
  scope: '/',
  background_color: '#808080',
  screenshots: [
    {
      src: 'https://cdn.alekeagle.me/DVAQGiggrG.png',
      form_factor: 'wide',
      sizes: '1920x1080',
    },
    {
      src: 'https://cdn.alekeagle.me/jUf_rGepqK.png',
      form_factor: 'narrow',
      sizes: '1080x2260',
    },
  ],
  icons: [
    { src: 'icons/72x72.png', sizes: '72x72', type: 'image/png' },
    { src: 'icons/96x96.png', sizes: '96x96', type: 'image/png' },
    { src: 'icons/128x128.png', sizes: '128x128', type: 'image/png' },
    { src: 'icons/144x144.png', sizes: '144x144', type: 'image/png' },
    { src: 'icons/152x152.png', sizes: '152x152', type: 'image/png' },
    { src: 'icons/192x192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icons/384x384.png', sizes: '384x384', type: 'image/png' },
    { src: 'icons/512x512.png', sizes: '512x512', type: 'image/png' },
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
};

// Production compile-time definitions; every env inherits these and overrides what differs.
const baseDefine: Record<string, string> = {
  __THUMBNAIL_BASE_URL__: JSON.stringify('https://previews.alekeagle.me'),
  __CDN_BASE_URL__: JSON.stringify('https://cdn.alekeagle.me'),
  __API_BASE_URL__: JSON.stringify('https://alekeagle.me/api'),
  __APP_BASE_URL__: JSON.stringify('https://alekeagle.me'),
};

export interface EnvOverrides {
  mode?: string;
  sourcemap?: boolean;
  outDir?: string;
  define?: Record<string, string | number | boolean>;
  manifest?: Record<string, unknown>;
  pwa?: Partial<VitePWAOptions>;
  extraPlugins?: PluginOption[];
}

// Builds a complete config on top of the production baseline. Plugin
// instances are created here so they are never duplicated across envs.
export function createConfig(overrides: EnvOverrides = {}): UserConfig {
  const define = { ...baseDefine, ...overrides.define };
  const build: BuildOptions = {};
  if (overrides.sourcemap !== undefined) build.sourcemap = overrides.sourcemap;
  if (overrides.outDir !== undefined) build.outDir = overrides.outDir;
  return {
    ...(overrides.mode ? { mode: overrides.mode } : {}),
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    ...(Object.keys(build).length ? { build } : {}),
    define,
    plugins: [
      VitePWA({
        ...pwaOptions,
        ...overrides.pwa,
        // Nested PWA options are deep-merged so an override can add a key
        // without dropping the base's other keys.
        injectManifest: {
          ...pwaOptions.injectManifest,
          ...overrides.pwa?.injectManifest,
        },
        devOptions: {
          ...pwaOptions.devOptions,
          ...overrides.pwa?.devOptions,
        },
        // `tab_strip`/`display_override` aren't in the manifest type (see baseManifest).
        manifest: {
          ...baseManifest,
          ...overrides.manifest,
        } as unknown as Partial<ManifestOptions>,
      }),
      vue(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          // `define` values are JSON.stringify'd — required for Vite's JS `define`
          // so a bare `__APP_BASE_URL__` in the TS compiles to a quoted string.
          // But in index.html the placeholder already sits inside its own quotes
          // (e.g. the Discord embed JSON's "__APP_BASE_URL__/dashboard"), so insert
          // the raw, unquoted value — otherwise the quotes double up and corrupt it.
          Object.entries(define).forEach(([key, value]) => {
            const raw = JSON.parse(value as string);
            html = html.replace(new RegExp(key, 'g'), () => String(raw));
          });
          return html;
        },
      },
      // Extra plugins for this env (e.g. viteSingleFile), appended after the shared ones.
      ...(overrides.extraPlugins ?? []),
    ],
  };
}

export default defineConfig(createConfig());
