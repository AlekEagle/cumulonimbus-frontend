<template>
  <h1>Your Files</h1>
  <template v-if="online || files.data">
    <template v-if="files.data">
      <h2>
        Check out everything you've uploaded.
        <br />
        Showing page {{ (page + 1).toLocaleString() }} of
        {{
          (files.data ? Math.ceil(files.data.count / 50) : 1).toLocaleString()
        }}
        <br />
        {{
          files.data?.count
            ? files.data.count.toLocaleString()
            : 'some number of'
        }}
        files in total.
      </h2>
    </template>
    <h2 class="animated-ellipsis" v-else>Counting each individual file</h2>
  </template>
  <template v-else>
    <h2>You're offline. Please connect to the internet to continue.</h2>
  </template>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard" />
    <button
      v-if="!selecting"
      @click="selecting = true"
      :disabled="files.loading"
    >
      Bulk Delete
    </button>
    <template v-else>
      <button @click="cancelSelection" :disabled="files.loading">Cancel</button>
      <button @click="displayModal" :disabled="files.loading">
        Delete Selected
      </button>
    </template>
  </div>
  <Paginator
    v-model="page"
    @page-change="fetchFiles"
    :max="files.data ? Math.ceil(files.data?.count / 50) - 1 : 0"
    :disabled="files.loading || !online"
  >
    <template v-if="online || files.data">
      <template v-if="!files.loading">
        <template v-if="!files.errored">
          <div
            v-if="files.data && files.data.count > 0"
            class="content-box-container"
          >
            <PreviewContentBox
              v-for="file in files.data.items"
              :file="file"
              :selecting="selecting"
              :selected="selected.includes(file.id)"
              @click="onFileClick(file)"
            />
          </div>
          <div v-else class="no-content-container">
            <h1>There isn't anything here yet...</h1>
            <h2>Go try uploading a file!</h2>
            <RouterLink to="/dashboard/upload">
              <button>Upload</button>
            </RouterLink>
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
      <h2>
        You are currently offline. Please connect to the internet to continue.
      </h2>
    </div>
  </Paginator>
  <ConfirmModal
    ref="confirmModal"
    title="Are you sure?"
    @submit="deleteSelected"
    :disabled="files.loading"
  >
    <p>Are you sure you want to delete these {{ selected.length }} files?</p>
    <p>They will be lost forever! (A long time!)</p>
  </ConfirmModal>
  <FullscreenLoadingBlurb ref="fullscreenLoadingBlurb" />
</template>

<script lang="ts" setup>
  import Paginator from '@/components/Paginator.vue';
  import PreviewContentBox from '@/components/PreviewContentBox.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import FullscreenLoadingBlurb from '@/components/FullscreenLoadingBlurb.vue';
  import BackButton from '@/components/BackButton.vue';
  import { filesStore } from '@/stores/user-space/files';
  import { toastStore } from '@/stores/toast';
  import { ref, onMounted, watch } from 'vue';
  import toLogin from '@/utils/toLogin';
  import defaultErrorHandler from '@/utils/defaultErrorHandler';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import { useOnline } from '@vueuse/core';
  import { useRouter } from 'vue-router';
  import ConfirmModal from '@/components/ConfirmModal.vue';

  const files = filesStore(),
    page = ref(0),
    toast = toastStore(),
    selecting = ref(false),
    selected = ref<string[]>([]),
    online = useOnline(),
    router = useRouter(),
    confirmModal = ref<typeof ConfirmModal>(),
    fullscreenLoadingBlurb = ref<typeof FullscreenLoadingBlurb>();

  async function fetchFiles() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    window.scrollTo(0, 0);
    try {
      const status = await files.getFiles(page.value);
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          toast.clientError();
        }
      } else if (!status) {
        toast.show("You're not logged in.");
        await toLogin(router);
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
          if (!files.data || files.page !== page.value) {
            fetchFiles();
          }
          unwatchOnline();
        }
      });
      return;
    }
    if (!files.data || files.page !== page.value) {
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
      confirmModal.value!.hide();
      return;
    }
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      fullscreenLoadingBlurb.value!.show();
      const status = await files.deleteFiles(selected.value);
      if (status instanceof Cumulonimbus.ResponseError) {
        if ((status.code = 'MISSING_FIELDS_ERROR')) {
          if (selected.value.length > 0)
            toast.show('You can only select up to 100 files at once.');
          else toast.show('You must select at least one file to delete.');
          return;
        }
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          toast.clientError();
        }
      } else if (status < 0) {
        toast.clientError();
      } else {
        toast.show(`Deleted ${status} file${status === 1 ? '' : 's'}.`);
        selected.value = [];
        selecting.value = false;
        await fetchFiles();
        fullscreenLoadingBlurb.value!.hide();
        await confirmModal.value!.hide();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  function onFileClick(file: Cumulonimbus.Data.File) {
    if (selected.value.includes(file.id)) {
      selected.value = selected.value.filter((f) => f !== file.id);
    } else {
      selected.value.push(file.id);
    }
  }

  function cancelSelection() {
    selecting.value = false;
    selected.value = [];
  }
</script>
