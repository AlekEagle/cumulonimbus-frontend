import { Router } from "vue-router";

export default async function backWithFallback(
  router: Router,
  fallback: string,
  fallbackWithoutRouter: boolean = false
) {
  let current = router.currentRoute.value;
  let fallbackResolved = await router.resolve(fallback);
  if (window.history.state.back != null) {
    router.back();
  } else {
    if (!fallbackWithoutRouter) {
      await router.replace(fallback);
      await router.push(current);
      router.back();
    } else {
      window.history.replaceState(
        {
          back: null,
          current: fallbackResolved.fullPath,
          forward: null,
          position: 0,
          replaced: true,
          scroll: { top: 0, left: 0 },
        },
        "",
        fallbackResolved.fullPath
      );
      window.history.pushState(
        {
          back: fallbackResolved.fullPath,
          current: current.fullPath,
          forward: null,
          position: 1,
          replaced: false,
          scroll: null,
        },
        "",
        current.fullPath
      );
      router.back();
    }
  }
}
