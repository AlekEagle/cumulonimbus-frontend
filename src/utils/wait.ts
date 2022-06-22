import { Ref, watch } from "vue";

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function waitFor<T>(observee: Ref<T>, value: T): Promise<void> {
  return new Promise((resolve) => {
    const unwatch = watch(observee, (value) => {
      if (value === observee.value) {
        unwatch();
        resolve();
      }
    });
  });
}
