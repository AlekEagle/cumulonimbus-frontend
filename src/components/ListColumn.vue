<template>
  <div
    :class="[
      'list-column',
      {
        'fit-content': props.fitContent,
        'no-wrap': props.noWrap,
      },
    ]"
    @click="handlePassthrough"
  >
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

  const props = defineProps<{
    fitContent?: boolean;
    noWrap?: boolean;
    dontPassClick?: boolean;
  }>();

  function handlePassthrough(event: MouseEvent) {
    if (props.dontPassClick) {
      event.stopPropagation();
    }
  }
</script>

<style scoped>
  .list-column {
    width: 100%;
    color: var(--look-page-text);
    padding: 8px;
    line-height: 1;
  }

  .list-column.fit-content {
    width: fit-content;
    white-space: nowrap;
  }

  .list-column.no-wrap {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
