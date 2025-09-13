// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler.js';

// Other Store Modules
import { userStore } from '../user.js';
import { toastStore } from '../toast.js';
import { displayPrefStore } from '../displayPref.js';
import { secondFactorChallengerStore } from '../secondFactorChallenger.js';

// External Modules
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Store Definition
export const sessionsStore = defineStore('user-space-sessions', () => {
  const user = userStore();
  const toast = toastStore();
  const displayPref = displayPrefStore();
  const secondFactorChallenger = secondFactorChallengerStore();
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
      const result = await (user.client as Cumulonimbus).getSelfSessions({
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

  async function deleteSession(session: string): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      await user.client.deleteSelfSession(session);
      return true;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (
        await defaultErrorHandler(error, router, ['INVALID_SESSION_ERROR'])
      ) {
        case 'OK':
          // If the error was handled, return false.
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

  async function deleteSessions(sessions: string[]): Promise<number> {
    if (user.client === null) return -1;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client.deleteSelfSessions(sessions);
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

  async function createScopedSession(
    name: string,
    permissionFlags: Cumulonimbus.PermissionFlags,
    password: string,
    longLived: boolean = false,
  ): Promise<string | null> {
    if (user.client === null) return null;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client.createScopedSession(
        name,
        permissionFlags,
        password,
        longLived,
      );
      return result.result.token;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return null.
          return null;
        case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
          const SFR = await secondFactorChallenger.startChallenge(
            error as Cumulonimbus.SecondFactorChallengeRequiredError,
          );

          if (SFR === null) {
            return null;
          }

          const result = await user.client.createScopedSession(
            name,
            permissionFlags,
            SFR,
            longLived,
          );
          return result.result.token;
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
    createScopedSession,
    clear,
  };
});
