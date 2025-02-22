// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler';

// Other Store Modules
import { userStore } from '../user';
import { toastStore } from '../toast';
import { secondFactorChallengerStore } from '../secondFactorChallenger';

// External Modules
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const utilitiesStore = defineStore('staff-space-utilities', () => {
  const user = userStore(),
    router = useRouter(),
    toast = toastStore(),
    secondFactorChallenger = secondFactorChallengerStore(),
    logLevelData = ref<Cumulonimbus.Data.LogLevel | null>(null), // Explicitly named to avoid confusion with any future data properties that may be added.
    loading = ref(false),
    errored = ref(false);

  async function getLogLevel(): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.getLogLevel();
      logLevelData.value = result.result;
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

  async function setLogLevel(
    level: Cumulonimbus.LogLevel,
    password: string,
  ): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.setLogLevel(level, password);
      logLevelData.value = result.result;
      return true;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          errored.value = true;
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          errored.value = true;
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_LOGLEVEL_ERROR':
              toast.show('Invalid log level.');
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
        case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
          const SFR = await secondFactorChallenger.startChallenge(
            error as Cumulonimbus.SecondFactorChallengeRequiredError,
          );

          if (SFR === null) {
            return false;
          }

          try {
            const result = await user.client!.setLogLevel(level, SFR);
            logLevelData.value = result.result;
            return true;
          } catch (error) {
            errored.value = true;
            switch (await defaultErrorHandler(error, router)) {
              case 'OK':
                return false;
              case 'NOT_HANDLED':
              case 'NOT_RESPONSE_ERROR':
              default:
                throw error;
            }
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

  return {
    logLevelData,
    loading,
    errored,
    getLogLevel,
    setLogLevel,
  };
});
