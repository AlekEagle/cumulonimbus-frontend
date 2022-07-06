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
    fileId: string
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getSelfFile(fileId);
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
      const result = await (user.client as Cumulonimbus).deleteSelfFile(
        data.value.filename
      );
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

  return {
    loading,
    data,
    errored,
    getFile,
    deleteFile
  };
});
