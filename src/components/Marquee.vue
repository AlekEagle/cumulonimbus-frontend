<!-- This component is heavily inspired by vue3-marquee by megasanjay, go check it out https://github.com/megasanjay/vue3-marquee -->
<template>
  <div
    :class="{
      'marquee': true,
      'vertical': vertical,
      'gradient': gradient,
      'pause': pause,
      'pause-on-hover': pauseOnHover,
      'clone': clone,
    }"
    ref="marquee"
  >
    <!-- Primary content tag -->
    <div class="inner" ref="inner">
      <slot></slot>
    </div>

    <!-- Clone content tag(s) -->
    <div class="inner" v-for="i in cloneAmt" :key="i">
      <slot></slot>
    </div>
    <!-- End clone content tag(s) -->
  </div>
</template>

<script setup lang="ts">
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref, onMounted, watchEffect, watch, onUnmounted } from 'vue';

  // Props
  const {
    vertical,
    direction = 'normal',
    duration = 10,
    timingFunction = 'linear',
    delay = 0,
    loop = 0,
    clone,
    gradient,
    gradientColor,
    gradientStops,
    pauseOnHover,
    pause,
  } = defineProps<{
    vertical?: boolean;
    direction?: 'normal' | 'reverse';
    duration?: number;
    timingFunction?: string;
    delay?: number;
    loop?: number;
    clone?: boolean;
    gradient?: boolean;
    gradientColor?: string;
    gradientStops?: number;
    pauseOnHover?: boolean;
    pause?: boolean;
  }>();

  // Refs
  const marquee = ref<HTMLDivElement>(),
    inner = ref<HTMLDivElement>(),
    cloneAmt = ref(0);

  // Methods
  // Find the closest parent element with a background color that isn't transparent.
  function getBackgroundColor(element: HTMLElement | undefined): string | null {
    if (!element) return null;
    const color = getComputedStyle(element).backgroundColor;
    if (
      (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') &&
      element.parentElement
    )
      return getBackgroundColor(element.parentElement);
    return color;
  }

  function calcCloneAmt() {
    // If our marquee and inner refs are not defined, return 0
    if (!marquee.value || !inner.value) return 0;

    // If we are not cloning, return 1 (we need to have at least one so the marquee can look like its entering as it leaves)
    if (!clone) return 1;

    // If we are vertical, calculate the amount of clones based on the height of the marquee and inner elements
    if (vertical) {
      return Math.ceil(marquee.value.clientHeight / inner.value.clientHeight);
    }

    // If we are horizontal, calculate the amount of clones based on the width of the marquee and inner elements
    return Math.ceil(marquee.value.clientWidth / inner.value.clientWidth);
  }

  // CSS Variable Watch Effects

  // --gradient-color
  watchEffect(() => {
    marquee.value?.style.setProperty(
      '--gradient-color',
      gradientColor ?? getBackgroundColor(marquee.value),
    );
  });
  // --gradient-stops
  watchEffect(() => {
    if (gradientStops) {
      marquee.value?.style.setProperty(
        '--gradient-stops',
        gradientStops.toString() + '%',
      );
    }
  });
  // --direction
  watchEffect(() => {
    marquee.value?.style.setProperty('--direction', direction);
  });
  // --duration
  watchEffect(() => {
    marquee.value?.style.setProperty('--duration', duration + 's');
  });
  // --timing-function
  watchEffect(() => {
    marquee.value?.style.setProperty('--timing-function', timingFunction);
  });
  // --delay
  watchEffect(() => {
    marquee.value?.style.setProperty('--delay', delay + 's');
  });
  // --loop
  watchEffect(() => {
    marquee.value?.style.setProperty(
      '--loop',
      loop < 1 ? 'infinite' : loop + '',
    );
  });
  watch(
    () => clone,
    () => {
      cloneAmt.value = calcCloneAmt();
    },
  );

  function resizeHandler() {
    cloneAmt.value = calcCloneAmt();
  }

  // Component Lifecycle Hooks
  onMounted(() => {
    // Calculate the amount of clones needed
    cloneAmt.value = calcCloneAmt();
    // Create an event listener for when the marquee is resized
    window.addEventListener('resize', resizeHandler);
  });

  onUnmounted(() => {
    // Remove the event listener when the component is unmounted
    window.removeEventListener('resize', resizeHandler);
  });
</script>

<style>
  @keyframes horizontal {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  @keyframes vertical {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-100%);
    }
  }

  .marquee {
    display: flex;
    position: relative;
  }

  .marquee:not(.vertical) {
    overflow-x: hidden;
    flex-direction: row;
    width: 100%;
    height: max-content;
  }

  .marquee.vertical {
    overflow-y: hidden;
    flex-direction: column;
    width: max-content;
    height: 100%;
  }

  .marquee.gradient:not(.vertical)::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    background: linear-gradient(
      to right,
      var(--gradient-color, #000) 0%,
      rgba(255, 255, 255, 0) var(--gradient-stops, 50%),
      rgba(255, 255, 255, 0) calc(100% - var(--gradient-stops, 50%)),
      var(--gradient-color, #000) 100%
    );
  }

  .marquee.gradient.vertical::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    background: linear-gradient(
      to bottom,
      var(--gradient-color, #000) 0%,
      rgba(255, 255, 255, 0) var(--gradient-stops, 50%),
      rgba(255, 255, 255, 0) calc(100% - var(--gradient-stops, 50%)),
      var(--gradient-color, #000) 100%
    );
  }

  .marquee .inner {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    animation-iteration-count: var(--loop, 1);
    animation-timing-function: var(--timing-function, linear);
    animation-duration: var(--duration, 10s);
    animation-delay: var(--delay, 0s);
    animation-direction: var(--direction, normal);
  }

  .marquee.pause .inner,
  .marquee.pause-on-hover:hover .inner {
    animation-play-state: paused;
  }

  .marquee:not(.clone) .inner {
    min-width: 100%;
    min-height: 100%;
  }

  .marquee:not(.vertical) .inner {
    animation-name: horizontal;
    flex-direction: row;
  }

  .marquee.vertical .inner {
    animation-name: vertical;
    flex-direction: column;
  }
</style>
