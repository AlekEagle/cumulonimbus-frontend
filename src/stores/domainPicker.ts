import { defineStore } from 'pinia';
import { ref } from 'vue';
import Cumulonimbus from 'cumulonimbus-wrapper';
import { userStore } from './user';

export const domainPickerStore = defineStore('domainPicker', () => {
  const user = userStore();
  const loading = ref(false);
  const domains = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.Domain> | null>(
    null,
  );

  async function sync(): Promise<boolean | Cumulonimbus.ResponseError> {
    if (user.client === null) return false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getDomains('all');
      domains.value = result.result;
    } catch (error) {
      if (error instanceof Cumulonimbus.ResponseError) {
        return error;
      } else {
        throw error;
      }
    } finally {
      loading.value = false;
    }
    return true;
  }

  return {
    domains,
    loading,
    sync,
  };
});
