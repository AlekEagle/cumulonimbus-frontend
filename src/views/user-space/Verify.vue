<template>
  <h1>Verifying Your Email</h1>
  <h2>This will only take a second.</h2>

  <EmphasizedBox>
    <template v-if="!online">
      <h1>Something went wrong.</h1>
      <h2>Check your internet connection and try again.</h2>
    </template>
    <template v-else-if="statusText">
      <h1 v-text="statusText" />
    </template>
    <template v-else>
      <LoadingMessage spinner />
    </template>
  </EmphasizedBox>
</template>

<script lang="ts" setup>
  // Vue Components
  import EmphasizedBox from '@/components/EmphasizedBox.vue';
  import LoadingMessage from '@/components/LoadingMessage.vue';

  // In-House Modules
  import loadWhenOnline from '@/utils/loadWhenOnline';
  import { wait } from '@/utils/wait';

  // Store Modules
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';

  // External Modules
  import { onMounted, ref } from 'vue';
  import { useOnline } from '@/utils/ConnectivityCheck';
  import { useRouter } from 'vue-router';

  const user = userStore(),
    router = useRouter(),
    online = useOnline(),
    toast = toastStore(),
    statusText = ref('');

  onMounted(() => loadWhenOnline(verifyEmail));

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
      } else {
        statusText.value = 'Something went wrong!';
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
