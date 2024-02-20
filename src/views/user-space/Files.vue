<template>
  <h1>Your Files</h1>
  <h2>What you've uploaded is right here.</h2>
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
    :item-count="files.data?.count || 0"
    :disabled="files.loading || !online"
  >
    <Online>
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
      <SkeletonContentBoxes v-else />
    </Online>
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
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import FullscreenLoadingBlurb from '@/components/FullscreenLoadingBlurb.vue';
  import Online from '@/components/Online.vue';
  import Paginator from '@/components/Paginator.vue';
  import PreviewContentBox from '@/components/PreviewContentBox.vue';
  import SkeletonContentBoxes from '@/components/SkeletonContentBoxes.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import loadWhenOnline from '@/utils/loadWhenOnline';

  // Store Modules
  import { displayPrefStore } from '@/stores/displayPref';
  import { filesStore } from '@/stores/user-space/files';
  import { toastStore } from '@/stores/toast';

  // External Modules
  import { ref, onMounted } from 'vue';
  import { useOnline } from '@vueuse/core';

  const files = filesStore(),
    page = ref(0),
    displayPref = displayPrefStore(),
    toast = toastStore(),
    selecting = ref(false),
    selected = ref<string[]>([]),
    online = useOnline(),
    confirmModal = ref<typeof ConfirmModal>(),
    fullscreenLoadingBlurb = ref<typeof FullscreenLoadingBlurb>();

  async function fetchFiles() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    window.scrollTo(0, 0);
    try {
      await files.getFiles(page.value);
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  onMounted(() =>
    loadWhenOnline(fetchFiles, !files.data || files.page !== page.value),
  );

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
      if (status >= 0) {
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
