import { defineStore } from 'pinia';
import { userStore } from '../user';
import { displayPrefStore } from '../displayPref';
import { ref } from 'vue';
import Cumulonimbus from 'cumulonimbus-wrapper';

export const instructionsStore = defineStore('staff-space-instructions', () => {
  const user = userStore(),
    displayPref = displayPrefStore(),
    data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.Instruction> | null>(
      null,
    ),
    loading = ref(false),
    errored = ref(false),
    page = ref(0);

  async function getInstructions(p: number) {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.getInstructions(
        displayPref.itemsPerPage,
        p * displayPref.itemsPerPage,
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

  async function createInstruction(name: string, description: string) {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.createInstruction(
        name.toLowerCase().replace(/\s/g, '-'),
        name,
        description,
        [],
        '{{token}}',
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
    createInstruction,
  };
});
