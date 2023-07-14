import { defineStore } from "pinia";
import { userStore } from "../user";
import { ref } from "vue";
import Cumulonimbus from "cumulonimbus-wrapper";

export const sessionsStore = defineStore("user-space-sessions", () => {
  const user = userStore();
  const loading = ref(false);
  const data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.Session> | null>(
    null
  );
  const errored = ref(false);
  const page = ref(0);

  async function getSessions(
    p: number
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getSessions(
        "me",
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

  async function deleteSession(session: string) {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      await (user.client as Cumulonimbus).deleteSession(session);
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

  async function deleteSessions(
    sessions: string[]
  ): Promise<number | Cumulonimbus.ResponseError> {
    if (user.client === null) return -1;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).deleteSessions(
        sessions
      );
      return result.result.count!;
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
    getSessions,
    deleteSession,
    deleteSessions,
  };
});
