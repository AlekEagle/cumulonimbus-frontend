<template>
  <Transition name="fullscreen-loading-blurb">
    <div v-if="isVisible" class="fullscreen-loading-blurb">
      <LoadingBlurb />
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { wait } from "@/utils/wait";
import LoadingBlurb from "./LoadingBlurb.vue";

const isVisible = ref(false);

async function show() {
  isVisible.value = true;
  await wait(400);
}

async function hide() {
  isVisible.value = false;
  await wait(400);
}

defineExpose({
  show,
  hide,
});
</script>

<style>
.fullscreen-loading-blurb {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: var(--ui-fs-overlay-background);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 20;
  display: grid;
  grid: auto / auto;
  justify-content: center;
  align-content: center;
  justify-items: center;
  cursor: progress;
}

.fullscreen-loading-blurb-enter-active,
.fullscreen-loading-blurb-leave-active {
  transition: opacity 0.4s, backdrop-filter 0.4s, -webkit-backdrop-filter 0.4s;
}

.fullscreen-loading-blurb-enter-from,
.fullscreen-loading-blurb-leave-to {
  opacity: 0;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.fullscreen-loading-blurb-enter-to,
.fullscreen-loading-blurb-leave-from {
  opacity: 1;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}
</style>
