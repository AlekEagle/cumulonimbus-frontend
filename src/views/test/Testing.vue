<template>
  <h1>Testing</h1>
  <h2>Uhh, meow?</h2>
  <div class="quick-action-buttons-container">
    <RouterLink to="/">
      <button>Home</button>
    </RouterLink>
  </div>

  <div class="test-select">
    <select v-model="currentItem" @change="updateHash">
      <option :value="BasicEmphasizedBox">Basic Emphasized Box</option>
      <option :value="ContentBoxes">Content Boxes</option>
      <option :value="FormEmphasizedBox">Form Emphasized Box</option>
      <option :value="FileContentBoxes">File Content Box</option>
      <option :value="FullscreenLoadingMessage">
        Fullscreen Loading Message
      </option>
      <option :value="FullscreenProgressBar">Fullscreen Progress Bar</option>
      <option :value="LoadingMessage">Loading Message</option>
      <option :value="MarqueeText">Marquee Text</option>
      <option :value="Modals">Modals</option>
      <option :value="Paginator">Paginator</option>
      <option :value="ProgressBar">Progress Bar</option>
      <option :value="SkeletonContentBoxes">Skeleton Content Boxes</option>
      <option :value="Switches">Switches</option>
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
  import FileContentBoxes from '@/views/test/FileContentBoxes.vue';
  import FullscreenLoadingMessage from '@/views/test/FullscreenLoadingMessage.vue';
  import FullscreenProgressBar from '@/views/test/FullscreenProgressBar.vue';
  import LoadingMessage from '@/views/test/LoadingMessage.vue';
  import MarqueeText from '@/views/test/MarqueeText.vue';
  import Modals from '@/views/test/Modals.vue';
  import Paginator from '@/views/test/Paginator.vue';
  import ProgressBar from '@/views/test/ProgressBar.vue';
  import SkeletonContentBoxes from '@/views/test/SkeletonContentBoxes.vue';
  import Switches from '@/views/test/Switches.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { shallowRef, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const currentItem = shallowRef(BasicEmphasizedBox),
    router = useRouter();

  onMounted(() => {
    if (router.currentRoute.value.hash) {
      switch (router.currentRoute.value.hash) {
        case '#basic-emphasized-box':
          currentItem.value = BasicEmphasizedBox;
          break;
        case '#content-boxes':
          currentItem.value = ContentBoxes;
          break;
        case '#form-emphasized-box':
          currentItem.value = FormEmphasizedBox;
          break;
        case '#file-content-boxes':
          currentItem.value = FileContentBoxes;
          break;
        case '#fullscreen-loading-message':
          currentItem.value = FullscreenLoadingMessage;
          break;
        case '#fullscreen-progress-bar':
          currentItem.value = FullscreenProgressBar;
          break;
        case '#loading-message':
          currentItem.value = LoadingMessage;
          break;
        case '#marquee-text':
          currentItem.value = MarqueeText;
          break;
        case '#modals':
          currentItem.value = Modals;
          break;
        case '#paginator':
          currentItem.value = Paginator;
          break;
        case '#progress-bar':
          currentItem.value = ProgressBar;
          break;
        case '#skeleton-content-boxes':
          currentItem.value = SkeletonContentBoxes;
          break;
        case '#switches':
          currentItem.value = Switches;
          break;
        default:
          currentItem.value = ContentBoxes;
          break;
      }
    }
  });

  function updateHash() {
    // PascalCase to kebab-case
    const kebabCase = currentItem.value
      .__name!.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/^-/, '');
    router.replace({ hash: `#${kebabCase}` });
  }
</script>

<style>
  .test-select {
    margin: 0 0 1rem;
  }
</style>
