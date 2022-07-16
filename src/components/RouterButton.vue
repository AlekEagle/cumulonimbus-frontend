<template>
  <a
    :href="displayLink"
    @click.prevent="navigate"
    :title="props.title"
    tabindex="-1"
    class="router-button-link"
  >
    <button :title="props.title">
      <slot>Place</slot>
    </button>
  </a>
</template>

<script lang="ts" setup>
  import { useRouter } from 'vue-router';

  const props = defineProps({
      title: {
        type: String,
        default: 'Go to Place'
      },
      to: {
        type: null,
        required: true
      }
    }),
    router = useRouter(),
    displayLink = router.resolve(props.to).href;

  async function navigate() {
    await router.push(props.to);
  }
</script>
