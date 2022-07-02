import { Router } from 'vue-router';

export default async function backWithFallback(
  router: Router,
  fallback: string
) {
  if (window.history.state.back !== null) {
    router.back();
  } else {
    let current = router.currentRoute.value.fullPath;
    await router.replace(fallback);
    await router.push(current);
    router.back();
  }
}
