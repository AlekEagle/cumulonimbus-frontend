<template>
  <div class="content-box-container grow">
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
  import ContentBox from '&/ContentBox.vue';

  // In-House Modules
  import fileIcon from '!/images/file.svg';
  import infoIcon from '!/images/info.svg';
  import profileIcon from '!/images/profile.svg';
  import uploadIcon from '!/images/upload.svg';

  // Store Modules
  import { userStore } from '$/user.js';

  // External Modules
  // No External Modules to import here.

  const user = userStore();
</script>
