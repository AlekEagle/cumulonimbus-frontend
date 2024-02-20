<template>
  <div class="content-box-container">
    <div
      class="content-box skeleton click-target"
      v-for="() in new Array(displayPref.itemsPerPage).fill(0)"
    >
      <div class="content-box-inner">
        <code class="title" v-text="generateSpaces()" />
        <Loading />
        <div class="content-box-content">
          <code v-text="generateSpaces()" />
          <br />
          <code v-text="generateSpaces()" />
          <br />
          <code v-text="generateSpaces()" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  // Vue Components
  import '@/components/ContentBox.vue'; // Importing this to get the CSS
  import Loading from './Loading.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  import { displayPrefStore } from '@/stores/displayPref';

  // External Modules
  // No External Modules to import here.

  const displayPref = displayPrefStore();

  function generateSpaces() {
    return '\u00A0'.repeat(Math.floor(Math.random() * 11 + 6));
  }
</script>
