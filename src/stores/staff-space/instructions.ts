import { defineStore } from 'pinia';
import { userStore } from '../user';
import { ref } from 'vue';
import Cumulonimbus from 'cumulonimbus-wrapper';

export const instructionsStore = defineStore('staff-space-instructions', () => {
  const user = userStore(),
    data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.Instruction> | null>(
      null
    ),
    loading = ref(false),
    errored = ref(false),
    page = ref(0);

  async function getInstructions(p: number) {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.getInstructions(50, p * 50);
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

  async function deleteInstructions(ids: string[]) {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.deleteInstructions(ids);
      return result.result.count;
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
  }

  async function createInstruction(name: string) {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.createInstruction(
        name.toLowerCase().replace(/\s/g, '-'),
        name,
        '',
        '',
        []
      );
      return result.result;
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
  }

  return {
    data,
    loading,
    errored,
    page,
    getInstructions,
    deleteInstructions,
    createInstruction
  };
});
