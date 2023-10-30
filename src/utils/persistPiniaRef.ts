import { Ref, watch, WatchOptions } from 'vue';

export default function persistPiniaRef<T extends unknown>(
  ref: Ref<T>,
  key: string,
  watchOptions?: WatchOptions,
) {
  if (localStorage.getItem(key)) {
    ref.value = JSON.parse(localStorage.getItem(key) as string);
  }

  watch(
    ref,
    (newVal) => {
      localStorage.setItem(key, JSON.stringify(newVal));
    },
    watchOptions,
  );
}
