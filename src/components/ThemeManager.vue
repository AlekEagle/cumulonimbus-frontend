<template>
  <a @click.prevent="cycleTheme" :tabindex="props.noTabIndex ? -1 : 0">
    <template v-if="displayPref.theme === Theme.SYSTEM">
      System
      <img v-if="displayPref.preferredDark" :src="moon" alt="Moon" />
      <img v-else :src="sun" alt="Sun" />
    </template>
    <template v-else-if="displayPref.theme === Theme.DARK">
      Dark
      <img :src="moon" alt="Moon" />
    </template>
    <template v-else-if="displayPref.theme === Theme.LIGHT">
      Light
      <img :src="sun" alt="Sun" />
    </template>
  </a>
</template>

<script lang="ts" setup>
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  import sun from '@/assets/images/sun.svg';
  import moon from '@/assets/images/moon.svg';

  // Store Modules
  import { displayPrefStore, Theme } from '@/stores/displayPref.js';

  // External Modules
  // No External Modules to import here.

  const props = defineProps({
    noTabIndex: Boolean,
  });

  let displayPref = displayPrefStore();

  function cycleTheme() {
    switch (displayPref.theme) {
      case Theme.SYSTEM:
        displayPref.theme = Theme.DARK;
        break;
      case Theme.DARK:
        displayPref.theme = Theme.LIGHT;
        break;
      case Theme.LIGHT:
        displayPref.theme = Theme.SYSTEM;
        break;
      default:
        console.warn(`Unknown theme value: ${displayPref.theme}`);
    }
  }
</script>

<style scoped>
  a {
    cursor: pointer;
  }
</style>
