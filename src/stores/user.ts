import { defineStore } from "pinia";
import { ref, computed } from "vue";
import persistPiniaStore from "@/utils/persistPinia";
import Cumulonimbus from "cumulonimbus-wrapper";

const BaseAPIURLs: { [key: string]: string } = {
  production: `${window.location.protocol}//${window.location.host}/api`,
  ptb: "https://alekeagle.me/api",
  development: "http://localhost:8000/api",
};

const BaseThumbnailURLs: { [key: string]: string } = {
  production: `${window.location.protocol}//previews.${window.location.host}`,
  ptb: "https://previews.alekeagle.me",
  development: "http://localhost:8100",
};

export const cumulonimbusOptions: Cumulonimbus.ClientOptions = {
  baseURL: BaseAPIURLs[import.meta.env.MODE],
  baseThumbnailURL: BaseThumbnailURLs[import.meta.env.MODE],
};

export const userStore = defineStore("user", () => {
  // --- Persistent Data ---
  // The store of user accounts in the account switcher.
  // If the user session is valid, the token value will be present.
  // If it isn't, the account will remain on the list but be false, indicating the session expired.
  // Object keys are the user's username.
  const accounts = ref<{
    [key: string]: string | false;
  }>({});
  // Persist the user accounts store.
  persistPiniaStore(accounts, "accounts", { deep: true, immediate: true });
  // The current account information.
  const account = ref<{
    session: Cumulonimbus.Data.Session & { token: string };
    user: Cumulonimbus.Data.User;
  } | null>(null);
  // Persist the current account information.
  persistPiniaStore(account, "account", { deep: true, immediate: true });
  // --- Non-Persistent Data ---
  // The Cumulonimbus client.
  const client = ref<Cumulonimbus | null>(null);
  // Is there actually a user logged in?
  const loggedIn = computed(
    () => account.value !== null && client.value !== null
  );
  const domain = computed(() => {
    if (account.value === null) return null;
    return `${
      account.value.user.subdomain ? account.value.user.subdomain + "." : ""
    }${account.value.user.domain}`;
  });
  // Is the stored account information being modified?
  const loading = ref(false);

  // Migrate old account stores to the new format.
  if (
    localStorage.getItem("user") !== null &&
    localStorage.getItem("session") !== null
  ) {
    const user = JSON.parse(localStorage.getItem("user") as string);
    const session = JSON.parse(localStorage.getItem("session") as string);
    accounts.value[user.username] = session.token;
    account.value = {
      session: {
        ...session,
        token: session.token,
      },
      user,
    };
    localStorage.removeItem("user");
    localStorage.removeItem("session");
  }

  // -- Functions --

  // --- Account Switcher Management ---

  // Add an account to the account switcher.
  function addAccount(username: string, token: string) {
    accounts.value[username] = token;
    return accounts.value;
  }

  // Mark account session as expired.
  function markAccountExpired(username: string) {
    accounts.value[username] = false;
    return accounts.value;
  }

  // Remove an account from the account switcher.
  async function removeAccount(username: string) {
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
              cumulonimbusOptions
          ),
            // Get the session ID.
            sid = (await tempClient.getSession()).result.id.toString();

          // Delete the session.
          const res = await tempClient.deleteSession(sid);

          if (res) {
            // Success, remove the account from the account switcher.
            delete accounts.value[username];
            return true;
          }
        } catch (error) {
          // If the error is a Cumulonimbus ResponseError, check if the error was caused by an invalid session.
          if (error instanceof Cumulonimbus.ResponseError) {
            if (error.code === "INVALID_SESSION_ERROR") {
              // If it was, the session has already expired and we can pretend it was deleted successfully.
              delete accounts.value[username];
              return true;
            } else {
              // If it wasn't, pass the error on to the function caller.
              return error;
            }
          } else {
            // If the error wasn't a Cumulonimbus ResponseError, pass it on to the function caller.
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
    remember: boolean = false
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    // Set the loading state.
    loading.value = true;
    // Try to login with the provided credentials.
    try {
      // Use the static login function to create a new client with the provided credentials.
      client.value = await Cumulonimbus.login(
        username,
        password,
        remember,
        cumulonimbusOptions
      );
      // Get the session and user information.
      account.value = {
        session: {
          ...(await client.value.getSession()).result,
          token: (client.value as any).token,
        },
        user: (await client.value.getUser()).result,
      };
      // Add the account to the account switcher.
      // Use the username value from the account information, as the provided username may be different (an email, incorrect capitalization, etc).
      addAccount(account.value.user.username, account.value.session.token);
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // If an error occurred, and it's a Cumulonimbus ResponseError, return it.
      if (error instanceof Cumulonimbus.ResponseError) return error;
      // Otherwise, throw the error.
      throw error;
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
    remember: boolean = false
  ): Promise<boolean | Cumulonimbus.ResponseError> {
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
        cumulonimbusOptions
      );
      // Get the session and user information.
      account.value = {
        session: {
          ...(await client.value.getSession()).result,
          token: (client.value as any).token,
        },
        user: (await client.value.getUser()).result,
      };
      // Add the account to the account switcher.
      // Use the username value from the account information, as the provided username may be different (an email, incorrect capitalization, etc).
      addAccount(account.value.user.username, account.value.session.token);
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // If an error occurred, and it's a Cumulonimbus ResponseError, return it.
      if (error instanceof Cumulonimbus.ResponseError) return error;
      // Otherwise, throw the error.
      throw error;
    } finally {
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Logout of the current account.
  // This will not remove the account from the account switcher.
  async function logout(): Promise<boolean | Cumulonimbus.ResponseError> {
    // Don't bother if there's no account logged in.
    if (!account.value) return true;
    // Set the loading state.
    loading.value = true;
    // temporarily store the username (that way, if the logout succeeds, we can tell the account switcher to mark the account as logged out).
    const username = account.value.user.username;
    // Try to delete the session from the server.
    try {
      await client.value?.deleteSession(account.value.session.id.toString());
      // Reset the client and account information.
      client.value = null;
      account.value = null;
      // If nothing went wrong:
      // Mark the account as logged out (but still present) in the account switcher.
      markAccountExpired(username);
      // Return true to signify success.
      return true;
    } catch (error) {
      // If an error occurred, the session may have already expired.
      // Check if the error is a Cumulonimbus ResponseError.
      if (error instanceof Cumulonimbus.ResponseError) {
        // If it is a Cumulonimbus ResponseError, check if the error was not caused by an invalid session.
        if (error.code !== "INVALID_SESSION_ERROR") {
          // If it isn't, return the error.
          return error;
        } else {
          // If it is, the session has already expired and we can pretend it was deleted successfully.
          // Reset the client and account information.
          client.value = null;
          account.value = null;
          // Tell the account switcher that the account is logged out (but still present) and return true to signify success.
          markAccountExpired(username);
          return true;
        }
      } else {
        // If it isn't a Cumulonimbus ResponseError, throw the error.
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
      cumulonimbusOptions
    );
  }

  // --- Account Switching ---
  // Switch to a different account.
  async function switchAccount(
    username: string
  ): Promise<boolean | Cumulonimbus.ResponseError> {
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
      throw new Error("Account not found.");
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
      cumulonimbusOptions
    );
    // Try to restore account and session information.
    try {
      account.value = {
        session: {
          ...(await client.value.getSession()).result,
          token: (client.value as any).token,
        },
        user: (await client.value.getUser()).result,
      };
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // If an error occurred, check if the error is a Cumulonimbus ResponseError.
      if (error instanceof Cumulonimbus.ResponseError) {
        // If it is, check if the error was not caused by an invalid session.
        if (error.code !== "INVALID_SESSION_ERROR") {
          // If it isn't, return the error.
          return error;
        } else {
          // If it is, the session is expired.
          // Mark the account as expired in the account switcher and return false.
          // This will tell the frontend to prompt the user to login again.
          markAccountExpired(username);
          return false;
        }
      } else {
        // If it isn't a Cumulonimbus ResponseError, throw the error.
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
    password: string
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    // Set the loading state.
    loading.value = true;
    // Try to change the username.
    try {
      // Change the username. Use the password to reauthenticate.
      // Only provide the username, that way we aren't changing data that we don't need to.
      account.value!.user = (
        await client.value!.editUsername(username, password)
      ).result;
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // If an error occurred, and it's a Cumulonimbus ResponseError, return it.
      if (error instanceof Cumulonimbus.ResponseError) return error;
      // Otherwise, throw the error.
      throw error;
    } finally {
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Change the email of the current account.
  async function changeEmail(
    email: string,
    password: string
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    // Set the loading state.
    loading.value = true;
    // Try to change the email.
    try {
      // Change the email. Use the password to reauthenticate.
      // Only provide the email, that way we aren't changing data that we don't need to.
      account.value!.user = (
        await client.value!.editEmail(email, password)
      ).result;
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // If an error occurred, and it's a Cumulonimbus ResponseError, return it.
      if (error instanceof Cumulonimbus.ResponseError) return error;
      // Otherwise, throw the error.
      throw error;
    } finally {
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Change the password of the current account.
  async function changePassword(
    newPassword: string,
    confirmNewPassword: string,
    oldPassword: string
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    // Set the loading state.
    loading.value = true;
    // Try to change the password.
    try {
      // Change the password. Use the old password to reauthenticate.
      // Only provide the password, that way we aren't changing data that we don't need to.
      account.value!.user = (
        await client.value!.editPassword(
          newPassword,
          confirmNewPassword,
          oldPassword
        )
      ).result;
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // If an error occurred, and it's a Cumulonimbus ResponseError, return it.
      if (error instanceof Cumulonimbus.ResponseError) return error;
      // Otherwise, throw the error.
      throw error;
    } finally {
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Change the domain selection of the current account.
  async function changeDomain(
    domain: string,
    subdomain?: string
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    // Set the loading state.
    loading.value = true;
    // Try to change the domain.
    try {
      // Change the domain, and if a subdomain is provided, change that too.
      account.value!.user = (
        await client.value!.editDomainSelection(domain, subdomain)
      ).result;
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // If an error occurred, and it's a Cumulonimbus ResponseError, return it.
      if (error instanceof Cumulonimbus.ResponseError) return error;
      // Otherwise, throw the error.
      throw error;
    } finally {
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Revoke all sessions of the current account.
  async function revokeSessions(
    includeSelf: boolean = false
  ): Promise<number | Cumulonimbus.ResponseError> {
    // Set the loading state.
    loading.value = true;
    // Try to revoke all sessions.
    try {
      // Revoke all sessions.
      const res = await client.value!.deleteAllSessions("me", includeSelf);
      // If nothing went wrong:
      // Logout if the current session was included.
      if (includeSelf) await logout();
      return res.result.count!;
    } catch (error) {
      // If an error occurred, and it's a Cumulonimbus ResponseError, return it.
      if (error instanceof Cumulonimbus.ResponseError) return error;
      // Otherwise, throw the error.
      throw error;
    } finally {
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Delete all files of the current account.
  async function deleteFiles(
    password: string
  ): Promise<number | Cumulonimbus.ResponseError> {
    // Set the loading state.
    loading.value = true;
    // Try to delete all files.
    try {
      // Delete all files and return the number of deleted files.
      return (await client.value!.deleteAllFiles("me", password)).result.count!;
    } catch (error) {
      // If an error occurred, and it's a Cumulonimbus ResponseError, return it.
      if (error instanceof Cumulonimbus.ResponseError) return error;
      // Otherwise, throw the error.
      throw error;
    } finally {
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Delete the current account.
  async function deleteAccount(
    username: string,
    password: string
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    // Set the loading state.
    loading.value = true;
    // Temporarily store the username to later remove it from the account switcher.
    // Try to delete the account.
    try {
      // Delete the account. Use the username to ensure the user really wants to delete their account, and use the password to reauthenticate.
      await client.value!.deleteUser("me", username, password);
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
      // If an error occurred, and it's a Cumulonimbus ResponseError, return it.
      if (error instanceof Cumulonimbus.ResponseError) return error;
      // Otherwise, throw the error.
      throw error;
    } finally {
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Manually refetch account and session data.
  async function refetch(): Promise<boolean | Cumulonimbus.ResponseError> {
    // Set the loading state.
    loading.value = true;
    // Try to refetch.
    try {
      // Refetch the account and session data.
      account.value = {
        user: (await client.value!.getUser()).result,
        session: {
          ...(await client.value!.getSession()).result,
          token: account.value!.session.token,
        },
      };
      // If nothing went wrong:
      // Return true to signify success.
      return true;
    } catch (error) {
      // If an error occurred, and it's a Cumulonimbus ResponseError, return it.
      if (error instanceof Cumulonimbus.ResponseError) return error;
      // Otherwise, throw the error.
      throw error;
    } finally {
      // Reset the loading state.
      loading.value = false;
    }
  }

  // Return account, client, loading, loggedIn, and all functions.
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
    changePassword,
    changeDomain,
    revokeSessions,
    deleteFiles,
    deleteAccount,
    refetch,
  };
});
