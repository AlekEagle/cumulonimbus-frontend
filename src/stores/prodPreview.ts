import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import persistPiniaStore from '@/utils/persistPinia';

export const prodPreviewStore = defineStore('prodPreview', () => {
  const shownWarning = ref(false);
  const isProdPreview = computed(() => import.meta.env.MODE === 'prod_preview');

  persistPiniaStore(shownWarning, 'shownWarning', { immediate: true });

  return {
    shownWarning,
    isProdPreview
  };
});
