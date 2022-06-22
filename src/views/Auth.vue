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

const user = userStore(),
  router = useRouter(),
  route = useRoute(),
  action = ref<"login" | "register">("login"),
  processing = ref(false),
  toast = toastStore(),
  loginForm = ref<typeof Form>(),
  registerForm = ref<typeof Form>();

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
}

async function redirect() {
  let redirLoc = route.query.redirect
    ? (route.query.redirect as string)
    : "/dashboard";
  await router.replace(redirLoc);
}

async function mounted() {
  if (user.loggedIn) await redirect();
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
}

async function login(data: {
  username: string;
  password: string;
  remember: boolean;
}) {
  processing.value = true;
  try {
    const res = await user.login(data.username, data.password, data.remember);
    if (typeof res === "string") {
      toast.show(res);
    } else if (typeof res === "number") {
      toast.rateLimit(res);
    } else if (res) {
      await redirect();
    } else {
      toast.show("Something went wrong.");
    }
  } catch (e) {
    toast.show((e as Cumulonimbus.ResponseError).message);
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
  processing.value = true;
  try {
    const res = await user.register(
      data.username,
      data.email,
      data.password,
      data.confirmPassword,
      data.remember
    );
    if (typeof res === "string") {
      toast.show(res);
    } else if (typeof res === "number") {
      toast.rateLimit(res);
    } else if (res) {
      await redirect();
    } else {
      toast.show("Something went wrong.");
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
