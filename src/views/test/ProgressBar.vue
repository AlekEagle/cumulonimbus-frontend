<template>
  <EmphasizedBox>
    <ProgressBar :progress="progress" />
  </EmphasizedBox>
</template>

<script lang="ts" setup>
  // Vue Components
  import EmphasizedBox from '@/components/EmphasizedBox.vue';
  import ProgressBar from '@/components/ProgressBar.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref, onActivated } from 'vue';

  const progress = ref(0);

  // Simulate progress
  function simulateProgress() {
    progress.value = 0;
    const interval = setInterval(() => {
      progress.value += 10;
      if (progress.value >= 100) {
        clearInterval(interval);
      }
    }, 1000);
  }

  onActivated(() => {
    simulateProgress();
  });
</script>
