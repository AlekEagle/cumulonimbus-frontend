import { defineStore } from 'pinia';
import { ref } from 'vue';
import { wait, waitFor } from '@/utils/wait';
import Cumulonimbus from 'cumulonimbus-wrapper';
import toTimeString from '@/utils/toTimeString';

const toastTransitionDuration = 500;

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toLocaleUpperCase() + string.slice(1);
}

// A store for managing toast messages
export const toastStore = defineStore('toast', () => {
  // The current text of the toast
  const text = ref('');
  // The current visibility of the toast
  const visible = ref(false);
  // The timeout to automatically hide the toast
  const timeout = ref<number | null>(null);
  // Whether the toast is currently animating
  const animating = ref(false);

  // The function to show a toast
  const show = async (msg: string, duration: number = 3000) => {
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
    text.value = msg;
    // Set the visibility of the toast
    visible.value = true;
    // wait for the toast to transition in
    animating.value = true;
    await wait(toastTransitionDuration);
    animating.value = false;
    // Set the timeout to hide the toast
    timeout.value = setTimeout(hide, duration);
  };

  // The function to hide the toast
  const hide = async () => {
    // Check if the toast is currently animating
    if (animating.value) {
      // If it is, wait for it to finish
      await waitFor(animating, false);
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

  // The function to display a toast regarding a rate limit error
  const rateLimit = async (error: Cumulonimbus.ResponseError) => {
    // construct the message
    const msg = `You have been ratelimited. Please try again in ${toTimeString(
      (error.ratelimit!.reset - Math.floor(Date.now() / 1000)) * 1000
    )}.`;
    // show the toast
    await show(msg);
  };

  // The function to display a toast regarding a banned user
  const banned = async () => {
    await show(
      'You have been banned from Cumulonimbus. Sorry for the inconvenience.'
    );
  };

  // The function to display a toast regarding an invalid/expired session
  const session = async () => {
    await show('Your session has expired. Please log in again.');
  };

  // The function to display a toast telling the user they need to log in to do something
  const login = async () => {
    await show('Whoops! Looks like you need to log in before we do that!');
  };

  // The function to display a toast regarding insufficient permissions
  const insufficientPermissions = async () => {
    await show("Nuh uh uh! You didn't say the magic word!");
  };

  // The function to display a toast regarding a client-side error
  const clientError = async () => {
    await show('I did something wrong, give me a second and try again.');
  };

  // The function to display a toast regarding a server-side error
  const serverError = async () => {
    await show(
      'The server did something wrong, give it a second and try again.'
    );
  };

  // The function to display a toast regarding a generic error
  const genericError = async () => {
    await show(
      "Someone did something wrong, I don't know who. Give it a second and try again."
    );
  };

  // The function to display a toast regarding missing fields
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
      `Whoops! Looks like you missed something! Please double-check: ${fieldsNormalized}`
    );
  };

  // The function to display a toast regarding an incorrect username/email
  const invalidUsernameEmail = async () => {
    await show("I can't find anyone with that username or email!");
  };

  // The function to display a toast regarding an incorrect password
  const invalidPassword = async () => {
    await show('No, that is not the password.');
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
    missingFields,
    invalidUsernameEmail,
    invalidPassword,
    connectivityOffline,
    connectivityChangeOnline,
    connectivityChangeOffline
  };
});
