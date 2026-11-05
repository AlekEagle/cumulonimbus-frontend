<template>
  <QuickHeader>
    <template #title>{{ name }}</template>
    <template #subtitle>
      Here's our {{ name.toLowerCase() }}, last updated {{ updated }}.
    </template>
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
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const name = computed(() => route.meta.documentName as string);
  const updated = computed(() => route.meta.updated as string);
</script>
