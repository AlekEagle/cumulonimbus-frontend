<template>
  <section class="content hero-content">
    <h1 class="specific">{{ name }}</h1>
    <p>Here's our {{ name.toLowerCase() }}, last updated {{ updated }}.</p>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  const route = useRoute();
  const name = computed(() => route.meta.documentName as string);
  const updated = computed(() => route.meta.updated as string);
</script>

<style scoped>
  .hero-content {
    position: relative;
    z-index: 2;
    padding-block: clamp(2rem, 6vw, 5.5rem) 0;
    max-width: 60rem;
  }
</style>
