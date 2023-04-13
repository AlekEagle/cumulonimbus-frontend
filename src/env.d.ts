/// <reference types="vite/client" />

export {};

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "vue" {
  interface ComponentCustomProperties {
    $version: string;
    $dependencies: Record<string, string>;
    $devDependencies: Record<string, string>;
  }
}
