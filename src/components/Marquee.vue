<template>
  <div
    :class="{
      'marquee': true,
      'edge-fade': edgeFade,
      'no-left-edge-fade': noLeftEdgeFade,
      'no-right-edge-fade': noRightEdgeFade,
      'vertical': direction === 'up' || direction === 'down',
    }"
    ref="marquee"
  >
    <div class="inner" ref="inner">
      <slot>
        <p>This is a default marquee text.</p>
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  import { wait } from '@/utils/wait';

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref, computed, onMounted, watchEffect } from 'vue';

  const {
    speed = 1,
    interval = 0,
    direction = 'left',
    overlap = 90,
    edgeFade,
    edgeFadeWidth = 20,
  } = defineProps<{
    speed?: number;
    interval?: number;
    direction?: 'left' | 'right' | 'up' | 'down';
    overlap?: number;
    edgeFade?: boolean;
    noLeftEdgeFade?: boolean;
    noRightEdgeFade?: boolean;
    edgeFadeWidth?: number;
  }>();

  const marquee = ref<HTMLDivElement>(),
    inner = ref<HTMLParagraphElement>(),
    progress = ref(20 * 1.25),
    parentBackgroundColor = computed(() => {
      // Find the closest parent element with a background color that isn't transparent.
      function getBackgroundColor(
        element: HTMLElement | undefined,
      ): string | null {
        if (!element) return null;
        const color = getComputedStyle(element).backgroundColor;
        if (
          (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') &&
          element.parentElement
        )
          return getBackgroundColor(element.parentElement);
        return color;
      }

      return getBackgroundColor(marquee.value);
    }),
    overlapFloat = computed(() => {
      return overlap / 100;
    }),
    content = computed(() => {
      // We only expect one child node in the inner element.
      return inner.value?.children[0];
    }),
    innerWidth = computed(() => {
      return inner.value?.clientWidth || 0;
    }),
    innerHeight = computed(() => {
      return inner.value?.clientHeight || 0;
    }),
    contentWidth = computed(() => {
      return content.value?.clientWidth || 0;
    }),
    contentHeight = computed(() => {
      return content.value?.clientHeight || 0;
    });

  watchEffect(() => {
    if (parentBackgroundColor.value && marquee.value)
      marquee.value?.style.setProperty(
        '--box-shadow-color',
        parentBackgroundColor.value,
      );
  });
  watchEffect(() => {
    if (edgeFade) {
      marquee.value?.style.setProperty(
        '--box-shadow-width',
        `${edgeFadeWidth}px`,
      );
    }
  });
  watchEffect(() => {
    marquee.value?.style.setProperty('--overlap', `${overlap}%`);
  });

  async function scrollHoriz() {
    if (!marquee.value || !inner.value || !content.value)
      throw new Error('Scroll loop started before refs were initialized.');

    switch (direction) {
      case 'left':
        progress.value -= speed;
        if (
          progress.value <=
          -(innerWidth.value * overlapFloat.value + contentWidth.value)
        ) {
          progress.value = 0;
          await wait(interval);
        }
        break;
      case 'right':
        progress.value += speed;
        if (
          progress.value >=
          innerWidth.value * overlapFloat.value - edgeFadeWidth * 4
        ) {
          progress.value = -contentWidth.value - edgeFadeWidth * 4;
          await wait(interval);
        }
        break;
    }

    inner.value.style.transform = `translateX(${progress.value}px)`;
    requestAnimationFrame(scrollHoriz);
  }

  function scrollVert() {
    if (!marquee.value || !inner.value || !content.value)
      throw new Error('Scroll loop started before refs were initialized.');

    progress.value -= speed;
    if (
      progress.value <=
      -(innerHeight.value * overlapFloat.value + contentHeight.value)
    ) {
      progress.value = 0;
    }

    inner.value.style.transform = `translateY(${progress.value}px)`;
    requestAnimationFrame(scrollVert);
  }

  onMounted(() => {
    // TODO: Clone the content element and append it to the inner element as needed to create a seamless loop regardless of the overlap percentage.
    new Array(Math.ceil(1 / overlapFloat.value)).fill(0).forEach(() => {
      inner.value?.appendChild(content.value?.cloneNode(true)!);
    });

    // Start the scroll loop.
    switch (direction) {
      case 'right':
        progress.value = -contentWidth.value - edgeFadeWidth * 4;
      case 'left':
        scrollHoriz();
        break;
      case 'up':
      case 'down':
        // TODO: Implement vertical scrolling properly.
        console.warn('Vertical scrolling is not yet properly implemented.');
        scrollVert();
        break;
    }
  });
</script>

<style>
  .marquee {
    width: 100%;
    position: relative;
  }

  .marquee:after {
    content: '';
    position: absolute;
    top: 0px;
    right: 0px;
    height: 100%;
    width: 100%;
  }

  .marquee.edge-fade:not(.vertical):after {
    /* Left falloff shadow */
    box-shadow: inset calc(var(--box-shadow-width) * 2.5) 0
        var(--box-shadow-width) calc(-1.5 * var(--box-shadow-width))
        var(--box-shadow-color, var(--background)),
      /* Right falloff shadow                                                      */
        inset calc(var(--box-shadow-width) * -2.5) 0 var(--box-shadow-width)
        calc(-1.5 * var(--box-shadow-width))
        var(--box-shadow-color, var(--background));
  }

  .marquee.no-left-edge-fade:not(.vertical):after {
    /* Right falloff shadow */
    box-shadow: inset calc(var(--box-shadow-width) * -2.5) 0
      var(--box-shadow-width) calc(-1.5 * var(--box-shadow-width))
      var(--box-shadow-color, var(--background));
  }

  .marquee.no-right-edge-fade:not(.vertical):after {
    /* Left falloff shadow */
    box-shadow: inset calc(var(--box-shadow-width) * 2.5) 0
      var(--box-shadow-width) calc(-1.5 * var(--box-shadow-width))
      var(--box-shadow-color, var(--background));
  }

  .marquee .inner {
    width: 100%;
    text-align: left;
    position: relative;
    white-space: nowrap;
  }

  .marquee .inner > * {
    display: inline-block;
  }

  .marquee .inner > *:not(:last-child) {
    margin-right: var(--overlap);
  }
</style>
