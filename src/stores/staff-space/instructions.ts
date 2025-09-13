// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler.js';

// Other Store Modules
import { userStore } from '../user.js';
import { displayPrefStore } from '../displayPref.js';
import { toastStore } from '../toast.js';

// External Modules
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const instructionsStore = defineStore('staff-space-instructions', () => {
  const user = userStore(),
    displayPref = displayPrefStore(),
    router = useRouter(),
    toast = toastStore(),
    data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.Instruction> | null>(
      null,
    ),
    loading = ref(false),
    errored = ref(false),
    page = ref(0);

  async function getInstructions(p: number): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.getInstructions({
        limit: displayPref.itemsPerPage,
        offset: p * displayPref.itemsPerPage,
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

  async function deleteInstructions(ids: string[]): Promise<number> {
    if (user.client === null) return -1;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.deleteInstructions(ids);
      return result.result.count!;
    } catch (error) {
      errored.value = true;
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

  async function createInstruction(
    name: string,
    description: string,
  ): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      await user.client!.createInstruction({
        id: name.toLowerCase().replace(/\s/g, '-'),
        name,
        description,
        steps: [],
        content: '{{token}}',
      });
      toast.show('Instruction created.');
      return true;
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
  }

  return {
    data,
    loading,
    errored,
    page,
    getInstructions,
    deleteInstructions,
    createInstruction,
  };
});
