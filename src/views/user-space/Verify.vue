<template>
  <h1>Verifying Your Email</h1>
  <h2>This will only take a second.</h2>

  <EmphasizedBox>
    <template v-if="statusText">
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
  import { wait } from '@/utils/wait.js';

  // Store Modules
  import { userStore } from '@/stores/user.js';

  // External Modules
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';

  const user = userStore(),
    router = useRouter(),
    statusText = ref('');

  onMounted(verifyEmail);

  async function verifyEmail() {
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
