import Cumulonimbus from 'cumulonimbus-wrapper';
import toLogin from './toLogin';
import { toastStore } from '@/stores/toast';
import { userStore } from '@/stores/user';
import { Router } from 'vue-router';

// TODO: Unify error handling across the app. Behavior between components and pages is inconsistent to say the least.

export type ErrorHandledReason = 'NOT_RESPONSE_ERROR' | 'NOT_HANDLED' | 'OK';
export type HandledErrors =
  | 'BANNED_ERROR'
  | 'RATELIMITED_ERROR'
  | 'INVALID_SESSION_ERROR'
  | 'INSUFFICIENT_PERMISSIONS_ERROR'
  | 'INTERNAL_ERROR'
  | 'MISSING_FIELDS_ERROR'
  | 'INVALID_PASSWORD_ERROR'
  | 'EMAIL_NOT_VERIFIED_ERROR';

// Handle common errors from the API
export default async function defaultErrorHandler(
  error: any,
  router: Router,
  override: HandledErrors[] = [],
): Promise<ErrorHandledReason> {
  // Get the stores and components we need
  const user = userStore(),
    toast = toastStore();

  if (!(error instanceof Cumulonimbus.ResponseError)) {
    // Log the error to the console.
    console.trace(
      'Non-ResponseError Error Passed to Handler. Dropping...',
      error,
    );
    // Display generic error message.
    toast.genericError();
    return 'NOT_RESPONSE_ERROR';
  }

  switch (error.code) {
    // If the user's account has been banned.
    case 'BANNED_ERROR':
      // If the error is being overridden, return NOT_HANDLED.
      if (override.includes('BANNED_ERROR')) return 'NOT_HANDLED';
      // Display the banned message
      toast.banned();
      // If the user is logged in, log them out.
      if (user.loggedIn) {
        // Reset the user store, because using the logout function would fail.
        user.account = null;
        user.client = null;
        // Send the user to the login page.
        await toLogin(router);
      }
      return 'OK';
    // If the user encounters a ratelimit.
    case 'RATELIMITED_ERROR':
      // If the error is being overridden, return NOT_HANDLED.
      if (override.includes('RATELIMITED_ERROR')) return 'NOT_HANDLED';
      // Display the ratelimit message.
      toast.rateLimit(error);
      return 'OK';
    // If the user encounters an invalid/expired session.
    case 'INVALID_SESSION_ERROR':
      // If the error is being overridden, return NOT_HANDLED.
      if (override.includes('INVALID_SESSION_ERROR')) return 'NOT_HANDLED';
      // Display the invalid session message.
      toast.session();
      // Log the user out.
      await toLogin(router);
      return 'OK';
    // If the user tries to perform an action that they do not have permission to perform.
    case 'INSUFFICIENT_PERMISSIONS_ERROR':
      // If the error is being overridden, return NOT_HANDLED.
      if (override.includes('INSUFFICIENT_PERMISSIONS_ERROR'))
        return 'NOT_HANDLED';
      // Display the insufficient permissions message.
      toast.insufficientPermissions();
      // Refresh stale user data.
      await user.refetch();
      // Send the user to the home page.
      await router.push('/');
      return 'OK';
    // If the user encounters an internal server error.
    case 'INTERNAL_ERROR':
      // If the error is being overridden, return NOT_HANDLED.
      if (override.includes('INTERNAL_ERROR')) return 'NOT_HANDLED';
      // Display the internal server error message.
      toast.serverError();
      return 'OK';
    case 'MISSING_FIELDS_ERROR':
      // If the error is being overridden, return NOT_HANDLED.
      if (override.includes('MISSING_FIELDS_ERROR')) return 'NOT_HANDLED';
      // Display the missing fields message.
      toast.missingFields(error.fields!);
      return 'OK';
    // If the user encounters an invalid password error.
    case 'INVALID_PASSWORD_ERROR':
      // If the error is being overridden, return NOT_HANDLED.
      if (override.includes('INVALID_PASSWORD_ERROR')) return 'NOT_HANDLED';
      // Display the invalid password message.
      toast.invalidPassword();
      return 'OK';
    // If the user encounters an email not verified error.
    case 'EMAIL_NOT_VERIFIED_ERROR':
      // If the error is being overridden, return NOT_HANDLED.
      if (override.includes('EMAIL_NOT_VERIFIED_ERROR')) return 'NOT_HANDLED';
      // Display the email not verified message.
      toast.emailNotVerified();
      return 'OK';
    default:
      // Log the error to the console.
      console.trace(
        'ResponseError unable to be handled by default handler. Dropping... ',
        error,
      );
      // The error was not handled, so return false.
      return 'NOT_HANDLED';
  }
}
