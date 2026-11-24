<template>
  <div class="list-item">
    <slot />
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
</script>

<style scoped>
  .list-item {
    display: flex;
    align-items: center;
    flex-direction: row;
    border-top: 0.5px solid var(--look-page-text);
    border-bottom: 0.5px solid var(--look-page-text);
  }

  .list-item:first-child {
    border-top-width: 1px;
  }
  .list-item:last-child {
    border-bottom-width: 1px;
  }
</style>
