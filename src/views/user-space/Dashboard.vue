<template>
  <h1>Dashboard</h1>
  <h2>Welcome to your dashboard, {{ user.account?.user.username }}.</h2>
  <div class="quick-action-buttons-container">
    <button
      @click="logout"
      v-text="processing ? 'Logging out...' : 'Logout'"
      :disabled="processing"
    />
    <RouterButton
      to="/staff"
      title="Go to Staff Dashboard"
      v-if="user.account?.user.staff"
    >
      Staff Dashboard
    </RouterButton>
  </div>
  <div class="content-box-container">
    <ContentBox
      title="Account"
      :src="profileIcon"
      theme-safe
      to="/dashboard/account"
    >
      See and edit your account.
    </ContentBox>
    <ContentBox title="Files" :src="fileIcon" theme-safe to="/dashboard/files">
      See and manage all of the files you've uploaded.
    </ContentBox>
    <ContentBox
      title="Setup Guides"
      :src="infoIcon"
      theme-safe
      to="/dashboard/setup-guides"
    >
      Quickly setup and connect a service to Cumulonimbus and your account.
    </ContentBox>
    <ContentBox
      title="Upload"
      :src="uploadIcon"
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
  import RouterButton from '@/components/RouterButton.vue';
  import profileIcon from '@/assets/images/profile.svg';
  import fileIcon from '@/assets/images/file.svg';
  import infoIcon from '@/assets/images/info.svg';
  import uploadIcon from '@/assets/images/upload.svg';

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
            user.logout();
            router.push('/');
            break;
          case 'INVALID_SESSION_ERROR':
            user.logout();
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
