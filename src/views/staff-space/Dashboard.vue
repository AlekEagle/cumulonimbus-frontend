<template>
  <h1>Staff Dashboard</h1>
  <h2>Welcome, {{ user.user ? user.user.username : 'person' }}!</h2>
  <div class="quick-action-buttons-container">
    <router-link to="/dashboard">
      <button v-text="'User Dashboard'" />
    </router-link>
  </div>
  <div class="content-box-container">
    <ContentBox title="Users" :src="profileIcon" theme-safe to="/staff/users">
      See and manage all users.
    </ContentBox>
    <ContentBox title="Files" :src="fileIcon" theme-safe to="/staff/files">
      See and manage all of the files uploaded.
    </ContentBox>
    <ContentBox title="Domains" :src="gearIcon" theme-safe to="/staff/domains">
      See and manage all of the domains.
    </ContentBox>
    <ContentBox
      title="Setup Guides"
      :src="infoIcon"
      theme-safe
      to="/staff/setup-guides"
    >
      See and manage all of the setup guides.
    </ContentBox>
  </div>
</template>

<script lang="ts" setup>
  import ContentBox from '@/components/ContentBox.vue';
  import profileIcon from '@/assets/images/profile.svg';
  import fileIcon from '@/assets/images/file.svg';
  import infoIcon from '@/assets/images/info.svg';
  import gearIcon from '@/assets/images/gear.svg';
  import { userStore } from '@/stores/user';

  const user = userStore();
</script>
