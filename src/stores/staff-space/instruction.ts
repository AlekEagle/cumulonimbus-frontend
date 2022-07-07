import { defineStore } from 'pinia';
import { userStore } from '../user';
import { instructionsStore } from './instructions';
import { ref } from 'vue';
import Cumulonimbus from 'cumulonimbus-wrapper';

export const instructionStore = defineStore('staff-space-instruction', () => {
  const user = userStore(),
    instructions = instructionsStore(),
    data = ref<Cumulonimbus.Data.Instruction | null>(null),
    loading = ref(false),
    errored = ref(false);

  async function getInstruction(id: string) {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.getInstruction(id);
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

  async function deleteInstruction() {
    if (user.client === null) return false;
    if (data.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.deleteInstruction(data.value!.name);
      return true;
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

  async function updateInstructionDisplayName(displayName: string) {
    if (user.client === null) return false;
    if (data.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editInstruction(data.value!.name, {
        displayName
      });
      data.value = result.result;
      return true;
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

  async function updateInstructionDescription(description: string) {
    if (user.client === null) return false;
    if (data.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editInstruction(data.value!.name, {
        description
      });
      data.value = result.result;
      return true;
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

  async function updateInstructionFilename(filename: string | null = null) {
    if (user.client === null) return false;
    if (data.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editInstruction(data.value!.name, {
        filename: filename
      });
      data.value = result.result;
      return true;
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

  async function updateInstructionFileContent(fileContent: string) {
    if (user.client === null) return false;
    if (data.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editInstruction(data.value!.name, {
        fileContent
      });
      data.value = result.result;
      return true;
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

  async function updateInstructionSteps(steps: string[]) {
    if (user.client === null) return false;
    if (data.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editInstruction(data.value!.name, {
        steps
      });
      data.value = result.result;
      return true;
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
    getInstruction,
    deleteInstruction,
    updateInstructionDisplayName,
    updateInstructionDescription,
    updateInstructionFilename,
    updateInstructionFileContent,
    updateInstructionSteps
  };
});
