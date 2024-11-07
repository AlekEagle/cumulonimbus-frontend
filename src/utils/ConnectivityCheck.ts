import { inject, Plugin, ref } from 'vue';

export const ConnectivityCheckPlugin: Plugin = {
  install(app) {
    const isOnline = ref(true);
    app.provide('isOnline', isOnline);
    window.navigator.serviceWorker?.controller?.postMessage({
      type: 'checkOnline',
    });

    function informAboutOnlineStatus(status: boolean) {
      window.navigator.serviceWorker?.controller?.postMessage({
        type: 'onlineChange',
        payload: status,
      });
    }

    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data.type === 'isOnline') {
        isOnline.value = event.data.payload;
      }
    });

    // Since the service worker's 'online' event is not reliable, we use the navigator's 'online' event and forward it to the service worker.
    window.addEventListener('online', () => {
      informAboutOnlineStatus(true);
    });
    window.addEventListener('offline', () => {
      informAboutOnlineStatus(false);
    });
  },
};

export const useOnline = () => {
  return inject('isOnline') as ReturnType<typeof ref>;
};
