<template>
  <a :href="displayLink" @click.prevent="navigate" tabindex="-1">
    <button :title="props.title">
      <slot>Back</slot>
    </button>
  </a>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import backWithFallback from '@/utils/routerBackWithFallback';

  const props = defineProps({
      title: {
        type: String,
        default: 'Back'
      },
      fallback: {
        type: String,
        default: '/'
      }
    }),
    displayLink = ref(''),
    router = useRouter();

  onMounted(() => {
    displayLink.value = window.history.state.back || props.fallback;
  });

  async function navigate() {
    await backWithFallback(router, props.fallback);
  }
</script>
