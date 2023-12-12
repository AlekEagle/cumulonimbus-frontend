<template>
  <a :href="displayLink" @click.prevent.="navigate" tabindex="-1">
    <button :title="props.title">
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

  const props = defineProps({
      title: {
        type: String,
        default: 'Back',
      },
      fallback: {
        type: String,
        default: '/',
      },
    }),
    displayLink = computed(() => window.history.state.back || props.fallback),
    router = useRouter();

  async function navigate() {
    await backWithFallback(router, props.fallback, true);
  }
</script>
