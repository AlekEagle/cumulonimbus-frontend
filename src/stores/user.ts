import { defineStore } from "pinia";
import { ref, computed } from "vue";
import persistPiniaStore from "@/utils/persistPinia";
import Cumulonimbus from "cumulonimbus-wrapper";

const cumulonimbusOptions: Cumulonimbus.ClientOptions = {
  baseURL: import.meta.env.DEV
    ? "http://localhost:8000/api"
    : `${window.location.protocol}//${window.location.host}/api`,
  baseThumbnailURL: import.meta.env.DEV
    ? "http://localhost:8001"
    : `${window.location.protocol}//previews.${window.location.host}`,
};

export const userStore = defineStore("user", () => {
  const user = ref<Cumulonimbus.Data.User | null>(null);
  const session = ref<
    (Cumulonimbus.Data.SuccessfulAuth & Cumulonimbus.Data.Session) | null
  >(null);
  const client = ref<Cumulonimbus | null>(null);
  const loggedIn = computed(() => !!session.value && !!user.value && !!client);

  persistPiniaStore(user, "user", { immediate: true, deep: true });
  persistPiniaStore(session, "session", { immediate: true, deep: true });

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
        token: (client as any).token,
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
        token: (client as any).token,
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

  async function logout(): Promise<boolean | Cumulonimbus.ResponseError> {
    if (!loggedIn.value) return true;
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
      client.value = new Cumulonimbus(
        session.value!.token,
        cumulonimbusOptions
      );
    }
  }

  return {
    user,
    session,
    client,
    loggedIn,
    login,
    register,
    logout,
    restoreClient,
  };
});
