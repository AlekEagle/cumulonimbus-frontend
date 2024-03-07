<template>
  <div class="content-box-container">
    <ContentBox title="Show fullscreen loading message for 5s" @click="fsm">
      Show fullscreen loading message for 5s
    </ContentBox>
    <ContentBox
      title="Show fullscreen loading message forever"
      @click="fullscreenLoadingMessage!.show()"
    >
      Show fullscreen loading message forever
    </ContentBox>
  </div>
  <FullscreenLoadingMessage ref="fullscreenLoadingMessage" />
</template>

<script lang="ts" setup>
  // Vue Components
  import FullscreenLoadingMessage from '@/components/FullscreenLoadingMessage.vue';
  import ContentBox from '@/components/ContentBox.vue';

  // In-House Modules
  import { wait } from '@/utils/wait';

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref } from 'vue';

  const fullscreenLoadingMessage =
    ref<InstanceType<typeof FullscreenLoadingMessage>>();

  async function fsm() {
    await fullscreenLoadingMessage.value!.show();
    await wait(5000);
    fullscreenLoadingMessage.value!.hide();
  }
</script>
