<template>
  <h1>File Details</h1>
  <template v-if="online || file.data">
    <template v-if="file.data">
      <h2>View and manage this file.</h2>
    </template>
    <template v-else>
      <h2 class="animated-ellipsis">Rummaging through your files</h2>
    </template>
  </template>
  <template v-else>
    <h2>You're offline. Please connect to the internet to continue.</h2>
  </template>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard/files" />
    <button
      @click="confirmModal!.show()"
      :disabled="file.loading || file.errored"
    >
      Delete
    </button>
    <button
      @click="onShare"
      :disabled="
        (!shareIsSupported && !clipboardIsSupported) ||
        file.loading ||
        file.errored
      "
      >Share</button
    >
    <button @click="download" :disabled="file.loading || file.errored">
      Download
    </button>
  </div>
  <div class="content-box-container" v-if="online || file.data">
    <template v-if="!file.loading">
      <template v-if="!file.errored">
        <template v-if="file.data">
          <ContentBox
            :title="file.data.filename"
            :src="fileIcon"
            :to="fileUrl"
            theme-safe
            nowrap
          >
            <p>
              Uploaded at:
              <code>{{ toDateString(new Date(file.data.createdAt)) }}</code>
            </p>
            <p>
              Size:
              <code>{{ size(file.data.size) }}</code>
            </p>
            <p> Click me to open the file in a new tab. </p>
          </ContentBox>
        </template>
        <LoadingBlurb v-else />
      </template>
      <div v-else>
        <h1>Something went wrong.</h1>
        <button @click="fetchFile">Retry</button>
      </div>
    </template>
    <LoadingBlurb v-else />
  </div>
  <div v-else>
    <h1>Offline</h1>
    <h2
      >You are currently offline. Please connect to the internet to
      continue.</h2
    >
  </div>
  <ConfirmModal ref="confirmModal" @submit="deleteFile" title="Are you sure?">
    <p>Are you sure you want to delete this file?</p>
    <p>
      <code>{{ file.data!.filename }}</code> will be lost forever! (A long
      time!)
    </p>
  </ConfirmModal>
</template>

<script lang="ts" setup>
  import ContentBox from '@/components/ContentBox.vue';
  import BackButton from '@/components/BackButton.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import { fileStore } from '@/stores/user-space/file';
  import { filesStore } from '@/stores/user-space/files';
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';
  import { ref, onMounted, watch, computed } from 'vue';
  import toLogin from '@/utils/toLogin';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import { useRouter } from 'vue-router';
  import { useOnline, useShare, useClipboard } from '@vueuse/core';
  import fileIcon from '@/assets/images/file.svg';
  import backWithFallback from '@/utils/routerBackWithFallback';
  import toDateString from '@/utils/dateString';
  import size from '@/utils/size';
  import ConfirmModal from '@/components/ConfirmModal.vue';

  const toast = toastStore(),
    user = userStore(),
    file = fileStore(),
    files = filesStore(),
    router = useRouter(),
    online = useOnline(),
    fileUrl = computed(() => {
      if (file.data) {
        if (import.meta.env.MODE === 'prod_preview')
          return `https://alekeagle.me/${file.data.filename}`;
        else
          return `${window.location.protocol}//${window.location.host}/${file.data.filename}`;
      }
      return '';
    }),
    confirmModal = ref<typeof ConfirmModal>(),
    {
      isSupported: clipboardIsSupported,
      copy,
      copied,
      text: clipboardText
    } = useClipboard(),
    { share, isSupported: shareIsSupported } = useShare();

  async function fetchFile() {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const status = await file.getFile(
        router.currentRoute.value.query.id as string
      );
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout();
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INVALID_FILE_ERROR':
            toast.show('This file does not exist.');
            await files.getFiles(files.page);
            await backWithFallback(router, '/dashboard/files');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      } else if (!status) {
        toast.clientError();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  onMounted(() => {
    if (!online.value) {
      const unwatchOnline = watch(online, () => {
        if (online.value) {
          if (
            !file.data ||
            file.data.filename !== router.currentRoute.value.query.id
          ) {
            fetchFile();
          }
          unwatchOnline();
        }
      });
    } else if (
      !file.data ||
      file.data.filename !== router.currentRoute.value.query.id
    ) {
      fetchFile();
    }
  });

  async function deleteFile(choice: boolean) {
    if (!choice) {
      confirmModal.value!.hide();
      return;
    }
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const status = await file.deleteFile();
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout();
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INVALID_FILE_ERROR':
            toast.show('This file does not exist.');
            await files.getFiles(files.page);
            await backWithFallback(router, '/dashboard/files');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('File deleted.');
        await confirmModal.value!.hide();
        await files.getFiles(files.page);
        await backWithFallback(router, '/dashboard/files');
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function onShare() {
    if (shareIsSupported) {
      await share({
        title: 'Cumulonimbus',
        text: 'Check out this file on Cumulonimbus, an open-source cloud hosting platform!',
        url: `https://${user.domain}/${file.data!.filename}`
      });
    } else {
      if (clipboardIsSupported) {
        await copy(`https://${user.domain}/${file.data!.filename}`);
        toast.show('Copied to clipboard.');
      } else {
        toast.show('Clipboard not supported.');
      }
    }
  }

  function download() {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    if (file.data) {
      const a = document.createElement('a');
      a.href = fileUrl.value;
      a.download = file.data.filename;
      a.click();
    }
  }
</script>
