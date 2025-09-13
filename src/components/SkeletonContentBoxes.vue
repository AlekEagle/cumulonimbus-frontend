<template>
  <div class="content-box-container grow" v-if="!props.noContainer">
    <div
      class="content-box skeleton"
      v-for="() in new Array(props.count || displayPref.itemsPerPage).fill(0)"
    >
      <div class="content-box-inner">
        <code class="title" v-text="generateSpaces()" />
        <LoadingSpinner />
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
  <div
    class="content-box skeleton"
    v-for="() in new Array(props.count || displayPref.itemsPerPage).fill(0)"
    v-else
  >
    <div class="content-box-inner">
      <code class="title" v-text="generateSpaces()" />
      <LoadingSpinner />
      <div class="content-box-content">
        <code v-text="generateSpaces()" />
        <br />
        <code v-text="generateSpaces()" />
        <br />
        <code v-text="generateSpaces()" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  // Vue Components
  import '@/components/ContentBox.vue'; // Importing this to get the CSS
  import LoadingSpinner from './LoadingSpinner.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  import { displayPrefStore } from '@/stores/displayPref.js';

  // External Modules
  // No External Modules to import here.

  const displayPref = displayPrefStore();

  const props = defineProps({
    count: {
      type: Number,
      required: false,
    },
    noContainer: Boolean,
  });

  function generateSpaces() {
    return '\u00A0'.repeat(Math.floor(Math.random() * 11 + 6));
  }
</script>
