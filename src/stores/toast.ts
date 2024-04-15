// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import { addSeconds, useTimeString } from '@/utils/time';
import { wait, waitFor } from '@/utils/wait';

// Other Store Modules
// No Other Store Modules to import here.

// External Modules
import { computed, Ref, ref, unref, watch, WatchStopHandle } from 'vue';
import { defineStore } from 'pinia';

const toastTransitionDuration = 500;

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toLocaleUpperCase() + string.slice(1);
}

// Store Definition
export const toastStore = defineStore('toast', () => {
  // The current text of the toast
  const text = ref('');
  // Watcher for reactive text
  const watcher = ref<WatchStopHandle | null>(null);
  // The current visibility of the toast
  const visible = ref(false);
  // The timeout to automatically hide the toast
  const timeout = ref<number | null>(null);
  // Whether the toast is currently animating
  const animating = ref(false);

  // The function to show a toast
  const show = async (msg: string | Ref<string>, duration: number = 3000) => {
    // Check if the toast is currently animating
    if (animating.value) {
      // If it is, wait for it to finish
      await waitFor(animating, false);
    }
    // Check if the toast is currently visible
    if (visible.value) {
      // If it is, hide it
      await hide();
    }

    // Set the text of the toast
    text.value = unref(msg);
    // If the text is reactive, watch it
    if (typeof msg !== 'string') {
      watcher.value = watch(msg, (newMsg) => {
        text.value = newMsg;
      });
    }
    // Set the visibility of the toast
    visible.value = true;
    // wait for the toast to transition in
    animating.value = true;
    await wait(toastTransitionDuration);
    animating.value = false;
    // Set the timeout to hide the toast
    // @ts-expect-error Blame @types/qrcode for this error
    timeout.value = setTimeout(hide, duration);
  };

  // The function to hide the toast
  const hide = async () => {
    // Check if the toast is currently animating
    if (animating.value) {
      // If it is, wait for it to finish
      await waitFor(animating, false);
    }

    // Check if we were watching a reactive text
    if (watcher.value) {
      // If we were, stop watching it
      watcher.value();
      watcher.value = null;
    }

    // Clear the timeout to hide the toast
    if (timeout.value) {
      clearTimeout(timeout.value);
      timeout.value = null;
    }

    // Set the visibility of the toast
    visible.value = false;
    // wait for the toast to transition out
    animating.value = true;
    await wait(toastTransitionDuration);
    animating.value = false;
  };

  // A toast for a rate limit cooldown.
  const rateLimit = async (error: Cumulonimbus.ResponseError) => {
    // Take reset time (time until the rate limit resets in seconds) and convert it to a date
    const reset = addSeconds(new Date(Date.now()), error.ratelimit!.reset);
    // construct the message
    const msg = computed(() => {
      const toTimeString = useTimeString(ref(reset));
      return `You are being rate limited! Please wait ${toTimeString.value} before trying again.`;
    });
    // show the toast
    await show(msg, 10000);
  };

  // A toast for when a user that is banned makes an API call.
  const banned = async () => {
    await show(
      'You have been banned from Cumulonimbus. Sorry for the inconvenience.',
    );
  };

  // A toast for when a user's session is invalid or has expired.
  const session = async () => {
    await show('Your session has expired. Please log in again.');
  };

  // A toast for when a user tries to do something that requires them to be logged in.
  const login = async () => {
    await show('Whoops! Looks like you need to log in before we do that!');
  };

  // A toast for when a user tries to access an endpoint they don't have permission to.
  const insufficientPermissions = async () => {
    await show("Nuh uh uh! You didn't say the magic word!");
  };

  // A toast for a client-side error.
  const clientError = async () => {
    await show('I did something wrong, give me a second and try again.');
  };

  // A toast for a server-side error.
  const serverError = async () => {
    await show(
      'The server did something wrong, give it a second and try again.',
    );
  };

  // A toast for a generic error.
  const genericError = async () => {
    await show(
      "Someone did something wrong, I don't know who. Give it a second and try again.",
    );
  };

  // A toast for when a new version of Cumulonimbus is being acquired.
  const updating = async () => {
    await show('Updating Cumulonimbus, please wait...');
  };

  // A toast for when a new version of Cumulonimbus is available.
  const updateComplete = async () => {
    await show('Cumulonimbus has been updated! Refresh to see the changes.');
  };

  // A toast for when we failed updating Cumulonimbus.
  const updateFailed = async () => {
    await show('Cumulonimbus failed to update. Please refresh to try again.');
  };

  // A toast to inform the user that they are missing required fields.
  const missingFields = async (fields: string[]) => {
    // Capitalize the first letter of each field, and join them with commas, putting an "and" before the last one
    const fieldsNormalized =
      fields.length === 1
        ? capitalizeFirstLetter(fields[0])
        : fields
            .map(capitalizeFirstLetter)
            .join(', ')
            .replace(/, ([^,]*)$/, ', and $1');
    await show(
      `Whoops! Looks like you missed something! Please double-check: ${fieldsNormalized}`,
    );
  };

  // A toast to inform a user trying to log in that
  const userNotFound = async () => {
    await show("I can't find anyone with that username!");
  };

  // A toast to inform a user that their email is not verified
  const emailNotVerified = async () => {
    await show(
      'Your email is not verified. Please check your email and try again.',
    );
  };

  // The function to display a toast regarding an incorrect password
  const invalidPassword = async () => {
    await show('No, that is not the password.');
  };

  const serviceUnavailable = async () => {
    await show(
      'It looks like Cumulonimbus is currently unavailable. Please try again later.',
    );
  };

  const secondFactorRequired = async () => {
    await show(
      'You must have a second factor enabled to access this resource.',
    );
  };

  const invalidSecondFactorResponse = async () => {
    await show('Your second factor response was incorrect or has expired.');
  };

  // The function to display a toast regarding client internet connectivity
  const connectivityOffline = async () => {
    await show('It seems like you are offline. Please try again later.');
  };

  // The function to display a toast regarding the client's internet connectivity changing to online
  const connectivityChangeOnline = async () => {
    await show("You're back online! Everything should be working as expected.");
  };

  // The function to display a toast regarding the client's internet connectivity changing to offline
  const connectivityChangeOffline = async () => {
    await show("Looks like you went offline. You won't be able to do much.");
  };

  return {
    text,
    visible,
    show,
    hide,
    rateLimit,
    banned,
    session,
    insufficientPermissions,
    login,
    clientError,
    serverError,
    genericError,
    updating,
    updateComplete,
    updateFailed,
    missingFields,
    userNotFound,
    emailNotVerified,
    invalidPassword,
    serviceUnavailable,
    secondFactorRequired,
    invalidSecondFactorResponse,
    connectivityOffline,
    connectivityChangeOnline,
    connectivityChangeOffline,
  };
});
