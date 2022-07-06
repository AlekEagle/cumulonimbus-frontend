import { defineStore } from 'pinia';
import { userStore } from '../user';
import { ref } from 'vue';
import Cumulonimbus from 'cumulonimbus-wrapper';

export const sessionsStore = defineStore('staff-space-sessions', () => {
  const user = userStore(),
    data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.Session> | null>(null),
    loading = ref(false),
    errored = ref(false),
    sessionOwner = ref<Cumulonimbus.Data.User | null>(null),
    page = ref(0);

  async function getSessions(p: number) {
    if (user.client === null) return false;
    if (sessionOwner.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.getUserSessions(
        sessionOwner.value.id,
        50,
        p * 50
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

  async function deleteSession(id: string) {
    if (user.client === null) return false;
    if (sessionOwner.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.deleteUserSession(
        sessionOwner.value.id,
        id
      );
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

  async function deleteSessions(ids: string[]) {
    if (user.client === null) return false;
    if (sessionOwner.value === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.deleteUserSessions(
        sessionOwner.value.id,
        ids
      );
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

  return {
    data,
    loading,
    errored,
    sessionOwner,
    page,
    getSessions,
    deleteSession,
    deleteSessions
  };
});
