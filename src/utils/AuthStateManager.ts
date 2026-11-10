// In-House Modules
// No In-House Modules to import here.

// Store Modules
import { toastStore } from '$/toast.js';
import { userStore } from '$/user.js';

// External Modules
import { type Plugin } from 'vue';
import { type Router } from 'vue-router';
import { type Pinia } from 'pinia';

interface AuthStateManagerOptions {
  router: Router;
  pinia: Pinia;
}

const AuthStateManager: Plugin<[AuthStateManagerOptions] | []> = {
  install(app, options) {
    // Pull the pinia and router instance from global properties if not provided in options
    const pinia =
      (app.config.globalProperties.$pinia as Pinia | undefined) ||
      options?.pinia;
    const router =
      (app.config.globalProperties.$router as Router | undefined) ||
      options?.router;

    if (!pinia || !router)
      throw new Error(
        'AuthStateManager requires both pinia and router instances. Eat die and shit.',
      );

    // Initialize the user store with the provided pinia instance.
    const user = userStore(pinia),
      toast = toastStore(pinia);

    // Immediately register the navigation guard to handle authentication state changes.
    router.beforeEach(async (to) => {
      // Start and wait for rehydration.
      const sessionValid = await user.rehydrate();

      // Are we on the 404 page?
      if (to.name === '404') return;
      // Not logged in?
      if (to.meta.requiresAuth && !user.loggedIn) {
        if (sessionValid) toast.login();
        else toast.session();
        return {
          name: 'account-switcher',
          query: {
            redirect: to.fullPath,
          },
        };
      }
      // Not staff?
      if (to.meta.requiresStaff && !user.account!.user.staff) {
        toast.insufficientPermissions();
        return {
          path: '/',
        };
      }
      return;
    });
  },
};

export default AuthStateManager;
