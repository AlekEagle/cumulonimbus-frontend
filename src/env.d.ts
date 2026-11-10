/// <reference types="vite/client" />

import 'vue-router';

export {};

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $version: string;
    $dependencies: { [key: string]: string };
    $devDependencies: { [key: string]: string };
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresStaff?: boolean;
    noClouds?: boolean;
    header?: {
      title: string;
      subtitle?: string;
    };
  }
}

declare global {
  const __THUMBNAIL_BASE_URL__: string;
  const __CDN_BASE_URL__: string;
  const __API_BASE_URL__: string;
}
