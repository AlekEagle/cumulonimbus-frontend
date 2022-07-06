import { defineStore } from 'pinia';
import { userStore } from '../user';
import { ref } from 'vue';
import Cumulonimbus from 'cumulonimbus-wrapper';

export const filesStore = defineStore('user-space-files', () => {
  const user = userStore();
  const loading = ref(false);
  const data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.File> | null>(null);
  const errored = ref(false);
  const page = ref(0);

  async function getFiles(
    p: number
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getSelfFiles(
        50,
        50 * p
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

  async function deleteFiles(
    files: string[]
  ): Promise<number | Cumulonimbus.ResponseError> {
    if (user.client === null) return -1;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).deleteSelfFiles(files);
      return result.result.count;
    } catch (error) {
      if (error instanceof Cumulonimbus.ResponseError) {
        return error;
      } else {
        errored.value = true;
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
    getFiles,
    deleteFiles
  };
});
