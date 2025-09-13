// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler.js';

// Other Store Modules
import { userStore } from '../user.js';
import { displayPrefStore } from '../displayPref.js';
import { secondFactorChallengerStore } from '../secondFactorChallenger.js';

// External Modules
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const usersStore = defineStore('staff-space-users', () => {
  const user = userStore();
  const displayPref = displayPrefStore();
  const secondFactorChallenger = secondFactorChallengerStore();
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

  async function deleteUsers(
    users: string[],
    password: string,
  ): Promise<number> {
    if (user.client === null) return -1;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.deleteUsers(users, password);
      return result.result.count;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      const reason = await defaultErrorHandler(error, router);
      switch (reason) {
        case 'OK':
          errored.value = true;
          // If the error was handled, return true to signify success.
          return -1;
        case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
          const SFR = await secondFactorChallenger.startChallenge(
            error as Cumulonimbus.SecondFactorChallengeRequiredError,
          );

          if (SFR === null) {
            return -1;
          }

          try {
            const result = await user.client!.deleteUsers(users, SFR);
            return result.result.count;
          } catch (error) {
            // Pass our error to the default error handler and check if it was handled.
            const reason = await defaultErrorHandler(error, router);
            switch (reason) {
              case 'OK':
                errored.value = true;
                // If the error was handled, return true to signify success.
                return -1;
              case 'NOT_HANDLED':
              // No special cases to handle here.
              case 'NOT_RESPONSE_ERROR':
              default:
                // If the error wasn't handled, throw it.
                throw error;
            }
          }
        case 'NOT_HANDLED':
        // No special cases to handle here.
        case 'NOT_RESPONSE_ERROR':
        default:
          errored.value = true;
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
