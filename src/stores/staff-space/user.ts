import Cumulonimbus from "cumulonimbus-wrapper";
import { defineStore } from "pinia";
import { ref } from "vue";
import { userStore } from "../user";

export const otherUserStore = defineStore("staff-space-user", () => {
  const user = userStore();
  const data = ref<Cumulonimbus.Data.User | null>(null);
  const loading = ref(false);
  const errored = ref(false);

  async function getUser(
    id: string
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.getUser(id);
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

  async function updateUsername(username: string) {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editUsername(
        username,
        undefined,
        data.value!.id
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

  async function updateEmail(email: string) {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editEmail(
        email,
        undefined,
        data.value!.id
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

  async function updatePassword(password: string, confirmPassword: string) {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editPassword(
        password,
        confirmPassword,
        undefined,
        data.value!.id
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

  async function updateDomain(domain: string, subdomain?: string) {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.editDomainSelection(
        domain,
        subdomain,
        data.value!.id
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

  async function grantStaff() {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.grantStaff(data.value!.id);
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

  async function revokeStaff() {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.revokeStaff(data.value!.id);
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

  async function banUser() {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.banUser(data.value!.id);
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

  async function unbanUser() {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.unbanUser(data.value!.id);
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

  async function deleteAllSessions() {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.deleteAllSessions(data.value!.id);
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

  async function deleteAllFiles() {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.deleteAllFiles(data.value!.id);
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

  async function deleteUser() {
    if (user.client === null) return false;
    errored.value = false;
    loading.value = true;
    try {
      const result = await user.client!.deleteUser(data.value!.id);
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
    data,
    errored,
    loading,
    getUser,
    updateUsername,
    updateEmail,
    updatePassword,
    updateDomain,
    grantStaff,
    revokeStaff,
    banUser,
    unbanUser,
    deleteAllSessions,
    deleteAllFiles,
    deleteUser,
  };
});
