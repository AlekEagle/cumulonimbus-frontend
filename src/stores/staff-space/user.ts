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

export const otherUserStore = defineStore('staff-space-user', () => {
  const user = userStore();
  const router = useRouter();
  const toast = toastStore();
  const secondFactorChallenger = secondFactorChallengerStore();
  const data = ref<Cumulonimbus.Data.User | null>(null);
  const loading = ref(false);
  const errored = ref(false);

  async function getUser(id: string): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.getUser(id);
      data.value = result.result;
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
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
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

  async function updateUsername(
    username: string,
    password: string,
  ): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editUserUsername(
        data.value!.id,
        username,
        password,
      );
      data.value = result.result;
      return true;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          errored.value = true;
          // If the error was handled, return false to signify that the error was successfully handled, but the overall request failed.
          return false;
        case 'NOT_HANDLED':
          errored.value = true;
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return false;
            case 'USER_EXISTS_ERROR':
              toast.show('Someone already has that username.');
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
            const result = await user.client!.editUserUsername(
              data.value!.id,
              username,
              SFR,
            );
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
          }
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

  async function updateEmail(
    email: string,
    password: string,
  ): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editUserEmail(
        data.value!.id,
        email,
        password,
      );
      data.value = result.result;
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
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return false;
            case 'USER_EXISTS_ERROR':
              toast.show('Someone already has that email.');
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
            const result = await user.client!.editUserEmail(
              data.value!.id,
              email,
              SFR,
            );
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
          }
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

  async function verifyEmail(password: string): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.verifyUserEmail(
        data.value!.id,
        password,
      );
      data.value = result.result;
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
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return false;
            case 'EMAIL_ALREADY_VERIFIED_ERROR':
              toast.show('Their email is already verified.');
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
            const result = await user.client!.verifyUserEmail(
              data.value!.id,
              SFR,
            );
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
                errored.value = true;
                // Handle special cases.
                switch ((error as Cumulonimbus.ResponseError).code) {
                  case 'INVALID_USER_ERROR':
                    toast.show('User not found.');
                    return false;
                  case 'EMAIL_ALREADY_VERIFIED_ERROR':
                    toast.show('Their email is already verified.');
                    return false;
                  default:
                    // If it still wasn't handled, throw the error.
                    throw error;
                }
              case 'NOT_RESPONSE_ERROR':
              default:
                // If the error wasn't handled, throw it.
                throw error;
            }
          }
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

  async function unverifyEmail(password: string): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.unverifyUserEmail(
        data.value!.id,
        password,
      );
      data.value = result.result;
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
            const result = await user.client!.unverifyUserEmail(
              data.value!.id,
              SFR,
            );
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
                errored.value = true;
                // Handle special cases.
                switch ((error as Cumulonimbus.ResponseError).code) {
                  case 'INVALID_USER_ERROR':
                    toast.show('User not found.');
                    return false;
                  case 'EMAIL_NOT_VERIFIED_ERROR':
                    toast.show('Their email is already unverified.');
                    return false;
                  default:
                    // If it still wasn't handled, throw the error.
                    throw error;
                }
              case 'NOT_RESPONSE_ERROR':
              default:
                // If the error wasn't handled, throw it.
                throw error;
            }
          }
        case 'NOT_HANDLED':
          errored.value = true;
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return false;
            case 'EMAIL_NOT_VERIFIED_ERROR':
              toast.show('Their email is already unverified.');
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
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

  async function resendVerificationEmail(): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      await user.client!.resendUserVerificationEmail(data.value!.id);
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
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return false;
            case 'EMAIL_ALREADY_VERIFIED_ERROR':
              toast.show('Their email is already verified.');
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
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

  async function updatePassword(
    password: string,
    newPassword: string,
    confirmNewPassword: string,
  ): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editUserPassword(
        data.value!.id,
        newPassword,
        confirmNewPassword,
        password,
      );
      data.value = result.result;
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
            const result = await user.client!.editUserPassword(
              data.value!.id,
              newPassword,
              confirmNewPassword,
              SFR,
            );
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
                // Handle special cases.
                switch ((error as Cumulonimbus.ResponseError).code) {
                  case 'INVALID_USER_ERROR':
                    toast.show('User not found.');
                    return false;
                  case 'PASSWORDS_DO_NOT_MATCH_ERROR':
                    toast.show('These passwords do not match.');
                    return false;
                  default:
                    // If it still wasn't handled, throw the error.
                    throw error;
                }
              case 'NOT_RESPONSE_ERROR':
              default:
                // If the error wasn't handled, throw it.
                throw error;
            }
          }
        case 'NOT_HANDLED':
          errored.value = true;
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return false;
            case 'PASSWORDS_DO_NOT_MATCH_ERROR':
              toast.show('These passwords do not match.');
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
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

  async function updateDomain(
    domain: string,
    subdomain?: string,
  ): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editUserDomainSelection(
        data.value!.id,
        {
          domain,
          subdomain,
        },
      );
      data.value = result.result;
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
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return false;
            case 'INVALID_DOMAIN_ERROR':
              toast.show('That domain does not exist.');
              return false;
            case 'SUBDOMAIN_NOT_ALLOWED_ERROR':
              toast.show('This domain does not allow subdomains.');
              return false;
            case 'SUBDOMAIN_TOO_LONG_ERROR':
              toast.show('This subdomain is too long.');
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
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

  async function grantStaff(password: string): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.grantStaff(data.value!.id, password);
      data.value = result.result;
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
            const result = await user.client!.grantStaff(data.value!.id, SFR);
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
                // Handle special cases.
                switch ((error as Cumulonimbus.ResponseError).code) {
                  case 'INVALID_USER_ERROR':
                    toast.show('User not found.');
                    return false;
                  default:
                    // If it still wasn't handled, throw the error.
                    throw error;
                }
              case 'NOT_RESPONSE_ERROR':
              default:
                // If the error wasn't handled, throw it.
                throw error;
            }
          }
        case 'NOT_HANDLED':
          errored.value = true;
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return false;
            case 'USER_REQUIRES_SECOND_FACTOR_ERROR':
              toast.show(
                'This user requires a second factor to be granted staff.',
              );
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          errored.value = true;
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
    return true;
  }

  async function revokeStaff(password: string): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.revokeStaff(data.value!.id, password);
      data.value = result.result;
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
            const result = await user.client!.revokeStaff(data.value!.id, SFR);
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
                // Handle special cases.
                switch ((error as Cumulonimbus.ResponseError).code) {
                  case 'INVALID_USER_ERROR':
                    toast.show('User not found.');
                    return false;
                  default:
                    // If it still wasn't handled, throw the error.
                    throw error;
                }
              case 'NOT_RESPONSE_ERROR':
              default:
                // If the error wasn't handled, throw it.
                throw error;
            }
          }
        case 'NOT_HANDLED':
          errored.value = true;
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
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

  async function banUser(reason: string, password: string): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.banUser(
        data.value!.id,
        reason,
        password,
      );
      data.value = result.result;
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
            const result = await user.client!.banUser(
              data.value!.id,
              reason,
              SFR,
            );
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
                // Handle special cases.
                switch ((error as Cumulonimbus.ResponseError).code) {
                  case 'INVALID_USER_ERROR':
                    toast.show('User not found.');
                    return false;
                  default:
                    // If it still wasn't handled, throw the error.
                    throw error;
                }
              case 'NOT_RESPONSE_ERROR':
              default:
                // If the error wasn't handled, throw it.
                throw error;
            }
          }
        case 'NOT_HANDLED':
          errored.value = true;
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
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

  async function unbanUser(password: string): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.unbanUser(data.value!.id, password);
      data.value = result.result;
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
            const result = await user.client!.unbanUser(data.value!.id, SFR);
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
                // Handle special cases.
                switch ((error as Cumulonimbus.ResponseError).code) {
                  case 'INVALID_USER_ERROR':
                    toast.show('User not found.');
                    return false;
                  default:
                    // If it still wasn't handled, throw the error.
                    throw error;
                }
              case 'NOT_RESPONSE_ERROR':
              default:
                // If the error wasn't handled, throw it.
                throw error;
            }
          }
        case 'NOT_HANDLED':
          errored.value = true;
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          errored.value = true;
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
    return true;
  }

  async function deleteAllSessions(password: string): Promise<number> {
    if (user.client === null) return -1;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.deleteAllUserSessions(
        data.value!.id,
        password,
      );
      return result.result.count!;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
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
            const result = await user.client!.deleteAllUserSessions(
              data.value!.id,
              SFR,
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
                // Handle special cases.
                switch ((error as Cumulonimbus.ResponseError).code) {
                  case 'INVALID_USER_ERROR':
                    toast.show('User not found.');
                    return -1;
                  default:
                    // If it still wasn't handled, throw the error.
                    throw error;
                }
              case 'NOT_RESPONSE_ERROR':
              default:
                // If the error wasn't handled, throw it.
                throw error;
            }
          }
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return -1;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
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

  async function deleteAllFiles(password: string): Promise<number> {
    if (user.client === null) return -1;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.deleteAllUserFiles(
        data.value!.id,
        password,
      );
      return result.result.count!;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
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
            const result = await user.client!.deleteAllUserFiles(
              data.value!.id,
              SFR,
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
                // Handle special cases.
                switch ((error as Cumulonimbus.ResponseError).code) {
                  case 'INVALID_USER_ERROR':
                    toast.show('User not found.');
                    return -1;
                  case 'INVALID_FILE_ERROR':
                    toast.show('This user has no uploaded files.');
                    return -1;
                  default:
                    // If it still wasn't handled, throw the error.
                    throw error;
                }
              case 'NOT_RESPONSE_ERROR':
              default:
                // If the error wasn't handled, throw it.
                throw error;
            }
          }
        case 'NOT_HANDLED':
          errored.value = true;
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return -1;
            case 'INVALID_FILE_ERROR':
              toast.show('This user has no uploaded files.');
              return -1;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
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

  async function deleteUser(password: string): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      await user.client!.deleteUser(data.value!.id, password);
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
            await user.client!.deleteUser(data.value!.id, SFR);
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
                  case 'INVALID_USER_ERROR':
                    toast.show('User not found.');
                    return false;
                  default:
                    // If it still wasn't handled, throw the error.
                    throw error;
                }
              case 'NOT_RESPONSE_ERROR':
              default:
                // If the error wasn't handled, throw it.
                throw error;
            }
          }
        case 'NOT_HANDLED':
          errored.value = true;
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_USER_ERROR':
              toast.show('User not found.');
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
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
    errored,
    loading,
    getUser,
    updateUsername,
    updateEmail,
    verifyEmail,
    unverifyEmail,
    resendVerificationEmail,
    updatePassword,
    updateDomain,
    grantStaff,
    revokeStaff,
    banUser,
    unbanUser,
    deleteAllSessions,
    deleteAllFiles,
    deleteUser,
  };
});
