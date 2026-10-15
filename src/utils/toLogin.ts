import { Router } from 'vue-router';
import { userStore } from '@/stores/user.js';

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
