import { Router } from "vue-router";

export default async function backWithFallback(
  router: Router,
  fallback: string
) {
  if (window.history.state.back !== null) {
    router.back();
  } else {
    let current = router.currentRoute.value.fullPath;
    let fallbackResolved = (await router.resolve(fallback)).fullPath;
    window.history.replaceState(null, "", fallbackResolved);
    // await router.replace(fallback);
    window.history.pushState(null, "", current);
    console.log(window.history.state);
    // await router.push(current);
    router.back();
  }
}
