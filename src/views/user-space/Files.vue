<template>
  <h1>Your Files</h1>
  <h2>Check out everything you've uploaded.</h2>
  <template v-if="online || selfFiles.data">
    <template v-if="selfFiles.data">
      <h2>
        Showing page {{ page + 1 }} of
        {{ (selfFiles.data ? Math.floor(selfFiles.data?.count / 50) : 0) + 1 }}
      </h2>
      <h2> {{ selfFiles.data?.count || 'some number of' }} files in total. </h2>
    </template>
    <h2 class="animated-ellipsis" v-else
      >Alek is individually counting your files</h2
    >
  </template>
  <template v-else>
    <h2>Alek can't count your files because you are offline :(</h2>
  </template>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard" />
    <button
      v-if="!selecting"
      @click="selecting = true"
      :disabled="selfFiles.loading"
    >
      Bulk Delete
    </button>
    <template v-else>
      <button @click="selecting = false" :disabled="selfFiles.loading">
        Cancel
      </button>
      <button @click="displayModal" :disabled="selfFiles.loading">
        Delete Selected
      </button>
    </template>
  </div>
  <Paginator
    v-model="page"
    @page-change="onPageChange"
    :max="selfFiles.data ? Math.floor(selfFiles.data?.count / 50) : 0"
    :disabled="selfFiles.loading || !online"
  >
    <template v-if="online || selfFiles.data">
      <template v-if="!selfFiles.loading">
        <template v-if="!selfFiles.errored">
          <div
            v-if="selfFiles.data && selfFiles.data.count > 0"
            class="content-box-container"
          >
            <PreviewContentBox
              v-for="file in selfFiles.data.items"
              :file="file"
              :selecting="selecting"
              :selected="selected.includes(file.filename)"
              @click="onFileClick(file)"
            />
          </div>
          <div v-else class="no-content-container">
            <h1>There isn't anything here yet...</h1>
            <h2>Go try uploading a file!</h2>
            <router-link to="/dashboard/upload">
              <button>Upload</button>
            </router-link>
          </div>
        </template>
        <div class="no-content-container" v-else>
          <h1>Something went wrong.</h1>
          <button @click="fetchFiles">Retry</button>
        </div>
      </template>
      <div class="no-content-container" v-else>
        <LoadingBlurb />
      </div>
    </template>
    <div class="no-content-container" v-else>
      <h1>Offline</h1>
      <h2
        >You are currently offline. Please connect to the internet to
        continue.</h2
      >
    </div>
  </Paginator>
  <ConfirmModal
    ref="confirmModal"
    title="Are you sure?"
    @submit="deleteSelected"
  >
    <p>Are you sure you want to delete these {{ selected.length }} files?</p>
    <p>They will be lost forever! (A long time!)</p>
  </ConfirmModal>
</template>

<script lang="ts" setup>
  import Paginator from '@/components/Paginator.vue';
  import PreviewContentBox from '@/components/PreviewContentBox.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import BackButton from '@/components/BackButton.vue';
  import { userStore } from '@/stores/user';
  import { selfFilesStore } from '@/stores/selfFiles';
  import { toastStore } from '@/stores/toast';
  import { ref, onMounted, watch } from 'vue';
  import toLogin from '@/utils/toLogin';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import { useRouter } from 'vue-router';
  import { useOnline } from '@vueuse/core';
  import ConfirmModal from '@/components/ConfirmModal.vue';

  const selfFiles = selfFilesStore(),
    user = userStore(),
    page = ref(0),
    toast = toastStore(),
    router = useRouter(),
    selecting = ref(false),
    selected = ref<string[]>([]),
    online = useOnline(),
    confirmModal = ref<typeof ConfirmModal>();

  async function onPageChange() {
    fetchFiles();
  }

  async function fetchFiles() {
    if (!online) {
      toast.connectivity();
      return;
    }
    window.scrollTo(0, 0);
    try {
      const status = await selfFiles.getFiles(page.value);
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

  onMounted(async () => {
    if (!online.value) {
      const unwatchOnline = watch(online, () => {
        if (online.value) {
          if (!selfFiles.data || selfFiles.page !== page.value) {
            fetchFiles();
          }
          unwatchOnline();
        }
      });
      return;
    }
    if (!selfFiles.data || selfFiles.page !== page.value) {
      fetchFiles();
    }
  });

  function displayModal() {
    if (selected.value.length > 0) {
      confirmModal.value!.show();
    } else {
      toast.show('You must select at least one file to delete.');
    }
  }

  async function deleteSelected(choice: boolean) {
    if (!choice) {
      selected.value = [];
      selecting.value = false;
      return;
    }
    if (!online) {
      toast.connectivity();
      return;
    }
    try {
      const status = await selfFiles.deleteFiles(selected.value);
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
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'MISSING_FIELDS_ERROR':
            if (selected.value.length > 0)
              toast.show('You can only select up to 100 files at once.');
            else toast.show('You must select at least one file to delete.');
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      } else if (status < 0) {
        toast.clientError();
      } else {
        toast.show(`Deleted ${status} file${status === 1 ? '' : 's'}.`);
        selected.value = [];
        selecting.value = false;
        await fetchFiles();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    } finally {
      confirmModal.value!.hide();
    }
  }

  function onFileClick(file: Cumulonimbus.Data.File) {
    if (selected.value.includes(file.filename)) {
      selected.value = selected.value.filter(f => f !== file.filename);
    } else {
      selected.value.push(file.filename);
    }
  }
</script>
