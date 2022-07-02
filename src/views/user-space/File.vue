<template>
  <h1>File Details</h1>
  <template v-if="online || selfFile.data">
    <template v-if="selfFile.data">
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
      :disabled="selfFile.loading || selfFile.errored"
    >
      Delete
    </button>
    <button
      @click="onShare"
      :disabled="!shareIsSupported && !clipboardIsSupported"
      >Share</button
    >
    <button @click="download" :disabled="selfFile.loading || selfFile.errored">
      Download
    </button>
  </div>
  <div class="content-box-container" v-if="online || selfFile.data">
    <template v-if="!selfFile.loading">
      <template v-if="!selfFile.errored">
        <template v-if="selfFile.data">
          <ContentBox
            :title="selfFile.data.filename"
            :src="fileIconUrl"
            :to="fileUrl"
          >
            <p>
              Uploaded at:
              <code>{{ toDateString(new Date(selfFile.data.createdAt)) }}</code>
            </p>
            <p>
              Size:
              <code>{{ size(selfFile.data.size) }}</code>
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
  <ConfirmModal
    ref="confirmModal"
    @submit="deleteFile"
    title="Are you sure?"
    close-on-submit
  >
    <p>Are you sure you want to delete this file?</p>
    <p>
      <code>{{ selfFile.data!.filename }}</code> will be lost forever! (A long
      time!)
    </p>
  </ConfirmModal>
</template>

<script lang="ts" setup>
  import ContentBox from '@/components/ContentBox.vue';
  import BackButton from '@/components/BackButton.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import { selfFileStore } from '@/stores/selfFile';
  import { selfFilesStore } from '@/stores/selfFiles';
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';
  import { ref, onMounted, watch, computed } from 'vue';
  import toLogin from '@/utils/toLogin';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import { useRouter } from 'vue-router';
  import { useNetwork, useShare, useClipboard } from '@vueuse/core';
  import backWithFallback from '@/utils/routerBackWithFallback';
  import toDateString from '@/utils/dateString';
  import size from '@/utils/size';
  import ConfirmModal from '@/components/ConfirmModal.vue';

  const BaseThumbnailURLs: { [key: string]: string } = {
    production: `${window.location.protocol}//previews.${window.location.host}`,
    prod_preview: 'https://previews.alekeagle.me',
    development: 'http://localhost:8100'
  };

  const toast = toastStore(),
    user = userStore(),
    selfFile = selfFileStore(),
    selfFiles = selfFilesStore(),
    router = useRouter(),
    { isOnline: online } = useNetwork(),
    fileUrl = computed(() => {
      if (selfFile.data) {
        return `${window.location.protocol}//${window.location.host}/${selfFile.data.filename}`;
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
    { share, isSupported: shareIsSupported } = useShare(),
    fileIconUrl = computed(() => {
      if (selfFile.data) {
        return `${BaseThumbnailURLs[import.meta.env.MODE]}/${
          selfFile.data.filename
        }`;
      }
      return '';
    });

  async function fetchFile() {
    if (!online) {
      toast.connectivity();
      return;
    }
    try {
      const status = await selfFile.getFile(
        router.currentRoute.value.query.id as string
      );
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout(true);
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
            await selfFiles.getFiles(selfFiles.page);
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
    }
  }

  onMounted(() => {
    if (!online.value) {
      const unwatchOnline = watch(online, () => {
        if (online.value) {
          if (
            !selfFile.data ||
            selfFile.data.filename !== router.currentRoute.value.query.id
          ) {
            fetchFile();
          }
          unwatchOnline();
        }
      });
    } else if (
      !selfFile.data ||
      selfFile.data.filename !== router.currentRoute.value.query.id
    ) {
      fetchFile();
    }
  });

  async function deleteFile(choice: boolean) {
    if (!choice) {
      return;
    }
    if (!online) {
      toast.connectivity();
      return;
    }
    try {
      const status = await selfFile.deleteFile();
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout(true);
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
            await selfFiles.getFiles(selfFiles.page);
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
        await selfFiles.getFiles(selfFiles.page);
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
        text: 'Check out this file!',
        url: `https://${user.user?.subdomain ? `${user.user.subdomain}.` : ''}${
          user.user?.domain
        }/${selfFile.data!.filename}`
      });
    } else {
      if (clipboardIsSupported) {
        await copy(
          `https://${user.user?.subdomain ? `${user.user.subdomain}.` : ''}${
            user.user?.domain
          }/${selfFile.data!.filename}`
        );
        toast.show('Copied to clipboard.');
      } else {
        toast.show('Clipboard not supported.');
      }
    }
  }

  function download() {
    if (!online) {
      toast.connectivity();
      return;
    }
    if (selfFile.data) {
      const a = document.createElement('a');
      a.href = fileUrl.value;
      a.download = selfFile.data.filename;
      a.click();
    }
  }
</script>
