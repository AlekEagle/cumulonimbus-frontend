<template>
  <h1>Verifying Your Email</h1>
  <h2>This will only take a second.</h2>

  <EmphasizedBox>
    <template v-if="!online">
      <h1>Something went wrong.</h1>
      <h2>Check your internet connection and try again.</h2>
    </template>
    <template v-else-if="statusText">
      <h1>{{ statusText }}</h1>
    </template>
    <template v-else>
      <LoadingBlurb />
    </template>
  </EmphasizedBox>
</template>

<script lang="ts" setup>
  import { onMounted, watch, ref } from 'vue';
  import EmphasizedBox from '@/components/EmphasizedBox.vue';
  import { wait } from '@/utils/wait';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import { userStore } from '@/stores/user';
  import { toastStore } from '@/stores/toast';
  import { useOnline } from '@vueuse/core';
  import { useRouter } from 'vue-router';
  import defaultErrorHandler from '@/utils/defaultErrorHandler';
  import Cumulonimbus from 'cumulonimbus-wrapper';

  const user = userStore(),
    router = useRouter(),
    online = useOnline(),
    toast = toastStore(),
    statusText = ref('');

  onMounted(async () => {
    if (!online.value) {
      const unwatchOnline = watch(online, () => {
        if (online.value) {
          verifyEmail();
          unwatchOnline();
        }
      });
      return;
    }
    verifyEmail();
  });

  async function verifyEmail() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }

    if (!window.location.search.includes('token')) {
      statusText.value = 'Your verification link is invalid!';
      return await returnToDashboard();
    }

    try {
      const res = await user.verifyEmail(
        window.location.search.split('token=')[1],
      );
      if (res) {
        statusText.value = 'Thank you for verifying your email!';
        return await returnToDashboard();
      }
    } catch (error) {
      console.error(error);
      statusText.value = 'Something went wrong!';
      return await returnToDashboard();
    }
  }

  async function returnToDashboard() {
    await wait(4000);
    router.replace({ name: 'user-space-dashboard' });
    return;
  }
</script>
