import Cumulonimbus from 'cumulonimbus-wrapper';
import toLogin from './toLogin';
import { toastStore } from '@/stores/toast';
import { userStore } from '@/stores/user';
import { useRouter } from 'vue-router';

// Handle common errors from the API
export default async function defaultErrorHandler(
  error: Cumulonimbus.ResponseError
): Promise<boolean> {
  // Get the stores and components we need
  const router = useRouter(),
    user = userStore(),
    toast = toastStore();

  switch (error.code) {
    // If the user's account has been banned.
    case 'BANNED_ERROR':
      // Display the banned message
      toast.banned();
      // If the user is logged in, log them out.
      if (user.loggedIn) {
        // Reset the user store, because using the logout function would fail.
        user.account = null;
        user.client = null;
        // Send the user to the login page.
        await toLogin();
      }
      // Return true to indicate that the error was handled.
      return true;
    // If the user encounters a ratelimit.
    case 'RATELIMITED_ERROR':
      // Display the ratelimit message.
      toast.rateLimit(error);
      // Return true to indicate that the error was handled.
      return true;
    // If the user encounters an invalid/expired session.
    case 'INVALID_SESSION_ERROR':
      // Display the invalid session message.
      toast.session();
      // Log the user out.
      await toLogin();
      // Return true to indicate that the error was handled.
      return true;
    // If the user tries to perform an action that they do not have permission to perform.
    case 'INSUFFICIENT_PERMISSIONS_ERROR':
      // Display the insufficient permissions message.
      toast.insufficientPermissions();
      // Refresh stale user data.
      await user.refetch();
      // Send the user to the home page.
      await router.push('/');
      // Return true to indicate that the error was handled.
      return true;
    // If the user encounters an internal server error.
    case 'INTERNAL_ERROR':
      // Display the internal server error message.
      toast.serverError();
      // Return true to indicate that the error was handled.
      return true;
    // If the user encounters a generic error.
    case 'GENERIC_ERROR':
      // Display the generic error message.
      toast.genericError();
      // Log the error to the console.
      console.error(error);
      // Return true to indicate that the error was handled.
      return true;
    // If the user encounters a missing fields error.
    case 'MISSING_FIELDS_ERROR':
      // Display the missing fields message.
      toast.missingFields(error.fields!);
      // Return true to indicate that the error was handled.
      return true;
    // If the user encounters an invalid password error.
    case 'INVALID_PASSWORD_ERROR':
      // Display the invalid password message.
      toast.invalidPassword();
      // Return true to indicate that the error was handled.
      return true;
    default:
      // Log the error to the console.
      console.error(error);
      // The error was not handled, so return false.
      return false;
  }
}
