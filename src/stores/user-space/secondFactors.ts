// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler';

// Other Store Modules
import { displayPrefStore } from '../displayPref';
import { userStore } from '../user';
import { toastStore } from '../toast';
import { secondFactorChallengerStore } from '../secondFactorChallenger';

// External Modules
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

export const secondFactorsStore = defineStore(
  'user-space-second-factors',
  () => {
    const user = userStore(),
      displayPref = displayPrefStore(),
      router = useRouter(),
      toast = toastStore(),
      secondFactorChallenger = secondFactorChallengerStore(),
      data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.SecondFactor> | null>(
        null,
      ),
      loading = ref(false),
      errored = ref(false),
      page = ref(0);

    async function getSecondFactors(p: number): Promise<boolean> {
      if (user.client === null) return false;
      errored.value = false;
      loading.value = true;
      try {
        const result = await user.client!.getSelfSecondFactors({
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

    async function deleteSecondFactor(
      id: string,
      password: string,
    ): Promise<boolean> {
      if (user.client === null) return false;
      errored.value = false;
      try {
        await user.client!.deleteSelfSecondFactor(id, password);
        await getSecondFactors(page.value);
        return true;
      } catch (error) {
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            errored.value = true;
            return false;
          case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
            const SFR = await secondFactorChallenger.startChallenge(
              error as Cumulonimbus.SecondFactorChallengeRequiredError,
            );

            if (SFR === null) {
              return false;
            }

            try {
              await user.client!.deleteSelfSecondFactor(id, SFR);
              await getSecondFactors(page.value);
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
          case 'NOT_HANDLED':
          case 'NOT_RESPONSE_ERROR':
          default:
            errored.value = true;
            throw error;
        }
      }
    }

    async function deleteSecondFactors(
      ids: string[],
      password: string,
    ): Promise<number> {
      if (user.client === null) return 0;
      errored.value = false;
      loading.value = true;
      try {
        const result = await user.client!.deleteSelfSecondFactors(
          ids,
          password,
        );
        await getSecondFactors(page.value);
        return result.result.count;
      } catch (error) {
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            errored.value = true;
            return -1;
          case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
            const SFR = await secondFactorChallenger.startChallenge(
              error as Cumulonimbus.SecondFactorChallengeRequiredError,
            );

            if (SFR === null) {
              return -1;
            }

            try {
              const result = await user.client!.deleteSelfSecondFactors(
                ids,
                SFR,
              );
              await getSecondFactors(page.value);
              return result.result.count;
            } catch (error) {
              errored.value = true;
              switch (await defaultErrorHandler(error, router)) {
                case 'OK':
                  return -1;
                case 'NOT_HANDLED':
                case 'NOT_RESPONSE_ERROR':
                default:
                  throw error;
              }
            }
          case 'NOT_HANDLED':
          case 'NOT_RESPONSE_ERROR':
          default:
            errored.value = true;
            throw error;
        }
      } finally {
        loading.value = false;
      }
    }

    async function deleteAllSecondFactors(password: string): Promise<boolean> {
      if (user.client === null) return false;
      errored.value = false;
      loading.value = true;
      try {
        await user.client!.deleteAllSelfSecondFactors(password);
        await getSecondFactors(page.value);
        return true;
      } catch (error) {
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            errored.value = true;
            return false;
          case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
            const SFR = await secondFactorChallenger.startChallenge(
              error as Cumulonimbus.SecondFactorChallengeRequiredError,
            );

            if (SFR === null) {
              return false;
            }

            try {
              await user.client!.deleteAllSelfSecondFactors(SFR);
              await getSecondFactors(page.value);
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
          case 'NOT_HANDLED':
          case 'NOT_RESPONSE_ERROR':
          default:
            errored.value = true;
            throw error;
        }
      } finally {
        loading.value = false;
      }
    }

    async function beginTOTPRegistration(
      password: string,
    ): Promise<Cumulonimbus.Data.SecondFactorTOTPRegistration | null> {
      if (user.client === null) return null;
      try {
        return (await user.client!.beginTOTPRegistration(password)).result;
      } catch (error) {
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            errored.value = true;
            return null;
          case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
            const SFR = await secondFactorChallenger.startChallenge(
              error as Cumulonimbus.SecondFactorChallengeRequiredError,
            );

            if (SFR === null) {
              return null;
            }

            try {
              return (await user.client!.beginTOTPRegistration(SFR)).result;
            } catch (error) {
              switch (await defaultErrorHandler(error, router)) {
                case 'OK':
                  return null;
                case 'NOT_HANDLED':
                case 'NOT_RESPONSE_ERROR':
                default:
                  throw error;
              }
            }
          case 'NOT_HANDLED':
          case 'NOT_RESPONSE_ERROR':
          default:
            throw error;
        }
      }
    }

    async function completeTOTPRegistration(
      token: string,
      name: string,
      code: string,
    ): Promise<Cumulonimbus.Data.SecondFactorRegisterSuccess | null> {
      if (user.client === null) return null;
      try {
        return (await user.client!.confirmTOTPRegistration(token, name, code))
          .result;
      } catch (error) {
        errored.value = true;
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            return null;
          case 'NOT_HANDLED':
          case 'NOT_RESPONSE_ERROR':
          default:
            throw error;
        }
      }
    }

    async function beginWebAuthnRegistration(
      password: string,
    ): Promise<Cumulonimbus.Data.SecondFactorWebAuthnRegistration | null> {
      if (user.client === null) return null;
      try {
        return (await user.client!.beginWebAuthnRegistration(password)).result;
      } catch (error) {
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            errored.value = true;
            return null;
          case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
            const SFR = await secondFactorChallenger.startChallenge(
              error as Cumulonimbus.SecondFactorChallengeRequiredError,
            );

            if (SFR === null) {
              return null;
            }

            try {
              return (await user.client!.beginWebAuthnRegistration(SFR)).result;
            } catch (error) {
              switch (await defaultErrorHandler(error, router)) {
                case 'OK':
                  return null;
                case 'NOT_HANDLED':
                case 'NOT_RESPONSE_ERROR':
                default:
                  throw error;
              }
            }
          case 'NOT_HANDLED':
          case 'NOT_RESPONSE_ERROR':
          default:
            throw error;
        }
      }
    }

    async function completeWebAuthnRegistration(
      token: string,
      name: string,
      response: RegistrationResponseJSON,
    ): Promise<Cumulonimbus.Data.SecondFactorRegisterSuccess | null> {
      if (user.client === null) return null;
      try {
        return (
          await user.client!.confirmWebAuthnRegistration(token, name, response)
        ).result;
      } catch (error) {
        errored.value = true;
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            return null;
          case 'NOT_HANDLED':
          case 'NOT_RESPONSE_ERROR':
          default:
            throw error;
        }
      }
    }

    async function regenerateBackupCodes(
      password: string,
    ): Promise<Cumulonimbus.Data.SecondFactorBackupRegisterSuccess | null> {
      if (user.client === null) return null;
      try {
        return (await user.client!.regenerateBackupCodes(password)).result;
      } catch (error) {
        switch (await defaultErrorHandler(error, router)) {
          case 'OK':
            errored.value = true;
            return null;
          case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
            const SFR = await secondFactorChallenger.startChallenge(
              error as Cumulonimbus.SecondFactorChallengeRequiredError,
            );

            if (SFR === null) {
              return null;
            }

            try {
              return (await user.client!.regenerateBackupCodes(SFR)).result;
            } catch (error) {
              switch (await defaultErrorHandler(error, router)) {
                case 'OK':
                  return null;
                case 'NOT_HANDLED':
                case 'NOT_RESPONSE_ERROR':
                default:
                  throw error;
              }
            }
          case 'NOT_HANDLED':
          case 'NOT_RESPONSE_ERROR':
          default:
            throw error;
        }
      }
    }

    return {
      data,
      loading,
      errored,
      page,
      getSecondFactors,
      deleteSecondFactor,
      deleteSecondFactors,
      deleteAllSecondFactors,
      beginTOTPRegistration,
      completeTOTPRegistration,
      beginWebAuthnRegistration,
      completeWebAuthnRegistration,
      regenerateBackupCodes,
    };
  },
);
