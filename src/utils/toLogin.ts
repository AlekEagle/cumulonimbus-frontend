import { useRouter } from 'vue-router';
import { userStore } from '@/stores/user';

export default async function toLogin() {
  const user = userStore(),
    router = useRouter();
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
