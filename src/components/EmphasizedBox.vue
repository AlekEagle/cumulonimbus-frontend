<template>
  <div :class="{ 'box': true, 'no-padding': noPadding }">
    <slot></slot>
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

  const { noPadding } = defineProps<{
    noPadding?: boolean;
  }>();
</script>

<style>
  .box {
    width: fit-content;
    min-width: 5rem;
    max-width: 80vw;
    padding: 1rem 5vw;
    margin: 10vh auto 20px;
    border-radius: 1rem;
    background-color: var(--background);
    border: 1px solid var(--ui-border);
    word-wrap: break-word;
    box-shadow: 0px 0px 75px 20px var(--logo-shadow);
    transition: background-color 0.25s, border 0.25s, box-shadow 0.25s;
  }

  .box.no-padding {
    padding: 0;
  }
</style>
