import { inject, Plugin, ref } from 'vue';

export const ConnectivityCheckPlugin: Plugin = {
  install(app) {
    const isOnline = ref(true);
    app.provide('isOnline', isOnline);
    window.navigator.serviceWorker?.controller?.postMessage({
      type: 'checkOnline',
    });

    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data.type === 'isOnline') {
        isOnline.value = event.data.payload;
      }
    });
  },
};

export const useOnline = () => {
  return inject('isOnline') as ReturnType<typeof ref>;
};
