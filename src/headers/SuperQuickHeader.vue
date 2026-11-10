<template>
  <QuickHeader>
    <template #title>{{ route.meta.header!.title }}</template>
    <template #subtitle>{{ route.meta.header!.subtitle }}</template>
  </QuickHeader>
</template>

<script setup lang="ts">
  // Vue Components
  import QuickHeader from '&/QuickHeader.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { useRoute } from 'vue-router';

  const route = useRoute();

  if (!route.meta.header) {
    throw new Error('Route meta header is not defined.');
  }
</script>
