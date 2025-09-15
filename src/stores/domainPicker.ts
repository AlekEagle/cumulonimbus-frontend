// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler.js';

// Other Store Modules
import { userStore } from './user.js';

// External Modules
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Store Definition
export const domainPickerStore = defineStore('domainPicker', () => {
  const user = userStore();
  const router = useRouter();
  const loading = ref(false);
  const domains = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.Domain> | null>(
    null,
  );

  async function sync(): Promise<boolean> {
    if (user.client === null) return false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getDomains({
        limit: 'all',
      });
      domains.value = result.result;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
        // No special cases to handle here.
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
    return true;
  }

  return {
    domains,
    loading,
    sync,
  };
});
