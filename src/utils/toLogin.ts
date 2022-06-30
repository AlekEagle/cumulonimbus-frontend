import { Router } from 'vue-router';

export default async function toLogin(router: Router) {
  return await router.replace({
    name: 'auth',
    query: {
      redirect: router.currentRoute.value.fullPath
    }
  });
}
