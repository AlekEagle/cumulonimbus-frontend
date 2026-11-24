<template>
  <ListView>
    <ListItem v-for="item in items" :key="item" @click="listItemClick(item)">
      <ListColumn fit-content dont-pass-click>
        <Checkmark />
      </ListColumn>
      <ListColumn>Way cool file.png</ListColumn>
      <ListColumn no-wrap>
        <Code inline>abcdefghij.png</Code>
      </ListColumn>
      <ListColumn fit-content dont-pass-click>
        <span class="list-button open-in-new-tab" />
      </ListColumn>
      <ListColumn fit-content dont-pass-click>
        <span class="list-button delete" />
      </ListColumn>
    </ListItem>
  </ListView>
</template>

<script lang="ts" setup>
  // Vue Components
  import Checkmark from '&/Checkmark.vue';
  import Code from '&/Code.vue';
  import ListItem from '&/ListItem.vue';
  import ListView from '&/ListView.vue';
  import ListColumn from '&/ListColumn.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  import { toastStore } from '$/toast.js';

  // External Modules
  // No External Modules to import here.

  const items = 50;

  const toast = toastStore();

  function listItemClick(item: number) {
    toast.show(`Clicked on item: ${item}`);
  }
</script>

<style scoped>
  span.list-button {
    display: inline-block;
    width: 24px;
    height: 24px;
    background-color: var(--look-page-text);
    transition: background-color var(--theme-switch-time) ease;
    cursor: pointer;
  }

  span.list-button.open-in-new-tab {
    mask: url('!/images/newtab.svg') center / contain no-repeat;
  }

  span.list-button.delete {
    background-color: var(--look-dangerous-text);
    mask: url('!/images/close.svg') center / contain no-repeat;
  }
</style>
