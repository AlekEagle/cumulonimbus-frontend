// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler';

// Other Store Modules
import { toastStore } from '../toast';
import { userStore } from '../user';

// External Modules
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Store Definition
export const instructionStore = defineStore('user-space-instruction', () => {
  const user = userStore();
  const loading = ref(false);
  const router = useRouter();
  const toast = toastStore();
  const data = ref<Cumulonimbus.Data.Instruction | null>(null);
  const errored = ref(false);

  async function getInstruction(id: string): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getInstruction(id);
      data.value = result.result;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_INSTRUCTION_ERROR':
              toast.show('This setup guide does not exist.');
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
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
    getInstruction,
  };
});
