import { userStore } from '../user';
import { displayPrefStore } from '../displayPref';
import defaultErrorHandler from '@/utils/defaultErrorHandler';

import { defineStore } from 'pinia';
import { ref } from 'vue';
import Cumulonimbus from 'cumulonimbus-wrapper';
import { useRouter } from 'vue-router';

export const sessionsStore = defineStore('user-space-sessions', () => {
  const user = userStore();
  const displayPref = displayPrefStore();
  const router = useRouter();
  const loading = ref(false);
  const data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.Session> | null>(
    null,
  );
  const errored = ref(false);
  const page = ref(0);

  async function getSessions(p: number): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getSessions({
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

  async function deleteSession(session: string): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      await (user.client as Cumulonimbus).deleteSession(session);
      return true;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      const reason = await defaultErrorHandler(error, router);
      switch (reason) {
        case 'OK':
          // If the error was handled, return false.
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

  async function deleteSessions(sessions: string[]): Promise<number> {
    if (user.client === null) return -1;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).deleteSessions(
        sessions,
      );
      return result.result.count!;
    } catch (error) {
      errored.value = true;
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
    getSessions,
    deleteSession,
    deleteSessions,
    clear,
  };
});
