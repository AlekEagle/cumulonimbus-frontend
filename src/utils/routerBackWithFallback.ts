import { Router } from "vue-router";

export default async function backWithFallback(
  router: Router,
  fallback: string
) {
  if (window.history.length > 1) {
    router.back();
  } else {
    let current = router.currentRoute.value.fullPath;
    let fallbackResolved = (await router.resolve(fallback)).fullPath;
    window.history.replaceState(null, "", fallbackResolved);
    // await router.replace(fallback);
    window.history.pushState(null, "", current);
    // await router.push(current);
    window.history.back();
    // router.back();
  }
}
