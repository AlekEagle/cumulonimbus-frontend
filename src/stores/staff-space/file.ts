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

export const fileStore = defineStore('staff-space-file', () => {
  const user = userStore(),
    toast = toastStore(),
    router = useRouter(),
    data = ref<Cumulonimbus.Data.File | null>(null),
    loading = ref(false),
    errored = ref(false),
    uploader = ref<Cumulonimbus.Data.User | null>(null);

  async function getFile(id: string): Promise<boolean> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getArbitraryFile(id);
      data.value = result.result;
      const uploaderResult = await (user.client as Cumulonimbus).getUser(
        data.value.userID,
      );
      uploader.value = uploaderResult.result;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases here.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_FILE_ERROR':
              toast.show("This file doesn't exist.");
              return false;
            case 'INVALID_USER_ERROR':
              toast.show(
                "The uploader of this file doesn't exist somehow. How?",
              );
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
      const result = await (user.client as Cumulonimbus).editUserFilename(
        data.value.userID,
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
              toast.show("This file doesn't exist.");
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
      const result = await (user.client as Cumulonimbus).deleteUserFilename(
        data.value.userID,
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
              toast.show("This file doesn't exist.");
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
      const result = await (user.client as Cumulonimbus).editUserFileExtension(
        data.value.userID,
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
              toast.show("This file doesn't exist.");
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
      await (user.client as Cumulonimbus).deleteUserFile(
        data.value.userID,
        data.value.id,
      );
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
              toast.show("This file doesn't exist.");
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
    loading,
    data,
    errored,
    uploader,
    getFile,
    editFilename,
    deleteFilename,
    editFileExtension,
    deleteFile,
  };
});
