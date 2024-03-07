<template>
  <h1>Testing</h1>
  <h2>Uhh, meow?</h2>
  <div class="quick-action-buttons-container">
    <RouterLink to="/">
      <button>Home</button>
    </RouterLink>
  </div>

  <div class="test-select">
    <select v-model="currentItem">
      <option :value="ContentBoxes">Content Boxes</option>
      <option :value="BasicEmphasizedBox">Basic Emphasized Box</option>
      <option :value="FormEmphasizedBox">Form Emphasized Box</option>
      <option :value="Modals">Modals</option>
      <option :value="Paginator">Paginator</option>
      <option :value="LoadingMessage">Loading Message</option>
      <option :value="LoadingSpinner">Loading Spinner</option>
      <option :value="FullscreenLoadingMessage"
        >Fullscreen Loading Message</option
      >
      <option :value="SkeletonContentBoxes">Skeleton Content Boxes</option>
    </select>
  </div>

  <KeepAlive>
    <component :is="currentItem" />
  </KeepAlive>
</template>

<script lang="ts" setup>
  // Vue Components
  import BasicEmphasizedBox from '@/views/test/BasicEmphasizedBox.vue';
  import ContentBoxes from '@/views/test/ContentBoxes.vue';
  import FormEmphasizedBox from '@/views/test/FormEmphasizedBox.vue';
  import Modals from '@/views/test/Modals.vue';
  import Paginator from '@/views/test/Paginator.vue';
  import LoadingMessage from '@/views/test/LoadingMessage.vue';
  import LoadingSpinner from '@/views/test/LoadingSpinner.vue';
  import FullscreenLoadingMessage from '@/views/test/FullscreenLoadingMessage.vue';
  import SkeletonContentBoxes from '@/views/test/SkeletonContentBoxes.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref, shallowRef } from 'vue';

  const currentItem = shallowRef(ContentBoxes),
    isSkeleton = ref<boolean>(true);
</script>

<style>
  .test-select {
    margin: 0 0 1rem;
  }
</style>
