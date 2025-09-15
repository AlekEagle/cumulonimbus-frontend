// In-House Modules
import { useFuzzyTimeString } from '@/utils/time.js';
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler.js';

// Other Store Modules
import { displayPrefStore } from '../displayPref.js';
import { userStore } from '../user.js';
import { toastStore } from '../toast.js';

// External Modules
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export const sessionsStore = defineStore('staff-space-sessions', () => {
  const user = userStore(),
    displayPref = displayPrefStore(),
    router = useRouter(),
    toast = toastStore(),
    data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.Session> | null>(null),
    selectedSession = ref<Cumulonimbus.Data.Session | null>(null),
    selectedSessionFuzzyUsedAt = computed(() =>
      selectedSession.value?.usedAt
        ? useFuzzyTimeString(ref(new Date(selectedSession.value.usedAt))).value
        : 'Not yet...',
    ),
    loading = ref(false),
    errored = ref(false),
    owner = ref<Cumulonimbus.Data.User | null>(null),
    page = ref(0);

  async function getSessions(p: number): Promise<boolean> {
    if (user.client === null) return false;
    if (owner.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.getUserSessions(owner.value.id, {
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
          // If the error was handled, return false to signify that the error was successfully handled, but the overall request failed.
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

  async function getSession(id: string): Promise<boolean> {
    if (user.client === null) return false;
    if (owner.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.getUserSession(owner.value.id, id);
      selectedSession.value = result.result;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (
        await defaultErrorHandler(error, router, ['INVALID_SESSION_ERROR'])
      ) {
        case 'OK':
          // If the error was handled, return false to signify that the error was successfully handled, but the overall request failed.
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
    if (owner.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      await user.client!.deleteUserSession(owner.value.id, id);
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
    if (owner.value === null) return -1;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.deleteUserSessions(owner.value.id, ids);
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
    selectedSession,
    selectedSessionFuzzyUsedAt,
    loading,
    errored,
    owner,
    page,
    getSessions,
    getSession,
    deleteSession,
    deleteSessions,
  };
});
