// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler';

// Other Store Modules
import { toastStore } from '../toast';
import { userStore } from '../user';

// External Modules
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Store Definition
export const fileStore = defineStore('user-space-file', () => {
  const user = userStore();
  const toast = toastStore();
  const router = useRouter();
  const loading = ref(false);
  const data = ref<Cumulonimbus.Data.File | null>(null);
  const errored = ref(false);

  async function getFile(fileId: string): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getFile(fileId);
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
            case 'INVALID_FILE_ERROR':
              toast.show('That file does not exist.');
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

  async function editFilename(filename: string): Promise<boolean> {
    if (data.value === null) return false;
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).editFilename(
        data.value.id,
        filename,
      );
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
            case 'INVALID_FILE_ERROR':
              toast.show('That file does not exist.');
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

  async function deleteFilename(): Promise<boolean> {
    if (data.value === null) return false;
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).deleteFilename(
        data.value.id,
      );
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
            case 'INVALID_FILE_ERROR':
              toast.show('That file does not exist.');
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

  async function editFileExtension(fileExtension: string): Promise<boolean> {
    if (data.value === null) return false;
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).editFileExtension(
        data.value.id,
        fileExtension,
      );
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
            case 'INVALID_FILE_ERROR':
              toast.show('That file does not exist.');
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

  async function deleteFile(): Promise<boolean> {
    if (data.value === null) return false;
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      await (user.client as Cumulonimbus).deleteFile(data.value.id);
      data.value = null;
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
            case 'INVALID_FILE_ERROR':
              toast.show('That file does not exist.');
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

  async function clear(): Promise<void> {
    data.value = null;
    loading.value = false;
    errored.value = false;
  }

  return {
    loading,
    data,
    errored,
    getFile,
    editFilename,
    deleteFilename,
    editFileExtension,
    deleteFile,
    clear,
  };
});
