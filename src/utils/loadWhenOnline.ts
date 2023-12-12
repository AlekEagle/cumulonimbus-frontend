import { useOnline } from '@vueuse/core';
import { watch } from 'vue';

// This function takes a callback and conditions for when to call the callback.
// It will call the callback when the conditions are met and the online state changes to true.
// It will also call the callback immediately if the conditions are met and the online state is already true.
// It returns a function that can be called to cancel the callback.
export default function loadWhenOnline(
  callback: () => void,
  ...conditions: boolean[]
): (() => void) | void {
  const online = useOnline();
  if (online.value && conditions.every((condition) => condition)) {
    callback();
    return;
  }
  const cancel = watch(
    online,
    (online) => {
      if (online && conditions.every((condition) => condition)) {
        callback();
        cancel();
      }
    },
    { immediate: true },
  );
  return cancel;
}
