<template>
  <a :href="displayLink" @click.prevent="navigate">
    <button :title="props.title">
      <slot>Back</slot>
    </button>
  </a>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
    title: {
      type: String,
      default: "Back",
    },
    fallback: {
      type: String,
      default: "/",
    },
  }),
  displayLink = ref(""),
  router = useRouter();

onMounted(() => {
  displayLink.value = window.history.state.back || props.fallback;
});

async function navigate() {
  if (window.history.state.back !== null) {
    router.back();
  } else {
    let current = window.location.pathname;
    await router.replace(props.fallback);
    await router.push(current);
    router.back();
  }
}
</script>
