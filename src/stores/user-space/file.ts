import { defineStore } from 'pinia';
import { userStore } from '../user';
import { ref } from 'vue';
import Cumulonimbus from 'cumulonimbus-wrapper';

export const fileStore = defineStore('user-space-file', () => {
  const user = userStore();
  const loading = ref(false);
  const data = ref<Cumulonimbus.Data.File | null>(null);
  const errored = ref(false);

  async function getFile(
    fileId: string,
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getFile(fileId);
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

  async function editFilename(
    filename: string,
  ): Promise<boolean | Cumulonimbus.ResponseError> {
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

  async function deleteFilename(): Promise<
    boolean | Cumulonimbus.ResponseError
  > {
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

  async function editFileExtension(
    fileExtension: string,
  ): Promise<boolean | Cumulonimbus.ResponseError> {
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

  async function deleteFile(): Promise<boolean | Cumulonimbus.ResponseError> {
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
      if (error instanceof Cumulonimbus.ResponseError) {
        return error;
      } else {
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
