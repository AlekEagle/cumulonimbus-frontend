<template>
  <h1 class="specific">{{ name }}</h1>
  <p>Here's our {{ name.toLowerCase() }}, last updated {{ updated }}.</p>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  const route = useRoute();
  const name = computed(() => route.meta.documentName as string);
  const updated = computed(() => route.meta.updated as string);
</script>
