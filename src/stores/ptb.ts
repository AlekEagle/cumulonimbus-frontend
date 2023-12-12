// In-House Modules
import persistPiniaRef from '@/utils/persistPiniaRef';

// Other Store Modules
// No Other Store Modules to import here.

// External Modules
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Store Definition
export const ptbStore = defineStore('ptb', () => {
  const shownWarning = ref(false);
  const isPtb = computed(() => import.meta.env.MODE === 'ptb');

  persistPiniaRef(shownWarning, 'shownWarning', { immediate: true });

  return {
    shownWarning,
    isPtb,
  };
});
