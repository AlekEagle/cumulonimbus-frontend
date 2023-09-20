<template>
  <template v-if="action === 'login'">
    <h1>Login</h1>
    <h2>Welcome back!</h2>
  </template>
  <template v-else-if="action === 'register'">
    <h1>Register</h1>
    <h2>Welcome to Cumulonimbus!</h2>
  </template>
  <template v-else>
    <h1>How?!</h1>
    <h2>I am broken</h2>
  </template>
  <EmphasizedBox>
    <template v-if="online">
      <button
        @click="toggleState"
        class="state-toggle"
        v-text="
          action === 'login'
            ? 'Don\'t have an account?'
            : action === 'register'
            ? 'Already have an account?'
            : 'How'
        "
        :disabled="processing"
      />
      <template v-if="action === 'login'">
        <Form @submit="login" ref="loginForm">
          <input
            type="text"
            placeholder="Username"
            autocomplete="username"
            :disabled="processing"
            name="username"
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            autocomplete="current-password"
            :disabled="processing"
            name="password"
          />
          <Switch :disabled="processing" name="remember">Remember me</Switch>
          <button
            :disabled="processing"
            v-text="processing ? 'Logging in...' : 'Login'"
          />
        </Form>
      </template>
      <template v-else-if="action === 'register'">
        <Form @submit="register" ref="registerForm">
          <input
            type="text"
            placeholder="Username"
            autocomplete="username"
            :disabled="processing"
            name="username"
          />
          <br />
          <input
            type="email"
            placeholder="Email"
            autocomplete="email"
            :disabled="processing"
            name="email"
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            autocomplete="new-password"
            :disabled="processing"
            name="password"
          />
          <br />
          <input
            type="password"
            placeholder="Confirm Password"
            autocomplete="new-password"
            :disabled="processing"
            name="confirmPassword"
          />
          <Switch :disabled="processing" name="remember">Remember me</Switch>
          <button
            :disabled="processing"
            v-text="processing ? 'Registering...' : 'Register'"
          />
        </Form>
      </template>
      <template v-else>
        <h1>How</h1>
      </template>
    </template>
    <template v-else>
      <h1>Offline</h1>
      <h2>
        You are currently offline. Please connect to the internet to continue.
      </h2>
    </template>
  </EmphasizedBox>
</template>

<script lang="ts" setup>
import { userStore } from "@/stores/user";
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import EmphasizedBox from "@/components/EmphasizedBox.vue";
import Switch from "@/components/Switch.vue";
import Form from "@/components/Form.vue";
import { toastStore } from "@/stores/toast";
import Cumulonimbus from "cumulonimbus-wrapper";
import { useNetwork } from "@vueuse/core";
import defaultErrorHandler from "@/utils/defaultErrorHandler";
import { wait } from "@/utils/wait";

const user = userStore(),
  router = useRouter(),
  route = useRoute(),
  action = ref<"login" | "register">("login"),
  processing = ref(false),
  toast = toastStore(),
  loginForm = ref<typeof Form>(),
  registerForm = ref<typeof Form>(),
  { isOnline: online } = useNetwork();

async function toggleState() {
  if (action.value === "login") {
    action.value = "register";
    router.replace({
      ...route,
      hash: "#register",
    });
  } else if (action.value === "register") {
    action.value = "login";
    router.replace({
      ...route,
      hash: "#login",
    });
  } else {
    action.value = "login";
    router.replace({
      ...route,
      hash: "#login",
    });
  }

  await wait(100);
  if (route.query.username) {
    document.querySelector<HTMLInputElement>('input[name="username"]')!.value =
      route.query.username as string;
    document
      .querySelector<HTMLInputElement>(
        `input[name="${action.value === "login" ? "password" : "email"}"]`
      )!
      .focus();
  } else {
    document.querySelector<HTMLInputElement>('input[name="username"]')!.focus();
  }
}

async function redirect() {
  toast.hide();
  let redirectLoc = route.query.redirect
    ? (route.query.redirect as string)
    : "/dashboard";
  await router.replace(redirectLoc);
}

async function mounted() {
  // if (user.loggedIn) await redirect();
  if (route.hash === "#register") {
    action.value = "register";
  } else if (route.hash === "#login") {
    action.value = "login";
  } else {
    action.value = "login";
    router.replace({
      ...route,
      hash: "#login",
    });
  }
  if (route.query.username) {
    document.querySelector<HTMLInputElement>('input[name="username"]')!.value =
      route.query.username as string;
    document.querySelector<HTMLInputElement>('input[name="password"]')!.focus();
  } else {
    document.querySelector<HTMLInputElement>('input[name="username"]')!.focus();
  }
}

async function login(data: {
  username: string;
  password: string;
  remember: boolean;
}) {
  if (!online.value) {
    toast.connectivityOffline();
    return;
  }
  processing.value = true;
  try {
    const res = await user.login(data.username, data.password, data.remember);
    if (typeof res === "boolean") {
      if (res) {
        await redirect();
      } else {
        toast.show("This should not be seen");
      }
    } else {
      const handled = await defaultErrorHandler(res, router);
      if (!handled) {
        switch (res.code) {
          case "INVALID_USER_ERROR":
            toast.invalidUsernameEmail();
            break;
          case "INVALID_PASSWORD_ERROR":
            toast.invalidPassword();
            break;
          default:
            toast.genericError();
            console.error(res);
            break;
        }
      }
    }
  } catch (e) {
    toast.clientError();
    console.error(e);
  } finally {
    processing.value = false;
  }
}

async function register(data: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  remember: boolean;
}) {
  if (!online.value) {
    toast.connectivityOffline();
    return;
  }
  processing.value = true;
  try {
    const res = await user.register(
      data.username,
      data.email,
      data.password,
      data.confirmPassword,
      data.remember
    );
    if (typeof res === "boolean") {
      if (res) {
        await redirect();
      } else {
        toast.show("This should not be seen");
      }
    } else {
      const handled = await defaultErrorHandler(res, router);
      if (!handled) {
        switch (res.code) {
          case "USER_EXISTS_ERROR":
            toast.show("Someone already has that username!");
            break;
          case "INVALID_USERNAME_ERROR":
            toast.show(
              "Uh oh! Looks like your username contains invalid characters!"
            );
            break;
          case "INVALID_EMAIL_ERROR":
            toast.show("Uh oh! Looks like you provided an invalid email!");
            break;
          default:
            toast.genericError();
            console.error(res);
            break;
        }
      }
    }
  } catch (e) {
    toast.show((e as Cumulonimbus.ResponseError).message);
  } finally {
    processing.value = false;
  }
}

onMounted(mounted);
</script>

<style>
.state-toggle {
  margin: 1em 0 1.75em;
}
</style>
