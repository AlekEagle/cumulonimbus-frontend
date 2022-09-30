import { Router } from 'vue-router';
import { userStore } from '@/stores/user';

export default async function toLogin(router: Router) {
  const user = userStore();
  if (user.loggedIn) {
    await user.logout();
  }
  return await router.replace({
    name: 'account-switcher',
    query: {
      redirect: router.currentRoute.value.fullPath
    }
  });
}
