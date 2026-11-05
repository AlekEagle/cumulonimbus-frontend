<template>
  <EmphasizedBox>
    <button @click="simulateProgress"
      >Display fullscreen loading message with progress bar</button
    >
  </EmphasizedBox>
  <FullscreenLoadingMessage ref="fullscreenLoadingMessage">
    <ProgressBar :progress="progress" />
  </FullscreenLoadingMessage>
</template>

<script lang="ts" setup>
  // Vue Components
  import EmphasizedBox from '&/EmphasizedBox.vue';
  import FullscreenLoadingMessage from '&/FullscreenLoadingMessage.vue';
  import ProgressBar from '&/ProgressBar.vue';
  import { wait } from '#/wait.js';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref } from 'vue';

  const progress = ref(0),
    fullscreenLoadingMessage =
      ref<InstanceType<typeof FullscreenLoadingMessage>>();

  function simulateProgress() {
    fullscreenLoadingMessage.value?.show();
    progress.value = 0;
    const interval = setInterval(async () => {
      progress.value += 10;
      if (progress.value >= 100) {
        clearInterval(interval);
        await wait(1000);
        fullscreenLoadingMessage.value?.hide();
      }
    }, 1000);
  }
</script>
