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
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { useRouter } from 'vue-router';

  function isExternal(url: string) {
    return ( ( url.indexOf(':') > -1 || url.indexOf('//') > -1 ));
  }

  const props = defineProps({
      title: {
        type: String,
        default: 'Go to Place',
      },
      to: {
        type: null,
        required: true,
      },
    }),
    router = useRouter(),
    displayLink = router.resolve(props.to).href;

  async function navigate() {
    if (!isExternal(props.to)) await router.push(props.to);
    else window.open(props.to, '_blank');
  }
</script>

<style>
  .quick-action-buttons-container a.router-button-link {
    margin-left: 5px;
    margin-right: 5px;
  }

  a.router-button-link {
    margin: 5px 0;
  }

  a.router-button-link button {
    margin: 0;
  }
</style>
