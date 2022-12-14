import { Router } from "vue-router";

export default async function backWithFallback(
  router: Router,
  fallback: string
) {
  if (window.history.state.back !== null) {
    router.back();
  } else {
    let current = router.currentRoute.value.fullPath;
    let fallback = await router.resolve(fallback).fullPath;
    window.history.replaceState(null, "", fallback);
    // await router.replace(fallback);
    window.history.pushState(null, "", current);
    // await router.push(current);
    router.back();
  }
}
