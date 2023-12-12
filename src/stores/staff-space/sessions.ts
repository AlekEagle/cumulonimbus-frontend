// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler';

// Other Store Modules
import { displayPrefStore } from '../displayPref';
import { userStore } from '../user';
import { toastStore } from '../toast';

// External Modules
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const sessionsStore = defineStore('staff-space-sessions', () => {
  const user = userStore(),
    displayPref = displayPrefStore(),
    router = useRouter(),
    toast = toastStore(),
    data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.Session> | null>(null),
    loading = ref(false),
    errored = ref(false),
    sessionOwner = ref<Cumulonimbus.Data.User | null>(null),
    page = ref(0);

  async function getSessions(p: number): Promise<boolean> {
    if (user.client === null) return false;
    if (sessionOwner.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.getSessions({
        user: sessionOwner.value.id,
        limit: displayPref.itemsPerPage,
        offset: p * displayPref.itemsPerPage,
      });
      page.value = p;
      data.value = result.result;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (
        await defaultErrorHandler(error, router, ['INVALID_SESSION_ERROR'])
      ) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            // If the session the user is trying to delete is invalid.
            case 'INVALID_SESSION_ERROR':
              // Display the invalid session message.
              toast.show("That session doesn't exist.");
              return false;
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

  async function deleteSession(id: string): Promise<boolean> {
    if (user.client === null) return false;
    if (sessionOwner.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      await user.client!.deleteSession({
        session: id,
        user: sessionOwner.value.id,
      });
      return true;
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
            // If the session the user is trying to delete is invalid.
            case 'INVALID_SESSION_ERROR':
              // Display the invalid session message.
              toast.show("That session doesn't exist.");
              return false;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function deleteSessions(ids: string[]): Promise<number> {
    if (user.client === null) return -1;
    if (sessionOwner.value === null) return -1;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.deleteSessions(
        ids,
        sessionOwner.value.id,
      );
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

  return {
    data,
    loading,
    errored,
    sessionOwner,
    page,
    getSessions,
    deleteSession,
    deleteSessions,
  };
});
