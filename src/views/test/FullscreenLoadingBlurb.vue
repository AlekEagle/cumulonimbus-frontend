<template>
  <div class="content-box-container">
    <ContentBox title="Show fullscreen loading blurb for 5s" @click="fsb">
      Show fullscreen loading blurb for 5s
    </ContentBox>
    <ContentBox
      title="Show fullscreen loading blurb forever"
      @click="fullscreenLoadingBlurb!.show()"
    >
      Show fullscreen loading blurb forever
    </ContentBox>
  </div>
  <FullscreenLoadingBlurb ref="fullscreenLoadingBlurb" />
</template>

<script lang="ts" setup>
  // Vue Components
  import FullscreenLoadingBlurb from '@/components/FullscreenLoadingBlurb.vue';
  import ContentBox from '@/components/ContentBox.vue';

  // In-House Modules
  import { wait } from '@/utils/wait';

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref } from 'vue';

  const fullscreenLoadingBlurb = ref<typeof FullscreenLoadingBlurb>();

  async function fsb() {
    await fullscreenLoadingBlurb.value!.show();
    await wait(5000);
    fullscreenLoadingBlurb.value!.hide();
  }
</script>
