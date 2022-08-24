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

<style>
  .quick-action-buttons-container {
    margin-left: 5px;
    margin-right: 5px;s
  }

  a.router-button-link {
    margin: 5px 0;
  }

  a.router-button-link button {
    margin: 0;
  }