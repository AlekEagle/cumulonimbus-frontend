<template>
  <button
    class="button"
    @click="toast.show('This is an info toast.', ToastType.INFO, 5e3)"
    >Show Info Toast</button
  >
  <button
    class="button"
    @click="
      toast.show('Wahoo! This is a success toast.', ToastType.SUCCESS, 5e3)
    "
    >Show Success Toast</button
  >
  <button
    class="button"
    @click="
      toast.show('Heads up! This is a warning toast.', ToastType.WARNING, 5e3)
    "
    >Show Warning Toast</button
  >
  <button
    class="button"
    @click="toast.show('Oh no! This is an error toast.', ToastType.ERROR, 5e3)"
    >Show Error Toast</button
  >
</template>

<script setup lang="ts">
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  import { toastStore, ToastType } from '$/toast.js';

  // External Modules
  // No External Modules to import here.

  const toast = toastStore();
</script>
