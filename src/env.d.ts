/// <reference types="vite/client" />

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
