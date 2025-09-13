//In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler.js';

// Other Store Modules
import { userStore } from '../user.js';
import { toastStore } from '../toast.js';

// External Modules
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const instructionStore = defineStore('staff-space-instruction', () => {
  const user = userStore(),
    router = useRouter(),
    toast = toastStore(),
    data = ref<Cumulonimbus.Data.Instruction | null>(null),
    loading = ref(false),
    errored = ref(false);

  async function getInstruction(id: string): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.getInstruction(id);
      data.value = result.result;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_INSTRUCTION_ERROR':
              toast.show("This set up guide doesn't exist.");
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
    return true;
  }

  async function deleteInstruction(): Promise<boolean> {
    if (user.client === null) return false;
    if (data.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      await user.client!.deleteInstruction(data.value!.id);
      return true;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_INSTRUCTION_ERROR':
              toast.show("This set up guide doesn't exist.");
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function updateInstructionDisplayName(
    displayName: string,
  ): Promise<boolean> {
    if (user.client === null) return false;
    if (data.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editInstructionName(
        data.value!.id,
        displayName,
      );
      data.value = result.result;
      return true;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_INSTRUCTION_ERROR':
              toast.show("This set up guide doesn't exist.");
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function updateInstructionDescription(
    description: string,
  ): Promise<boolean> {
    if (user.client === null) return false;
    if (data.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editInstructionDescription(
        data.value!.id,
        description,
      );
      data.value = result.result;
      return true;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_INSTRUCTION_ERROR':
              toast.show("This set up guide doesn't exist.");
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function updateInstructionFile(
    content: string,
    filename?: string,
  ): Promise<boolean> {
    if (user.client === null) return false;
    if (data.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editInstructionFile(
        data.value!.id,
        content,
        filename === undefined || filename === '' ? undefined : filename,
      );
      data.value = result.result;
      return true;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_INSTRUCTION_ERROR':
              toast.show("This set up guide doesn't exist.");
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function updateInstructionSteps(steps: string[]): Promise<boolean> {
    if (user.client === null) return false;
    if (data.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editInstructionSteps(
        data.value!.id,
        steps,
      );
      data.value = result.result;
      return true;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_INSTRUCTION_ERROR':
              toast.show("This set up guide doesn't exist.");
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
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
