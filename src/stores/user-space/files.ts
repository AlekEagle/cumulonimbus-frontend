// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler';

// Other Store Modules
import { displayPrefStore } from '../displayPref';
import { userStore } from '../user';

// External Modules
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Store Definition
export const filesStore = defineStore('user-space-files', () => {
  const user = userStore();
  const displayPref = displayPrefStore();
  const router = useRouter();
  const loading = ref(false);
  const data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.File> | null>(null);
  const errored = ref(false);
  const page = ref(0);
  const selected = ref<string[]>([]);

  async function getFiles(p: number): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getSelfFiles({
        limit: displayPref.itemsPerPage,
        offset: displayPref.itemsPerPage * p,
      });
      page.value = p;
      data.value = result.result;
    } catch (error) {
      errored.value = true;
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

  async function deleteFiles(files: string[]): Promise<number> {
    if (user.client === null) return -1;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).deleteSelfFiles(files);
      return result.result.count!;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return -1;
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
  }

  async function clear(): Promise<void> {
    data.value = null;
    page.value = 0;
    loading.value = false;
    errored.value = false;
  }

  return {
    data,
    loading,
    errored,
    page,
    getFiles,
    deleteFiles,
    clear,
  };
});
