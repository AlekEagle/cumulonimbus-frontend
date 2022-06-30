<template>
  <h1>Dashboard</h1>
  <h2>Welcome to your dashboard, {{ user.user?.username }}.</h2>
  <div class="quick-action-buttons-container">
    <button
      @click="logout"
      v-text="processing ? 'Logging out...' : 'Logout'"
      :disabled="processing"
    />
  </div>
  <div class="content-box-container">
    <ContentBox
      title="Account"
      src="@/assets/images/profile.svg"
      theme-safe
      to="/dashboard/account"
    >
      See and edit your account.
    </ContentBox>
    <ContentBox
      title="Files"
      src="@/assets/images/file.svg"
      theme-safe
      to="/dashboard/files"
    >
      See and manage all of the files you've uploaded.
    </ContentBox>
    <ContentBox
      title="Quick Setup"
      src="@/assets/images/info.svg"
      theme-safe
      to="/dashboard/quick-setup"
    >
      Quickly setup and connect a service to Cumulonimbus and your account.
    </ContentBox>
    <ContentBox
      title="Upload"
      src="@/assets/images/upload.svg"
      theme-safe
      to="/dashboard/upload"
    >
      Upload a file to Cumulonimbus without the need of an external service or
      program.
    </ContentBox>
  </div>
</template>

<script lang="ts" setup>
  import { userStore } from '@/stores/user';
  import { toastStore } from '@/stores/toast';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import ContentBox from '@/components/ContentBox.vue';

  const user = userStore(),
    toast = toastStore(),
    processing = ref<boolean>(false),
    router = useRouter();

  async function logout() {
    processing.value = true;
    try {
      let res = await user.logout();
      if (typeof res === 'boolean') {
        router.push('/');
      } else {
        switch (res.code) {
          case 'BANNED_ERROR':
            toast.banned();
            break;
          case 'INVALID_SESSION_ERROR':
            router.push('/');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            toast.clientError();
            console.error(res);
            break;
        }
      }
    } catch (e) {
      toast.clientError();
      console.error(e);
    } finally {
      processing.value = false;
    }
  }
</script>
