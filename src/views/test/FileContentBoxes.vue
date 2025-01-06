<template>
  <div class="file-content-box-container">
    <template v-for="i in 120">
      <FileContentBox debug v-model="model" />
    </template>
  </div>
</template>

<script setup lang="ts">
  // Vue Components
  import FileContentBox from '@/components/FileContentBox.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref } from 'vue';

  const model = ref<string[]>([]);
</script>
