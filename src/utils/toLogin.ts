// In-House Modules
// No In-House Modules to import here.

// Store Modules
import { userStore } from '$/user.js';

// External Modules
import { Router } from 'vue-router';

export default async function toLogin(
  router: Router,
  skipLogout: boolean = false,
) {
  const user = userStore();
  if (user.loggedIn && !skipLogout) {
    await user.logout();
  }
  return await router.replace({
    name: 'account-switcher',
    query: {
      redirect: router.currentRoute.value.fullPath,
    },
  });
}
