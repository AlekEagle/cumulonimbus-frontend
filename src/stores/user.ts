import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import persistPiniaStore from '@/utils/persistPinia';
import Cumulonimbus from 'cumulonimbus-wrapper';

const BaseAPIURLs: { [key: string]: string } = {
  production: `${window.location.protocol}//${window.location.host}/api`,
  ptb: 'https://alekeagle.me/api',
  development: 'http://localhost:8000/api'
};

const BaseThumbnailURLs: { [key: string]: string } = {
  production: `${window.location.protocol}//previews.${window.location.host}`,
  ptb: 'https://previews.alekeagle.me',
  development: 'http://localhost:8100'
};

const cumulonimbusOptions: Cumulonimbus.ClientOptions = {
  baseURL: BaseAPIURLs[import.meta.env.MODE],
  baseThumbnailURL: BaseThumbnailURLs[import.meta.env.MODE]
};

export const userStore = defineStore('user', () => {
  const user = ref<Cumulonimbus.Data.User | null>(null);
  const domain = computed(() => {
    if (!user.value) return '';
    return `${user.value.subdomain ? `${user.value.subdomain}.` : ''}${
      user.value.domain
    }`;
  });
  const session = ref<
    (Cumulonimbus.Data.SuccessfulAuth & Cumulonimbus.Data.Session) | null
  >(null);
  const client = ref<Cumulonimbus | null>(null);
  const loggedIn = computed(() => !!session.value && !!user.value && !!client);
  const loading = ref(false);

  persistPiniaStore(user, 'user', { immediate: true, deep: true });
  persistPiniaStore(session, 'session', { immediate: true, deep: true });

  async function login(
    username: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    try {
      client.value = await Cumulonimbus.login(
        username,
        password,
        rememberMe,
        cumulonimbusOptions
      );

      session.value = {
        ...(await client.value.getSelfSession()).result,
        token: (client.value as any).token
      };
      user.value = (await client.value.getSelf()).result;
      return true;
    } catch (e) {
      if (e instanceof Cumulonimbus.ResponseError) {
        return e;
      } else {
        throw e;
      }
    }
  }

  async function register(
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    rememberMe: boolean = false
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    try {
      client.value = await Cumulonimbus.register(
        username,
        email,
        password,
        confirmPassword,
        rememberMe,
        cumulonimbusOptions
      );

      session.value = {
        ...(await client.value.getSelfSession()).result,
        token: (client.value as any).token
      };
      user.value = (await client.value.getSelf()).result;
      return true;
    } catch (e) {
      if (e instanceof Cumulonimbus.ResponseError) {
        return e;
      } else {
        throw e;
      }
    }
  }

  async function logout(
    force: boolean = false
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    if (!loggedIn.value) return true;
    if (force) {
      session.value = null;
      user.value = null;
      client.value = null;
      return true;
    }
    try {
      await client.value!.deleteSelfSession(session.value!.iat.toString());
      session.value = null;
      user.value = null;
      client.value = null;
      return true;
    } catch (e) {
      if (e instanceof Cumulonimbus.ResponseError) {
        return e;
      } else {
        throw e;
      }
    }
  }

  function restoreClient(): void {
    if (session.value?.token) {
      client.value = new Cumulonimbus(session.value.token, cumulonimbusOptions);
    }
  }

  async function updateUsername(
    username: string,
    password: string
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    if (!loggedIn.value) return false;
    loading.value = true;
    try {
      user.value = (
        await client.value!.editSelf(password, { username })
      ).result;
      return true;
    } catch (error) {
      if (error instanceof Cumulonimbus.ResponseError) {
        return error;
      } else {
        throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function updateEmail(
    email: string,
    password: string
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    if (!loggedIn.value) return false;
    loading.value = true;
    try {
      user.value = (await client.value!.editSelf(password, { email })).result;
      return true;
    } catch (error) {
      if (error instanceof Cumulonimbus.ResponseError) {
        return error;
      } else {
        throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function updatePassword(
    newPassword: string,
    password: string
  ): Promise<boolean | Cumulonimbus.ResponseError> {
    if (!loggedIn.value) return false;
    loading.value = true;
    try {
      user.value = (
        await client.value!.editSelf(password, { newPassword })
      ).result;
      return true;
    } catch (error) {
      if (error instanceof Cumulonimbus.ResponseError) {
        return error;
      } else {
        throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function updateDomain(domain: string, subdomain?: string) {
    if (!loggedIn.value) return false;
    loading.value = true;
    try {
      user.value = (
        await client.value!.editSelfDomain(domain, subdomain)
      ).result;
      return true;
    } catch (error) {
      if (error instanceof Cumulonimbus.ResponseError) {
        return error;
      } else {
        throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function deleteAllSessions(allButSelf: boolean) {
    if (!loggedIn.value) return false;
    loading.value = true;
    try {
      await client.value!.deleteAllSelfSessions(allButSelf);
      return true;
    } catch (error) {
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
    if (!loggedIn.value) return false;
    loading.value = true;
    try {
      const res = await client.value!.deleteAllSelfFiles();
      return res.result.count;
    } catch (error) {
      if (error instanceof Cumulonimbus.ResponseError) {
        return error;
      } else {
        throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function deleteAccount(username: string, password: string) {
    if (!loggedIn.value) return false;
    loading.value = true;
    try {
      await client.value!.deleteSelf(username, password);
      return true;
    } catch (error) {
      if (error instanceof Cumulonimbus.ResponseError) {
        return error;
      } else {
        throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function getSelf(): Promise<boolean | Cumulonimbus.ResponseError> {
    if (!loggedIn.value) return false;
    loading.value = true;
    try {
      user.value = (await client.value!.getSelf()).result;
      return true;
    } catch (error) {
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
    user,
    domain,
    session,
    client,
    loggedIn,
    loading,
    login,
    register,
    logout,
    restoreClient,
    updateUsername,
    updateEmail,
    updatePassword,
    updateDomain,
    deleteAllSessions,
    deleteAllFiles,
    deleteAccount,
    getSelf
  };
});
