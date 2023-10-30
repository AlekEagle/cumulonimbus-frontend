import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import persistPiniaRef from '@/utils/persistPiniaRef';

export const ptbStore = defineStore('ptb', () => {
  const shownWarning = ref(false);
  const isPtb = computed(() => import.meta.env.MODE === 'ptb');

  persistPiniaRef(shownWarning, 'shownWarning', { immediate: true });

  return {
    shownWarning,
    isPtb,
  };
});
