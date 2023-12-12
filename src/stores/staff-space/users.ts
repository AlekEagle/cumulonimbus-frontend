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

export const usersStore = defineStore('staff-space-users', () => {
  const user = userStore();
  const displayPref = displayPrefStore();
  const router = useRouter();
  const loading = ref(false);
  const data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.User> | null>(null);
  const errored = ref(false);
  const page = ref(0);

  async function getUsers(p: number): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getUsers({
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

  async function deleteUsers(users: string[]): Promise<number> {
    if (user.client === null) return -1;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).deleteUsers(users);
      return result.result.count!;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      const reason = await defaultErrorHandler(error, router);
      switch (reason) {
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
    loading,
    data,
    errored,
    page,
    getUsers,
    deleteUsers,
  };
});
