import { defineStore } from "pinia";
import { userStore } from "../user";
import { instructionsStore } from "./instructions";
import { ref } from "vue";
import Cumulonimbus from "cumulonimbus-wrapper";

export const instructionStore = defineStore("staff-space-instruction", () => {
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
      const result = await user.client!.deleteInstruction(data.value!.id);
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
      const result = await user.client!.editInstructionName(
        data.value!.id,
        displayName
      );
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
      const result = await user.client!.editInstructionDescription(
        data.value!.id,
        description
      );
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

  async function updateInstructionFile(content: string, filename?: string) {
    if (user.client === null) return false;
    if (data.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editInstructionFile(
        data.value!.id,
        content,
        filename === undefined || filename === "" ? undefined : filename
      );
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
      const result = await user.client!.editInstructionSteps(
        data.value!.id,
        steps
      );
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
    updateInstructionFile,
    updateInstructionSteps,
  };
});
