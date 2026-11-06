// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';

// Other Store Modules
// No Other Store Modules to import here.

// External Modules
import { ref } from 'vue';
import { defineStore } from 'pinia';

export enum ToastType {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface StandardToast {
  id: string;
  createdAt: number;
  text: string;
  type: ToastType;
  duration: number;
}

export interface RatelimitToast {
  id: string;
  createdAt: number;
  type: ToastType;
  duration: number;
  cRE: Cumulonimbus.ResponseError;
}

export type Toast = StandardToast | RatelimitToast;

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toLocaleUpperCase() + string.slice(1);
}

// Store Definition
export const toastStore = defineStore('toast', () => {
  // Map of active toasts
  const toasts = ref<Record<string, Toast>>({});

  // The function to show a toast
  const show = (
    msgOrToast:
      | string
      | Omit<RatelimitToast, 'id' | 'createdAt'>
      | Omit<StandardToast, 'id' | 'createdAt'>,
    type: ToastType = ToastType.INFO,
    duration: number = 3000,
  ) => {
    const id =
      'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2);
    let toast: Toast;
    if (typeof msgOrToast === 'object') {
      toast = {
        id: id,
        createdAt: -1,
        ...msgOrToast,
      } as Toast;
    } else {
      toast = {
        id: id,
        createdAt: -1,
        text: msgOrToast,
        type,
        duration,
      };
    }
    toasts.value[toast.id] = toast;
    return toast.id;
  };

  // The function to hide the toast
  const hide = (toastID: string) => {
    const deletedToast = toasts.value[toastID];
    delete toasts.value[toastID];
    return deletedToast;
  };

  // A toast for a rate limit cooldown.
  const rateLimit = (error: Cumulonimbus.ResponseError) => {
    return show({
      type: ToastType.WARNING,
      duration: 5000,
      cRE: error,
    });
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
  const missingFields = (fields: string[]) => {
    // Capitalize the first letter of each field, and join them with commas, putting an "and" before the last one
    const fieldsNormalized =
      fields.length === 1
        ? capitalizeFirstLetter(fields[0])
        : fields
            .map(capitalizeFirstLetter)
            .join(', ')
            .replace(/, ([^,]*)$/, ', and $1');
    return show(
      `Whoops! Looks like you missed something! Please double-check: ${fieldsNormalized}`,
    );
  };

  // A toast to inform a user trying to log in that
  const userNotFound = () => {
    return show("I can't find anyone with that username!");
  };

  // A toast to inform a user that their email is not verified
  const emailNotVerified = () => {
    return show(
      'Your email is not verified. Please check your email and try again.',
    );
  };

  // The function to display a toast regarding an incorrect password
  const invalidPassword = () => {
    return show('No, that is not the password.');
  };

  const serviceUnavailable = () => {
    return show(
      'It looks like Cumulonimbus is currently unavailable. Please try again later.',
    );
  };

  const secondFactorRequired = () => {
    return show(
      'You must have a second factor enabled to access this resource.',
    );
  };

  const invalidSecondFactorResponse = async () => {
    await show('Your second factor response was incorrect or has expired.');
  };

  return {
    toasts,
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
  };
});
