import { inject, Plugin, ref } from 'vue';

const checkInterval = 60e3,
  checkTarget = 'https://connectivitycheck.alekeagle.com',
  checkTargetResponseStatus = 204;

export const ConnectivityCheckPlugin: Plugin = {
  install(app) {
    let isOnlineInterval: ReturnType<typeof setInterval> | null = null;
    // Initialize the isOnline ref with the current navigator status
    const isOnline = ref(navigator.onLine);

    app.provide('isOnline', isOnline);

    async function makeConnectionCheck() {
      try {
        const response = await fetch(checkTarget, { method: 'HEAD' });
        isOnline.value = response.status === checkTargetResponseStatus;
      } catch (error) {
        isOnline.value = false;
      }
    }

    async function runConnectionCheck() {
      // Clear the interval if it exists.
      if (isOnlineInterval) {
        clearInterval(isOnlineInterval);
        isOnlineInterval = null;
      }
      // Make a connection check immediately.
      await makeConnectionCheck();
      // Set the interval back up to check every x seconds.
      isOnlineInterval = setInterval(makeConnectionCheck, checkInterval);
    }

    window.addEventListener('online', runConnectionCheck);
    window.addEventListener('offline', runConnectionCheck);

    // Start the connection check interval.
    runConnectionCheck();
  },
};

export const useOnline = () => {
  return inject('isOnline') as ReturnType<typeof ref>;
};
