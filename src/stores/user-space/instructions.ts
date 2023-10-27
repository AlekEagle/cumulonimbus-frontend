import { defineStore } from 'pinia';
import { userStore } from '../user';
import { ref } from 'vue';
import Cumulonimbus from 'cumulonimbus-wrapper';

export const instructionsStore = defineStore('user-space-instructions', () => {
  const user = userStore();
  const loading = ref(false);
  const data =
    ref<Cumulonimbus.Data.List<Cumulonimbus.Data.Instruction> | null>(null);
  const errored = ref(false);
  const page = ref(0);

  async function getInstructions(
    p: number,
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getInstructions(
        50,
        50 * p,
      );
      page.value = p;
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
    page,
    getInstructions,
  };
});
