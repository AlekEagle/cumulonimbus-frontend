import { defineStore } from "pinia";
import { ref, computed } from "vue";
import persistPiniaStore from "@/utils/persistPinia";
import Cumulonimbus from "cumulonimbus-wrapper";
import { toastStore } from "./toast";

const cumulonimbusOptions: Cumulonimbus.ClientOptions = {
  baseURL: import.meta.env.DEV
    ? "http://localhost:8000/api"
    : `${window.location.protocol}//${window.location.host}/api`,
  baseThumbnailURL: import.meta.env.DEV
    ? "http://localhost:8001"
    : `${window.location.protocol}//previews.${window.location.host}`,
};

export const userStore = defineStore("user", () => {
  const toast = toastStore();
  const user = ref<Cumulonimbus.Data.User>({
    id: "",
    username: "",
    email: "",
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    domain: "",
    staff: false,
  });
  const session = ref<
    Cumulonimbus.Data.SuccessfulAuth & Cumulonimbus.Data.Session
  >({
    token: "",
    exp: 0,
    iat: 0,
    name: "",
    sub: "",
  });
  let client: Cumulonimbus | null = null;
  const loggedIn = computed(() => !!session.value.token);

  persistPiniaStore(user, "user", { immediate: true, deep: true });
  persistPiniaStore(session, "session", { immediate: true, deep: true });

  async function login(
    username: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<boolean | string | number> {
    try {
      client = await Cumulonimbus.login(
        username,
        password,
        rememberMe,
        cumulonimbusOptions
      );

      session.value = {
        ...(await client.getSelfSession()).result,
        token: (client as any).token,
      };
      user.value = (await client.getSelf()).result;
      return true;
    } catch (e) {
      if (e instanceof Cumulonimbus.ResponseError) {
        switch (e.code) {
          case "BANNED_ERROR":
            return "You have been banned from Cumulonimbus.";
          case "INVALID_USER_ERROR":
            return "Invalid username or email.";
          case "INVALID_PASSWORD_ERROR":
            return "Invalid password.";
          case "RATELIMITED_ERROR":
            return e.ratelimit?.reset as number;
          case "GENERIC_ERROR":
          case "INTERNAL_ERROR":
          default:
            return e.message;
        }
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
  ): Promise<boolean | string | number> {
    try {
      client = await Cumulonimbus.register(
        username,
        email,
        password,
        confirmPassword,
        rememberMe,
        cumulonimbusOptions
      );

      session.value = {
        ...(await client.getSelfSession()).result,
        token: (client as any).token,
      };
      user.value = (await client.getSelf()).result;
      return true;
    } catch (e) {
      if (e instanceof Cumulonimbus.ResponseError) {
        switch (e.code) {
          case "USER_EXISTS_ERROR":
            return "A user with that username or email already exists.";
          case "INVALID_PASSWORD_ERROR":
            return "These passwords don't match.";
          case "RATELIMITED_ERROR":
            return e.ratelimit?.reset as number;
          case "GENERIC_ERROR":
          case "INTERNAL_ERROR":
          default:
            return e.message;
        }
      } else {
        throw e;
      }
    }
  }

  async function logout(): Promise<boolean | string | number> {
    try {
      await client?.deleteSelfSession(session.value.iat.toString());
      resetStore();
      return true;
    } catch (e) {
      if (e instanceof Cumulonimbus.ResponseError) {
        switch (e.code) {
          case "INVALID_SESSION_ERROR":
            resetStore();
            return true;
          case "RATELIMITED_ERROR":
            return e.ratelimit?.reset as number;
          case "GENERIC_ERROR":
          case "INTERNAL_ERROR":
          default:
            return e.message;
        }
      } else {
        throw e;
      }
    }
  }

  function resetStore() {
    user.value = {
      id: "",
      username: "",
      email: "",
      createdAt: "",
      updatedAt: "",
      domain: "",
      staff: false,
    };
    session.value = {
      token: "",
      exp: 0,
      iat: 0,
      name: "",
      sub: "",
    };
    client = null;
  }

  function restoreClient(): void {
    if (session.value.token !== "") {
      client = new Cumulonimbus(session.value.token, cumulonimbusOptions);
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
