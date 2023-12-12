// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler';

// Other Store Modules
import { displayPrefStore } from '../displayPref';
import { toastStore } from '../toast';
import { userStore } from '../user';

// External Modules
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Store Definition
export const instructionsStore = defineStore('user-space-instructions', () => {
  const user = userStore();
  const displayPref = displayPrefStore();
  const toast = toastStore();
  const router = useRouter();
  const loading = ref(false);
  const data =
    ref<Cumulonimbus.Data.List<Cumulonimbus.Data.Instruction> | null>(null);
  const errored = ref(false);
  const page = ref(0);

  async function getInstructions(p: number): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getInstructions({
        limit: displayPref.itemsPerPage,
        offset: displayPref.itemsPerPage * p,
      });
      page.value = p;
      data.value = result.result;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      const reason = await defaultErrorHandler(error, router);
      switch (reason) {
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
    loading,
    data,
    errored,
    page,
    getInstructions,
  };
});
