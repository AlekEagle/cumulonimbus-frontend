import { Ref, watch } from 'vue';

export function wait(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function waitFor<T>(observee: Ref<T>, matchValue: T): Promise<void> {
  return new Promise(resolve => {
    const unwatch = watch(observee, value => {
      if (value === matchValue) {
        unwatch();
        resolve();
      }
    });
  });
}

export function waitUntil<T>(
  observee: Ref<T>,
  predicate: (value: T) => boolean
): Promise<void> {
  return new Promise(resolve => {
    const unwatch = watch(observee, value => {
      if (predicate(value)) {
        unwatch();
        resolve();
      }
    });
  });
}
