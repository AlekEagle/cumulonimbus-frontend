// In-House Modules
import { useFuzzyTimeString } from '@/utils/time';
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler';

// Other Store Modules
import { displayPrefStore } from '../displayPref';
import { userStore } from '../user';
import { toastStore } from '../toast';
import { secondFactorChallengerStore } from '../secondFactorChallenger';

// External Modules
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export const secondFactorsStore = defineStore(
  'staff-space-second-factors',
  () => {
    const user = userStore(),
      displayPref = displayPrefStore(),
      router = useRouter(),
      toast = toastStore(),
      secondFactorChallenger = secondFactorChallengerStore(),
      data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.SecondFactor> | null>(
        null,
      ),
      selectedSecondFactor = ref<Cumulonimbus.Data.SecondFactor | null>(null),
      selectedFactorFuzzyLastUsedAt = computed(() =>
        selectedSecondFactor.value?.usedAt
          ? useFuzzyTimeString(ref(new Date(selectedSecondFactor.value.usedAt)))
          : 'Not yet...',
      ),
      loading = ref(false),
      errored = ref(false),
      owner = ref<Cumulonimbus.Data.User | null>(null),
      page = ref(0);

    async function getSecondFactors(p: number): Promise<boolean> {
      if (user.client === null) return false;
      if (owner.value === null) return false;
      errored.value = false;
      loading.value = true;
      try {
        const result = await user.client!.getUserSecondFactors(owner.value.id, {
          limit: displayPref.itemsPerPage,
          offset: p * displayPref.itemsPerPage,
        });
        page.value = p;
        data.value = result.result;
        return true;
      } catch (error) {
        errored.value = true;
        // Pass our error to the default error handler and check if it was handled.
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            // If the error was handled, return false to signify that the error was successfully handled, but the overall request failed.
            return false;
          case 'NOT_HANDLED':
          case 'NOT_RESPONSE_ERROR':
          default:
            // If the error wasn't handled, throw it.
            throw error;
        }
      } finally {
        loading.value = false;
      }
    }

    async function getSecondFactor(id: string): Promise<boolean> {
      if (user.client === null) return false;
      if (owner.value === null) return false;
      errored.value = false;
      loading.value = true;
      try {
        const result = await user.client!.getUserSecondFactor(
          owner.value.id,
          id,
        );
        selectedSecondFactor.value = result.result;
        return true;
      } catch (error) {
        errored.value = true;
        // Pass our error to the default error handler and check if it was handled.
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            // If the error was handled, return false to signify that the error was successfully handled, but the overall request failed.
            return false;
          case 'NOT_HANDLED':
          case 'NOT_RESPONSE_ERROR':
          default:
            // If the error wasn't handled, throw it.
            throw error;
        }
      } finally {
        loading.value = false;
      }
    }

    async function deleteSecondFactor(
      id: string,
      password: string,
    ): Promise<boolean> {
      if (user.client === null) return false;
      if (owner.value === null) return false;
      errored.value = false;
      loading.value = true;
      try {
        await user.client!.deleteUserSecondFactor(owner.value.id, id, password);
        // Technically, we will never reach this point, but it's here just in case the API doesn't require a challenge.
        await getSecondFactors(page.value);
        return true;
      } catch (error) {
        // Pass our error to the default error handler and check if it was handled.
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            errored.value = true;
            // If the error was handled, return false to signify that the error was successfully handled, but the overall request failed.
            return false;
          case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
            const SFR = await secondFactorChallenger.startChallenge(
              error as Cumulonimbus.SecondFactorChallengeRequiredError,
            );

            if (SFR === null) {
              return false;
            }
            try {
              await user.client!.deleteUserSecondFactor(
                owner.value.id,
                id,
                SFR,
              );
              await getSecondFactors(page.value);
              return true;
            } catch (error) {
              errored.value = true;
              // Pass our error to the default error handler and check if it was handled.
              switch (await defaultErrorHandler(error, router)) {
                case 'OK':
                  // If the error was handled, return false to signify that the error was successfully handled, but the overall request failed.
                  return false;
                case 'NOT_HANDLED':
                case 'NOT_RESPONSE_ERROR':
                default:
                  // If the error wasn't handled, throw it.
                  throw error;
              }
            }
          case 'NOT_HANDLED':
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

    async function deleteSecondFactors(
      ids: string[],
      password: string,
    ): Promise<number> {
      if (user.client === null) return 0;
      if (owner.value === null) return 0;
      errored.value = false;
      loading.value = true;
      try {
        const result = await user.client!.deleteUserSecondFactors(
          owner.value.id,
          ids,
          password,
        );
        // Technically, we will never reach this point, but it's here just in case the API doesn't require a challenge.
        await getSecondFactors(page.value);
        return result.result.count;
      } catch (error) {
        // Pass our error to the default error handler and check if it was handled.
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            // If the error was handled, return false to signify that the error was successfully handled, but the overall request failed.
            return -1;
          case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
            const SFR = await secondFactorChallenger.startChallenge(
              error as Cumulonimbus.SecondFactorChallengeRequiredError,
            );

            if (SFR === null) {
              return -1;
            }
            try {
              const result = await user.client!.deleteUserSecondFactors(
                owner.value.id,
                ids,
                SFR,
              );
              await getSecondFactors(page.value);
              return result.result.count;
            } catch (error) {
              errored.value = true;
              // Pass our error to the default error handler and check if it was handled.
              switch (await defaultErrorHandler(error, router)) {
                case 'OK':
                  // If the error was handled, return false to signify that the error was successfully handled, but the overall request failed.
                  return -1;
                case 'NOT_HANDLED':
                case 'NOT_RESPONSE_ERROR':
                default:
                  // If the error wasn't handled, throw it.
                  throw error;
              }
            }
          case 'NOT_HANDLED':
          case 'NOT_RESPONSE_ERROR':
          default:
            // If the error wasn't handled, throw it.
            throw error;
        }
      } finally {
        loading.value = false;
      }
    }

    async function deleteAllSecondFactors(password: string): Promise<number> {
      if (user.client === null) return 0;
      if (owner.value === null) return 0;
      errored.value = false;
      loading.value = true;
      try {
        const result = await user.client!.deleteAllUserSecondFactors(
          owner.value.id,
          password,
        );
        // Technically, we will never reach this point, but it's here just in case the API doesn't require a challenge.
        await getSecondFactors(page.value);
        return result.result.count;
      } catch (error) {
        // Pass our error to the default error handler and check if it was handled.
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            // If the error was handled, return false to signify that the error was successfully handled, but the overall request failed.
            return -1;
          case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
            const SFR = await secondFactorChallenger.startChallenge(
              error as Cumulonimbus.SecondFactorChallengeRequiredError,
            );

            if (SFR === null) {
              return -1;
            }
            try {
              const result = await user.client!.deleteAllUserSecondFactors(
                owner.value.id,
                SFR,
              );
              await getSecondFactors(page.value);
              return result.result.count;
            } catch (error) {
              errored.value = true;
              // Pass our error to the default error handler and check if it was handled.
              switch (await defaultErrorHandler(error, router)) {
                case 'OK':
                  // If the error was handled, return false to signify that the error was successfully handled, but the overall request failed.
                  return -1;
                case 'NOT_HANDLED':
                case 'NOT_RESPONSE_ERROR':
                default:
                  // If the error wasn't handled, throw it.
                  throw error;
              }
            }
          case 'NOT_HANDLED':
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
      selectedSecondFactor,
      selectedFactorFuzzyLastUsedAt,
      loading,
      errored,
      owner,
      page,
      getSecondFactors,
      getSecondFactor,
      deleteSecondFactor,
      deleteSecondFactors,
      deleteAllSecondFactors,
    };
  },
);
