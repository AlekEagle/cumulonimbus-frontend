import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import persistPiniaStore from '@/utils/persistPinia';

export const ptbStore = defineStore('ptb', () => {
  const shownWarning = ref(false);
  const isPtb = computed(() => import.meta.env.MODE === 'ptb');

  persistPiniaStore(shownWarning, 'shownWarning', { immediate: true });

  return {
    shownWarning,
    isPtb
  };
});
