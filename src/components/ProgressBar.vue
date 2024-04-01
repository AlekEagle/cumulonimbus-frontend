<template>
  <span class="progress-indicator">{{ props.progress.toFixed(0) }}%</span>
  <div class="progress-bar-container">
    <div
      :class="{ 'progress-bar': true, 'empty': props.progress === 0 }"
      :style="{ width: `calc(${props.progress}% - 6px)` }"
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
    font-family: var(--font-heading);
  }

  .progress-bar-container {
    width: 50vw;
    height: 1rem;
    min-width: 100px;
    background-color: var(--ui-background);
    border: 2px solid var(--ui-border);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .progress-bar {
    margin: 3px 0 0 3px;
    height: calc(100% - 6px);
    background: linear-gradient(
      to right,
      var(--logo-color-top),
      var(--logo-color-bottom)
    );
    transform-style: preserve-3d;
    border-radius: 0.5rem;
    transition: width 0.1s ease-in-out;
    background-size: 50vw;
  }

  .progress-bar::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(
      to right,
      var(--logo-color-top),
      var(--logo-color-bottom)
    );
    filter: blur(3px);
    border-radius: inherit;
    background-size: inherit;
  }

  .progress-bar.empty {
    background: none;
  }

  .progress-bar.empty::before {
    background: none;
  }
</style>
