// In-House Modules
// No In-House Modules to import here.

// Store Modules
// No Store Modules to import here.

// External Modules
import {
  ref,
  toValue,
  watch,
  onUnmounted,
  type Ref,
  type MaybeRefOrGetter,
} from 'vue';

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function waitFor<T>(
  observee: Ref<T>,
  matchValue: T,
  signal?: AbortSignal,
): Promise<void> {
  return waitUntil(observee, (v) => v === matchValue, signal);
}

export function waitUntil<T>(
  observee: Ref<T>,
  predicate: (value: T) => boolean,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    let unwatch: (() => void) | undefined;
    const onAbort = () => {
      cleanup();
      reject(signal!.reason);
    };
    const cleanup = () => {
      unwatch?.();
      signal?.removeEventListener('abort', onAbort);
    };

    unwatch = watch(
      observee,
      (value) => {
        if (!predicate(value)) return;
        cleanup();
        resolve();
      },
      { immediate: true },
    );
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export function whileInWindow(
  then: MaybeRefOrGetter<number | null | undefined>,
  durationMs: MaybeRefOrGetter<number | null | undefined>,
  padMs: MaybeRefOrGetter<number> = 300,
): Ref<boolean> {
  const active = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clear = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };
  const tick = () => {
    clear();
    const t = toValue(then);
    const d = toValue(durationMs);
    if (t == null || d == null || !Number.isFinite(t) || !Number.isFinite(d)) {
      active.value = false;
      return;
    }
    const start = t + toValue(padMs);
    const end = start + d;
    const now = Date.now();
    active.value = now > start && now < end;
    if (now >= end) return;
    const next = now <= start ? start + 1 - now : Math.min(end - now, 250);
    timer = setTimeout(tick, Math.max(next, 16));
  };
  watch(
    [() => toValue(then), () => toValue(durationMs), () => toValue(padMs)],
    tick,
    {
      immediate: true,
    },
  );
  onUnmounted(clear);
  return active;
}
