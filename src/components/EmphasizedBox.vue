<template>
  <div
    :class="{
      'box': true,
      'no-padding': noPadding,
      'center-content': centerContent,
    }"
  >
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

  const { noPadding, centerContent } = defineProps<{
    noPadding?: boolean;
    centerContent?: boolean;
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
    background-color: var(--look-page);
    border: 1px solid var(--look-page-text);
    word-wrap: break-word;
    box-shadow: 0px 0px 75px 20px var(--look-footer);
    transition:
      background-color var(--theme-switch-time) ease,
      border var(--theme-switch-time) ease,
      box-shadow var(--theme-switch-time) ease;
  }

  .box.no-padding {
    padding: 0;
  }

  .box.center-content {
    text-align: center;
  }
</style>
