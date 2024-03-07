<template>
  <Transition name="fullscreen-loading-message">
    <div v-if="isVisible" class="fullscreen-loading-message">
      <LoadingMessage spinner />
    </div>
  </Transition>
</template>

<script lang="ts" setup>
  // Vue Components
  import LoadingMessage from './LoadingMessage.vue';

  // In-House Modules
  import { wait } from '@/utils/wait';

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref } from 'vue';

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
  .fullscreen-loading-message {
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

  .fullscreen-loading-message-enter-active,
  .fullscreen-loading-message-leave-active {
    transition: opacity 0.4s, backdrop-filter 0.4s, -webkit-backdrop-filter 0.4s;
  }

  .fullscreen-loading-message-enter-from,
  .fullscreen-loading-message-leave-to {
    opacity: 0;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .fullscreen-loading-message-enter-to,
  .fullscreen-loading-message-leave-from {
    opacity: 1;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }
</style>
