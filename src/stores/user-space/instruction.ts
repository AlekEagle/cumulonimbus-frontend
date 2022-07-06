import { defineStore } from 'pinia';
import { userStore } from '../user';
import { ref } from 'vue';
import Cumulonimbus from 'cumulonimbus-wrapper';

export const instructionStore = defineStore('user-space-instruction', () => {
  const user = userStore();
  const loading = ref(false);
  const data = ref<Cumulonimbus.Data.Instruction | null>(null);
  const errored = ref(false);

  async function getInstruction(
    id: string
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getInstruction(id);
      data.value = result.result;
    } catch (error) {
      errored.value = true;
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
    loading,
    data,
    errored,
    getInstruction
  };
});
