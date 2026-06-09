/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module "*.svg" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

interface ImportMeta {
  glob(pattern: string, options: { eager: true }): Record<string, unknown>;
}
