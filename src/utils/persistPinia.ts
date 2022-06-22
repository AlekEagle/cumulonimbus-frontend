import { Ref, watch, WatchOptions } from "vue";

export default function persistPiniaStore(
  value: Ref<any>,
  key: string,
  watchOptions?: WatchOptions
) {
  if (localStorage.getItem(key)) {
    value.value = JSON.parse(localStorage.getItem(key) as string);
  }

  watch(
    value,
    (newVal) => {
      localStorage.setItem(key, JSON.stringify(newVal));
    },
    watchOptions
  );
}
