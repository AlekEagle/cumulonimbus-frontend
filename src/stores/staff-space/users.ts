import { defineStore } from "pinia";
import { userStore } from "../user";
import { ref } from "vue";
import Cumulonimbus from "cumulonimbus-wrapper";

export const usersStore = defineStore("staff-space-users", () => {
  const user = userStore();
  const loading = ref(false);
  const data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.User> | null>(null);
  const errored = ref(false);
  const page = ref(0);

  async function getUsers(
    p: number
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).getUsers(50, 50 * p);
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

  async function deleteUsers(
    users: string[]
  ): Promise<number | Cumulonimbus.ResponseError> {
    if (user.client === null) return -1;
    errored.value = false;
    loading.value = true;
    try {
      const result = await (user.client as Cumulonimbus).deleteUsers(users);
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
    loading,
    data,
    errored,
    page,
    getUsers,
    deleteUsers,
  };
});
