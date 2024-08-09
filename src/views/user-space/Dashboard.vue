<template>
  <h1>Dashboard</h1>
  <h2>Welcome to your dashboard, {{ user.account!.user.username }}.</h2>
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
      :disabled="!user.account?.user.verifiedAt"
    >
      Upload a file to Cumulonimbus without the need of an external service or
      program.
    </ContentBox>
  </div>
</template>

<script lang="ts" setup>
  // Vue Components
  import ContentBox from '@/components/ContentBox.vue';
  import RouterButton from '@/components/RouterButton.vue';

  // In-House Modules
  import fileIcon from '@/assets/images/file.svg';
  import infoIcon from '@/assets/images/info.svg';
  import profileIcon from '@/assets/images/profile.svg';
  import uploadIcon from '@/assets/images/upload.svg';

  // Store Modules
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';

  // External Modules
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';

  const user = userStore(),
    toast = toastStore(),
    processing = ref<boolean>(false),
    router = useRouter();

  async function logout() {
    processing.value = true;
    try {
      let res = await user.logout();
      if (res) {
        router.push('/');
      } else toast.genericError();
    } catch (e) {
      toast.clientError();
      console.error(e);
    } finally {
      processing.value = false;
    }
  }
</script>
