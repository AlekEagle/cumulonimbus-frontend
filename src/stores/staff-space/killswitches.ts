// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler';

// Other Store Modules
import { userStore } from '../user';
import { secondFactorChallengerStore } from '../secondFactorChallenger';

// External Modules
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';

// Store Definition
export const killSwitchesStore = defineStore(
  'staff-space-kill-switches',
  () => {
    const user = userStore(),
      router = useRouter(),
      secondFactorChallenger = secondFactorChallengerStore(),
      data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.KillSwitch> | null>(
        null,
      ),
      loading = ref(false),
      errored = ref(false);

    async function getKillSwitches(): Promise<boolean> {
      if (user.client === null) return false;
      loading.value = true;
      errored.value = false;
      try {
        data.value = (await user.client.getKillSwitches()).result;
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

    async function enableKillSwitch(
      id: number,
      password: string,
    ): Promise<boolean> {
      if (user.client === null) return false;
      loading.value = true;
      try {
        data.value = (await user.client.enableKillSwitch(id, password)).result;
        return true;
      } catch (error) {
        // Pass our error to the default error handler and check if it was handled.
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            errored.value = true;
            // If the error was handled, return true to signify success.
            return false;
          case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
            const SFR = await secondFactorChallenger.startChallenge(
              error as Cumulonimbus.SecondFactorChallengeRequiredError,
            );

            if (SFR === null) {
              return false;
            }

            try {
              data.value = (await user.client.enableKillSwitch(id, SFR)).result;
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

    async function disableKillSwitch(
      id: number,
      password: string,
    ): Promise<boolean> {
      if (user.client === null) return false;
      loading.value = true;
      try {
        data.value = (await user.client.disableKillSwitch(id, password)).result;
        return true;
      } catch (error) {
        // Pass our error to the default error handler and check if it was handled.
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            errored.value = true;
            // If the error was handled, return true to signify success.
            return false;
          case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
            const SFR = await secondFactorChallenger.startChallenge(
              error as Cumulonimbus.SecondFactorChallengeRequiredError,
            );

            if (SFR === null) {
              return false;
            }

            try {
              data.value = (
                await user.client.disableKillSwitch(id, SFR)
              ).result;
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

    async function disableAllKillSwitches(password: string): Promise<boolean> {
      if (user.client === null) return false;
      loading.value = true;
      try {
        data.value = (
          await user.client.disableAllKillSwitches(password)
        ).result;
        return true;
      } catch (error) {
        // Pass our error to the default error handler and check if it was handled.
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            errored.value = true;
            // If the error was handled, return true to signify success.
            return false;
          case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
            const SFR = await secondFactorChallenger.startChallenge(
              error as Cumulonimbus.SecondFactorChallengeRequiredError,
            );

            if (SFR === null) {
              return false;
            }

            try {
              data.value = (
                await user.client.disableAllKillSwitches(SFR)
              ).result;
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
      data,
      loading,
      errored,
      getKillSwitches,
      enableKillSwitch,
      disableKillSwitch,
      disableAllKillSwitches,
    };
  },
);
