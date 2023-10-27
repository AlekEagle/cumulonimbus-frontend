<template>
  <h1>Testing Link Sink</h1>
  <h2>All links from the testing page lead here.</h2>
  <div class="quick-action-buttons-container">
    <RouterLink to="/testing/hush/dont/touch">
      <button>RouterLink to Testing</button>
    </RouterLink>
    <BackButton fallback="/testing/hush/dont/touch">
      BackButton to Testing
    </BackButton>
  </div>
</template>

<script lang="ts" setup>
  import BackButton from '@/components/BackButton.vue';
</script>
