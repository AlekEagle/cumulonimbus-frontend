// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler';
import persistPiniaRef from '@/utils/persistPiniaRef';

// Other Store Modules
import { domainPickerStore } from './domainPicker';
import { toastStore } from './toast';
import { secondFactorChallengerStore } from './secondFactorChallenger';

// External Modules
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const BaseAPIURLs: { [key: string]: string } = {
  production: `${window.location.protocol}//${window.location.host}/api`,
  ptb: 'https://alekeagle.me/api',
  development: 'http://localhost:8000/api',
};

const BaseThumbnailURLs: { [key: string]: string } = {
  production: `${window.location.protocol}//previews.${window.location.host}`,
  ptb: 'https://previews.alekeagle.me',
  development: 'http://localhost:8100',
};

export const cumulonimbusOptions: Cumulonimbus.ClientOptions = {
  baseURL: BaseAPIURLs[import.meta.env.MODE],
  baseThumbnailURL: BaseThumbnailURLs[import.meta.env.MODE],
};

// Store Definition
export const userStore = defineStore('user', () => {
  // --- Persistent Refs ---
  // The store of user accounts in the account switcher.
  // If the user session is valid, the token value will be present.
  // If it isn't, the account will remain on the list but be false, indicating the session expired.
  // Object keys are the user's username.
  const accounts = ref<{
    [key: string]: string | false;
  }>({});
  // Persist the user accounts store.
  persistPiniaRef(accounts, 'accounts', { deep: true, immediate: true });
  // The current account information.
  const account = ref<{
    session: Cumulonimbus.Data.Session & { token: string };
    user: Cumulonimbus.Data.User;
  } | null>(null);
  // Persist the current account information.
  persistPiniaRef(account, 'account', { deep: true, immediate: true });
  // --- Non-Persistent Data ---
  // The Cumulonimbus client.
  const client = ref<Cumulonimbus | null>(null);
  // Is there actually a user logged in?
  const loggedIn = computed(
    () => account.value !== null && client.value !== null,
  );
  const domain = computed(() => {
    if (account.value === null) return null;
    return `${
      account.value.user.subdomain ? account.value.user.subdomain + '.' : ''
    }${account.value.user.domain}`;
  });
  // Is the stored account information being modified?
  const loading = ref(false);

  // Migrate old account stores to the new format.
  if (
    localStorage.getItem('user') !== null &&
    localStorage.getItem('session') !== null
  ) {
    const user = JSON.parse(localStorage.getItem('user') as string);
    const session = JSON.parse(localStorage.getItem('session') as string);
    accounts.value[user.username] = session.token;
    account.value = {
      session: {
        ...session,
        token: session.token,
      },
      user,
    };
    localStorage.removeItem('user');
    localStorage.removeItem('session');
  }

  // --- External Stores ---

  // The router store.
  const router = useRouter(),
    // The toast store.
    toast = toastStore(),
    // Domain picker store.
    domainPicker = domainPickerStore(),
    // Second factor challenger store.
    secondFactorChallenger = secondFactorChallengerStore();

  // -- Functions --

  // --- Account Switcher Management ---

  // Add an account to the account switcher.
  function addAccount(username: string, token: string): typeof accounts.value {
    accounts.value[username] = token;
    return accounts.value;
  }

  // Mark account session as expired.
  function markAccountExpired(username: string): typeof accounts.value {
    accounts.value[username] = false;
    return accounts.value;
  }

  // Remove an account from the account switcher.
  async function removeAccount(username: string): Promise<boolean> {
    if (accounts.value[username] === false) {
      // If the account isn't logged in, but simply in the account switcher, simply remove the account from the account switcher.
      delete accounts.value[username];
      return true;
    } else {
      // Begin the process of deleting the session and logging out.
      loading.value = true;

      if (username === account.value?.user?.username) {
        try {
          // If the currently logged in user is being removed, call our logout function.
          let res = await logout();
          if (res !== true) {
            // If the function returned an unhandled Cumulonimbus ResponseError, pass it on to the function caller.
            return res;
          } else {
            // Success, remove the account from the account switcher.
            delete accounts.value[username];
            return true;
          }
        } catch (error) {
          // The logout function threw an unhandled error that wasn't a Cumulonimbus ResponseError, pass it on to the function caller.
          throw error;
        } finally {
          loading.value = false;
        }
      } else {
        // Log out a user that isn't currently selected.
        try {
          // Create a temporary client with the stored token.
          const tempClient = new Cumulonimbus(
            accounts.value[username] as string,
            cumulonimbusOptions,
          );

          // Delete the session.
          await tempClient.deleteSelfSession();

          // Success, remove the account from the account switcher.
          delete accounts.value[username];
          return true;
        } catch (error) {
          // Pass our error to the default error handler and check if it was handled.
          const reason = await defaultErrorHandler(error, router, [
            'INVALID_SESSION_ERROR',
          ]);
          switch (reason) {
            case 'OK':
              // If the error was handled, return false.
              return false;
            case 'NOT_HANDLED':
              // Handle special cases.
              switch ((error as Cumulonimbus.ResponseError).code) {
                case 'INVALID_SESSION_ERROR':
                  delete accounts.value[username];
                  return true;
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
    }
  }

  // --- Account Login/Registration Management ---

  // Login to an account.
  async function login(
    username: string,
    password: string,
    remember: boolean = false,
  ): Promise<boolean> {
    // Set the loading state.
    loading.value = true;
    // Try to login with the provided credentials.
    try {
      // Use the static login function to create a new client with the provided credentials.
      client.value = await Cumulonimbus.login(
        username,
        password,
        remember,
        cumulonimbusOptions,
      );
      // Get the session and user information.
      account.value = {
        session: {
          ...(await client.value.getSelfSession()).result,
          token: (client.value as any).token,
        },
        user: (await client.value.getSelf()).result,
      };
      // Add the account to the account switcher.
      // Use the username value from the account information, as the provided username may be different (an email, incorrect capitalization, etc).
      addAccount(account.value.user.username, account.value.session.token);
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return false.
          return false;
        case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
          const SFR = await secondFactorChallenger.startChallenge(
            error as Cumulonimbus.SecondFactorChallengeRequiredError,
          );

          if (SFR === null) {
            return false;
          }

          try {
            // Use the static login function to create a new client with the provided credentials.
            client.value = await Cumulonimbus.login(
              username,
              SFR,
              remember,
              cumulonimbusOptions,
            );
            // Get the session and user information.
            account.value = {
              session: {
                ...(await client.value.getSelfSession()).result,
                token: (client.value as any).token,
              },
              user: (await client.value.getSelf()).result,
            };
            // Add the account to the account switcher.
            // Use the username value from the account information, as the provided username may be different (incorrect capitalization, etc).
            addAccount(
              account.value.user.username,
              account.value.session.token,
            );
            // If nothing went wrong:
            // Return true to signify success.
            return true;
          } catch (error) {
            // Pass our error to the default error handler and check if it was handled.
            switch (await defaultErrorHandler(error, router)) {
              case 'OK':
                // If the error was handled, return false.
                return false;
              case 'NOT_HANDLED':
                switch ((error as Cumulonimbus.ResponseError).code) {
                  case 'INVALID_USER_ERROR':
                    toast.show("I can't find anyone with that username!");
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
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_USER_ERROR':
              toast.show("I can't find anyone with that username!");
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
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Register a new account.
  async function register(
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    remember: boolean = false,
  ): Promise<boolean> {
    // Set the loading state.
    loading.value = true;
    // Try to register with the provided credentials.
    try {
      // Use the static register function to create a new client with the provided credentials.
      client.value = await Cumulonimbus.register(
        username,
        email,
        password,
        confirmPassword,
        remember,
        cumulonimbusOptions,
      );
      // Get the session and user information.
      account.value = {
        session: {
          ...(await client.value.getSelfSession()).result,
          token: (client.value as any).token,
        },
        user: (await client.value.getSelf()).result,
      };
      // Add the account to the account switcher.
      // Use the username value from the account information, as the provided username may be different (an email, incorrect capitalization, etc).
      addAccount(account.value.user.username, account.value.session.token);
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return false.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'USER_EXISTS_ERROR':
              toast.show('Someone already has that username or email!');
              return false;
            case 'INVALID_USERNAME_ERROR':
              toast.show('Invalid username!');
              return false;
            case 'INVALID_EMAIL_ERROR':
              toast.show('Invalid email!');
              return false;
            case 'PASSWORDS_DO_NOT_MATCH_ERROR':
              toast.show('Passwords do not match!');
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
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Logout of the current account.
  // This will not remove the account from the account switcher.
  async function logout(): Promise<boolean> {
    // Don't bother if there's no account logged in.
    if (!account.value) return true;
    // Set the loading state.
    loading.value = true;
    // temporarily store the username (that way, if the logout succeeds, we can tell the account switcher to mark the account as logged out).
    const username = account.value.user.username;
    // Try to delete the session from the server.
    try {
      await client.value?.deleteSelfSession(
        account.value.session.id.toString(),
      );
      // Reset the client and account information.
      client.value = null;
      account.value = null;
      // If nothing went wrong:
      // Mark the account as logged out (but still present) in the account switcher.
      markAccountExpired(username);
      // Return true to signify success.
      return true;
    } catch (error) {
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
            case 'INVALID_SESSION_ERROR':
              // If it was, the session has already expired and we can pretend it was deleted successfully.
              // Reset the client and account information.
              client.value = null;
              account.value = null;
              // Mark the account as logged out (but still present) in the account switcher.
              markAccountExpired(username);
              // Return true to signify success.
              return true;
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
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Restore the client from a stored session.
  // We don't care if the session is invalid, we'll take care of that when we try to use the client.
  function restoreClient(): void {
    // If there's no account information stored, return.
    if (!account.value) return;
    // Create a new client with the stored session information.
    client.value = new Cumulonimbus(
      account.value.session.token,
      cumulonimbusOptions,
    );
  }

  // --- Account Switching ---
  // Switch to a different account.
  async function switchAccount(username: string): Promise<boolean> {
    // If the requested account is already the current account, return true to signify success.
    if (account.value?.user.username === username) return true;
    // Set the loading state.
    loading.value = true;
    // Remove current account information from the current selected account and reset the client.
    account.value = null;
    client.value = null;
    // If the account is not in the account switcher, reset the loading state and throw an error.
    if (accounts.value[username] === undefined) {
      loading.value = false;
      throw new Error('Account not found.');
    }
    // If the account is in the account switcher, but is false (the session is expired), reset the loading state and return false.
    // This will tell the frontend to prompt the user to login again.
    if (accounts.value[username] === false) {
      loading.value = false;
      return false;
    }
    // If the account is in the account switcher, and is not false, create the client with the stored token.
    client.value = new Cumulonimbus(
      accounts.value[username] as string,
      cumulonimbusOptions,
    );
    // Try to restore account and session information.
    try {
      account.value = {
        session: {
          ...(await client.value.getSelfSession()).result,
          token: (client.value as any).token,
        },
        user: (await client.value.getSelf()).result,
      };
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return false.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_SESSION_ERROR':
              // If it was, the session has already expired and we can pretend it was deleted successfully.
              // Reset the client and account information.
              client.value = null;
              account.value = null;
              // Mark the account as logged out (but still present) in the account switcher.
              markAccountExpired(username);
              // Return true to signify success.
              return true;
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
      // Reset the loading state.
      loading.value = false;
    }
  }

  // --- Account Modification Management ---

  // Change the username of the current account.
  async function changeUsername(
    username: string,
    password: string,
  ): Promise<boolean> {
    // Set the loading state.
    loading.value = true;
    // Try to change the username.
    try {
      // Change the username. Use the password to reauthenticate.
      account.value!.user = (
        await client.value!.editSelfUsername(username, password)
      ).result;
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return false.
          return false;
        case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
          const SFR = await secondFactorChallenger.startChallenge(
            error as Cumulonimbus.SecondFactorChallengeRequiredError,
          );

          if (SFR === null) {
            return false;
          }

          try {
            // Change the username. Use the second factor response we received to reauthenticate.
            account.value!.user = (
              await client.value!.editSelfUsername(username, SFR)
            ).result;
            // If nothing went wrong:
            // Return true to signify success.
            return true;
          } catch (error) {
            // Pass our error to the default error handler and check if it was handled.
            switch (await defaultErrorHandler(error, router)) {
              case 'OK':
                // If the error was handled, return false.
                return false;
              case 'NOT_HANDLED':
                // Handle special cases.
                switch ((error as Cumulonimbus.ResponseError).code) {
                  case 'USER_EXISTS_ERROR':
                    toast.show('Someone already has that username!');
                    return false;
                  case 'INVALID_USERNAME_ERROR':
                    toast.show('Invalid username!');
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
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'USER_EXISTS_ERROR':
              toast.show('Someone already has that username!');
              return false;
            case 'INVALID_USERNAME_ERROR':
              toast.show('Invalid username!');
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
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Change the email of the current account.
  async function changeEmail(
    email: string,
    password: string,
  ): Promise<boolean> {
    // Set the loading state.
    loading.value = true;
    // Try to change the email.
    try {
      // Change the email. Use the password to reauthenticate.
      account.value!.user = (
        await client.value!.editSelfEmail(email, password)
      ).result;
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return false.
          return false;
        case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
          const SFR = await secondFactorChallenger.startChallenge(
            error as Cumulonimbus.SecondFactorChallengeRequiredError,
          );

          if (SFR === null) {
            return false;
          }

          try {
            // Change the email. Use the second factor response we received to reauthenticate.
            account.value!.user = (
              await client.value!.editSelfEmail(email, SFR)
            ).result;
            // If nothing went wrong:
            // Return true to signify success.
            return true;
          } catch (error) {
            // Pass our error to the default error handler and check if it was handled.
            switch (await defaultErrorHandler(error, router)) {
              case 'OK':
                // If the error was handled, return false.
                return false;
              case 'NOT_HANDLED':
                // Handle special cases.
                switch ((error as Cumulonimbus.ResponseError).code) {
                  case 'USER_EXISTS_ERROR':
                    toast.show('Someone already has that email!');
                    return false;
                  case `INVALID_EMAIL_ERROR`:
                    toast.show('Invalid email!');
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
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'USER_EXISTS_ERROR':
              toast.show('Someone already has that email!');
              return false;
            case `INVALID_EMAIL_ERROR`:
              toast.show('Invalid email!');
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
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Verify the email of the current account.
  async function verifyEmail(token: string): Promise<boolean> {
    // Set the loading state.
    loading.value = true;
    // Try to verify the email.
    try {
      // Verify the email.
      await client.value!.verifyEmail(token);

      // If nothing went wrong:
      // Update the account information.
      await refetch();
      // Return true to signify success.
      return true;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return false.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'EMAIL_ALREADY_VERIFIED_ERROR':
              toast.show('Your email is already verified!');
              return false;
            case `INVALID_VERIFICATION_TOKEN_ERROR`:
              toast.show('Invalid verification token!');
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
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Resend the verification email of the current account.
  async function resendVerificationEmail(): Promise<boolean> {
    // Set the loading state.
    loading.value = true;
    // Try to resend the verification email.
    try {
      // Resend the verification email.
      await client.value!.resendSelfVerificationEmail();
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return false.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'EMAIL_ALREADY_VERIFIED_ERROR':
              toast.show('Your email is already verified!');
              // Since the email is already verified, let's go ahead and update the account information.
              await refetch();
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
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Change the password of the current account.
  async function changePassword(
    newPassword: string,
    confirmNewPassword: string,
    password: string,
  ): Promise<boolean> {
    // Set the loading state.
    loading.value = true;
    // Try to change the password.
    try {
      // Change the password. Use the old password to reauthenticate.
      // Only provide the password, that way we aren't changing data that we don't need to.
      account.value!.user = (
        await client.value!.editSelfPassword(
          newPassword,
          confirmNewPassword,
          password,
        )
      ).result;
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return false.
          return false;
        case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
          const SFR = await secondFactorChallenger.startChallenge(
            error as Cumulonimbus.SecondFactorChallengeRequiredError,
          );

          if (SFR === null) {
            return false;
          }

          try {
            // Change the password. Use the second factor response we received to reauthenticate.
            account.value!.user = (
              await client.value!.editSelfPassword(
                newPassword,
                confirmNewPassword,
                SFR,
              )
            ).result;
            // If nothing went wrong:
            // Return true to signify success.
            return true;
          } catch (error) {
            // Pass our error to the default error handler and check if it was handled.
            switch (await defaultErrorHandler(error, router)) {
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
          }
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'PASSWORDS_DO_NOT_MATCH_ERROR':
              toast.show('These passwords do not match!');
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
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Change the domain selection of the current account.
  async function changeDomain(
    domain: string,
    subdomain?: string,
  ): Promise<boolean> {
    // Set the loading state.
    loading.value = true;
    // Try to change the domain.
    try {
      // Change the domain, and if a subdomain is provided, change that too.
      account.value!.user = (
        await client.value!.editSelfDomainSelection({ domain, subdomain })
      ).result;
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return false.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_DOMAIN_ERROR':
              toast.show('You just missed that domain.');
              await domainPicker.sync();
              return false;
            case 'SUBDOMAIN_NOT_ALLOWED_ERROR':
              toast.show('Subdomains are not supported.');
              return false;
            case 'SUBDOMAIN_TOO_LONG_ERROR':
              toast.show('Subdomain cannot be longer than 63 characters.');
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
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Revoke all sessions of the current account.
  async function revokeSessions(includeSelf: boolean = false): Promise<number> {
    // Set the loading state.
    loading.value = true;
    // Try to revoke all sessions.
    try {
      // Revoke all sessions.
      const res = await client.value!.deleteAllSelfSessions(includeSelf);
      // If nothing went wrong:
      // Logout if the current session was included.
      if (includeSelf) await logout();
      return res.result.count!;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return -1 to represent us handling the error.
          return -1;
        case 'NOT_HANDLED':
        // No special cases to handle here.
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Delete all files of the current account.
  async function deleteFiles(password: string): Promise<number> {
    // Set the loading state.
    loading.value = true;
    // Try to delete all files.
    try {
      // Delete all files and return the number of deleted files.
      return (await client.value!.deleteAllSelfFiles(password)).result.count!;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return -1 to represent us handling the error.
          return -1;
        case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
          const SFR = await secondFactorChallenger.startChallenge(
            error as Cumulonimbus.SecondFactorChallengeRequiredError,
          );

          if (SFR === null) {
            return -1;
          }

          try {
            // Delete all files and return the number of deleted files.
            return (await client.value!.deleteAllSelfFiles(SFR)).result.count!;
          } catch (error) {
            // Pass our error to the default error handler and check if it was handled.
            switch (await defaultErrorHandler(error, router)) {
              case 'OK':
                // If the error was handled, return -1 to represent us handling the error.
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
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_FILE_ERROR':
              toast.show("You don't have any files to delete.");
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
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Delete the current account.
  async function deleteAccount(
    username: string,
    password: string,
  ): Promise<boolean> {
    // Set the loading state.
    loading.value = true;
    if (username !== account.value?.user.username) {
      // If the username doesn't match the current account, reset the loading state and return false.
      loading.value = false;
      return false;
    }
    // Try to delete the account.
    try {
      // Delete the account. Use the username to ensure the user really wants to delete their account, and use the password to reauthenticate.
      await client.value!.deleteSelf(password);
      // If nothing went wrong:
      // Reset the account value.
      account.value = null;
      // Reset the client value.
      client.value = null;
      // Remove the username from the account switcher.
      removeAccount(username);
      // Return true to signify success.
      return true;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return false.
          return false;
        case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
          const SFR = await secondFactorChallenger.startChallenge(
            error as Cumulonimbus.SecondFactorChallengeRequiredError,
          );

          if (SFR === null) {
            return false;
          }

          try {
            // Delete the account. Use the second factor response we received to reauthenticate.
            await client.value!.deleteSelf(SFR);
            // If nothing went wrong:
            // Reset the account value.
            account.value = null;
            // Reset the client value.
            client.value = null;
            // Remove the username from the account switcher.
            removeAccount(username);
            // Return true to signify success.
            return true;
          } catch (error) {
            // Pass our error to the default error handler and check if it was handled.
            switch (await defaultErrorHandler(error, router)) {
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
          }
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_USERNAME_ERROR':
              toast.show('That is not your username.');
              return false;
            default:
              // If it still wasn't handled, throw the error
              throw error;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Manually refetch account and session data.
  async function refetch(): Promise<boolean> {
    // Set the loading state.
    loading.value = true;
    // Try to refetch.
    try {
      // Refetch the account and session data.
      account.value = {
        user: (await client.value!.getSelf()).result,
        session: {
          ...(await client.value!.getSelfSession()).result,
          token: account.value!.session.token,
        },
      };
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
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
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Export all functions and values.
  return {
    accounts,
    account,
    domain,
    client,
    loading,
    loggedIn,
    addAccount,
    removeAccount,
    markAccountExpired,
    login,
    logout,
    register,
    restoreClient,
    switchAccount,
    changeUsername,
    changeEmail,
    verifyEmail,
    resendVerificationEmail,
    changePassword,
    changeDomain,
    revokeSessions,
    deleteFiles,
    deleteAccount,
    refetch,
  };
});
