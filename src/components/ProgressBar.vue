<template>
  <span class="progress-indicator">{{ props.progress.toFixed(0) }}%</span>
  <div class="progress-bar-container">
    <div
      class="progress-bar"
      :style="{ width: `calc(${props.progress}% - 4px)` }"
    />
  </div>
</template>

<script lang="ts" setup>
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  // No External Modules to import here.

  const props = defineProps<{
    progress: number;
  }>();
</script>

<style scoped>
  .progress-indicator {
    display: block;
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    text-align: center;
    font-weight: bold;
  }

  .progress-bar-container {
    width: 25vw;
    height: 1rem;
    min-width: 100px;
    background-color: var(--ui-background);
    border: 2px solid var(--ui-border);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .progress-bar {
    margin: 2px 0 0 2px;
    height: calc(100% - 4px);
    background-color: var(--link-color);
    box-shadow: 0 0 1rem var(--link-color);
    border-radius: 0.5rem;
    transition: width 0.1s ease-in-out;
  }
</style>
