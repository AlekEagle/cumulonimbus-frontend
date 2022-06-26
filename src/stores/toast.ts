import { defineStore } from "pinia";
import { ref } from "vue";
import { wait, waitFor } from "@/utils/wait";
import Cumulonimbus from "cumulonimbus-wrapper";

const toastTransitionDuration = 500;

// A store for managing toast messages
export const toastStore = defineStore("toast", () => {
  // The current text of the toast
  const text = ref("");
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
    const msg = `You have been ratelimited. Please try again in ${
      error.ratelimit!.reset - Math.floor(Date.now() / 1000)
    } seconds.`;
    // show the toast
    await show(msg);
  };

  // The function to display a toast regarding a banned user
  const banned = async () => {
    await show(
      "You have been banned from Cumulonimbus. Sorry for the inconvenience."
    );
  };

  // The function to display a toast regarding an invalid/expired session
  const session = async () => {
    await show("Your session has expired. Please log in again.");
  };

  // The function to display a toast regarding a client-side error
  const clientError = async () => {
    await show("I did something wrong, give me a second and try again.");
  };

  // The function to display a toast regarding a server-side error
  const serverError = async () => {
    await show(
      "The server did something wrong, give it a second and try again."
    );
  };

  // The function to display a toast regarding server connectivity
  const connectivity = async () => {
    await show("The server is not responding. Please try again later.");
  };

  return {
    text,
    visible,
    show,
    hide,
    rateLimit,
    banned,
    session,
    clientError,
    serverError,
    connectivity,
  };
});
