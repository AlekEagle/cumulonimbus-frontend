// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler';

// Other Store Modules
import { userStore } from '../user';
import { displayPrefStore } from '../displayPref';

// External Modules
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const filesStore = defineStore('staff-space-files', () => {
  const user = userStore();
  const router = useRouter();
  const displayPref = displayPrefStore();
  const loading = ref(false);
  const data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.File> | null>(null);
  const errored = ref(false);
  const page = ref(0);
  const selectedUser = ref<Cumulonimbus.Data.User | null>(null);

  async function getFiles(p: number): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      let result;
      if (selectedUser.value !== null)
        result = await (user.client as Cumulonimbus).getUserFiles(
          selectedUser.value.id,
          {
            limit: displayPref.itemsPerPage,
            offset: displayPref.itemsPerPage * p,
          },
        );
      else
        result = await (user.client as Cumulonimbus).getAllFiles({
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
      let result;

      // Use the appropriate method based on whether a user is selected.
      if (selectedUser.value == null)
        result = await (user.client as Cumulonimbus).deleteArbitraryFiles(
          files,
        );
      else
        result = await (user.client as Cumulonimbus).deleteUserFiles(
          selectedUser.value.id,
          files,
        );

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

  return {
    data,
    loading,
    errored,
    page,
    selectedUser,
    getFiles,
    deleteFiles,
  };
});
