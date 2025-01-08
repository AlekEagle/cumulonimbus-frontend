<template>
  <a :href="displayLink" @click.prevent.="navigate" tabindex="-1">
    <button :title="title">
      <slot>Back</slot>
    </button>
  </a>
</template>

<script lang="ts" setup>
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  import backWithFallback from '@/utils/routerBackWithFallback';

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';

  const { title = 'Back', fallback = '/' } = defineProps<{
      title?: string;
      fallback?: string;
    }>(),
    displayLink = computed(() => window.history.state.back || fallback),
    router = useRouter();

  async function navigate() {
    await backWithFallback(router, fallback, true);
  }
</script>
