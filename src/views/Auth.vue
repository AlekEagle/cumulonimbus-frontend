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
    <Online>
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
        <p>
          By creating an account, you agree to the
          <a target="_blank" ref="noopener" href="/tos">Terms of Service</a> and
          <a target="_blank" rel="noopener" href="/privacy">Privacy Policy</a>.
        </p>
      </template>
      <template v-else>
        <h1>How</h1>
      </template>
    </Online>
  </EmphasizedBox>
</template>

<script lang="ts" setup>
  // Vue Components
  import EmphasizedBox from '@/components/EmphasizedBox.vue';
  import Form from '@/components/Form.vue';
  import Online from '@/components/Online.vue';
  import Switch from '@/components/Switch.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';

  // External Modules
  import { ref, onMounted } from 'vue';
  import { useNetwork } from '@vueuse/core';
  import { useRouter, useRoute } from 'vue-router';

  const user = userStore(),
    router = useRouter(),
    route = useRoute(),
    action = ref<'login' | 'register'>('login'),
    processing = ref(false),
    toast = toastStore(),
    loginForm = ref<typeof Form>(),
    registerForm = ref<typeof Form>(),
    { isOnline: online } = useNetwork();

  async function toggleState() {
    switch (action.value) {
      case 'login':
        action.value = 'register';
        await router.replace({
          ...route,
          hash: '#register',
        });
        break;
      case 'register':
        action.value = 'login';
        await router.replace({
          ...route,
          hash: '#login',
        });
        break;
      default:
        action.value = 'login';
        await router.replace({
          ...route,
          hash: '#login',
        });
        break;
    }

    if (route.query.username) {
      document.querySelector<HTMLInputElement>(
        'input[name="username"]',
      )!.value = route.query.username as string;
      document
        .querySelector<HTMLInputElement>(
          `input[name="${action.value === 'login' ? 'password' : 'email'}"]`,
        )!
        .focus();
    } else {
      document
        .querySelector<HTMLInputElement>('input[name="username"]')!
        .focus();
    }
  }

  async function redirect() {
    toast.hide();
    let redirectLoc = route.query.redirect
      ? (route.query.redirect as string)
      : '/dashboard';
    await router.replace(redirectLoc);
  }

  async function mounted() {
    // if (user.loggedIn) await redirect();
    if (route.hash === '#register') {
      action.value = 'register';
    } else if (route.hash === '#login') {
      action.value = 'login';
    } else {
      action.value = 'login';
      router.replace({
        ...route,
        hash: '#login',
      });
    }
    if (route.query.username) {
      document.querySelector<HTMLInputElement>(
        'input[name="username"]',
      )!.value = route.query.username as string;
      document
        .querySelector<HTMLInputElement>('input[name="password"]')!
        .focus();
    } else {
      document
        .querySelector<HTMLInputElement>('input[name="username"]')!
        .focus();
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
      if (res) await redirect();
    } catch (e) {
      toast.show((e as Error).message);
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
        data.remember,
      );
      if (res) await redirect();
    } catch (e) {
      toast.show((e as Error).message);
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
