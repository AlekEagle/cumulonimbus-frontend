import { defineStore } from 'pinia';
import { userStore } from '../user';
import { ref } from 'vue';
import Cumulonimbus from 'cumulonimbus-wrapper';

export const fileStore = defineStore('staff-space-file', () => {
  const user = userStore(),
    data = ref<Cumulonimbus.Data.File | null>(null),
    loading = ref(false),
    errored = ref(false),
    uploader = ref<Cumulonimbus.Data.User | null>(null);

  async function getFile(id: string) {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getFile(id);
      data.value = result.result;
      const uploaderResult = await (user.client as Cumulonimbus).getUser(
        data.value.userID
      );
      uploader.value = uploaderResult.result;
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

  async function deleteFile() {
    if (data.value === null) return false;
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).deleteFile(
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
    uploader,
    getFile,
    deleteFile
  };
});
