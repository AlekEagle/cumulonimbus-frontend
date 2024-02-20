<template>
  <div class="content-box-container">
    <ContentBox title="Toggle Skeletons" @click="isSkeleton = !isSkeleton">
      Toggle Skeletons
    </ContentBox>
  </div>
  <SkeletonContentBoxes :count="5" v-if="isSkeleton" />
  <div class="content-box-container" v-else>
    <ContentBox v-for="() in new Array(5).fill(0)" />
  </div>
</template>

<script lang="ts" setup>
  // Vue Components
  import ContentBox from '@/components/ContentBox.vue';
  import SkeletonContentBoxes from '@/components/SkeletonContentBoxes.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref } from 'vue';

  const isSkeleton = ref<boolean>(true);
</script>
