<template>
  <div class="toast-container">
    <template v-for="t in toast.toasts" :key="t.id">
      <Transition name="toast-transition">
        <ToastEntry :toast="t.id" />
      </Transition>
    </template>
  </div>
</template>

<script setup lang="ts">
  // Vue Components
  import ToastEntry from './ToastEntry.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  import { toastStore } from '$/toast.js';

  // External Modules
  // No External Modules to import here.

  const toast = toastStore();
</script>

<style scoped>
  .toast-container {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    display: flex;
    width: calc(100% - 2rem);
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
    z-index: 9999;
    pointer-events: none;
  }

  .toast-transition-enter-active,
  .toast-transition-leave-active {
    transition: all 0.3s ease;
  }

  .toast-transition-enter-from,
  .toast-transition-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }
  .toast-transition-enter-to,
  .toast-transition-leave-from {
    transform: translateX(0);
    opacity: 1;
  }
</style>
