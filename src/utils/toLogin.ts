import { Router } from 'vue-router';
import { userStore } from '@/stores/user';

export default async function toLogin(router: Router) {
  const user = userStore();
  if (user.loggedIn) {
    if (typeof (await user.logout()) !== 'boolean') await user.logout(true);
  }
  return await router.replace({
    name: 'auth',
    query: {
      redirect: router.currentRoute.value.fullPath
    }
  });
}
