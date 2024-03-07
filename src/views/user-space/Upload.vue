<template>
  <h1>Upload</h1>
  <h2>Do the upload things.</h2>

  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard" />
  </div>

  <EmphasizedBox>
    <Online>
      <div
        class="file-drop-zone"
        ref="fileDropZone"
        @click="fileDialog!.click()"
        tabindex="0"
      >
        <h1 v-text="dropZoneText" />
        <h2>Or click to select a file.</h2>
      </div>
    </Online>
    <div class="upload-buttons-container">
      <button :disabled="!file" @click="file = undefined">Deselect File</button>
      <button :disabled="!file" @click="uploadFile">To Mars it goes!</button>
      <template v-if="uploadData">
        <button
          v-if="clipboardIsSupported"
          v-text="copied ? 'Copied!' : 'Copy URL'"
          @click="copyToClipboard"
        />
        <button v-else @click="inNewTab">Open in new tab</button>
      </template>
    </div>
  </EmphasizedBox>
  <input
    type="file"
    class="file-dialog"
    ref="fileDialog"
    @change="
      onDrop(
        ($event.target as HTMLInputElement).files !== null
          ? Array.from(($event.target as HTMLInputElement).files as FileList)
          : null,
      )
    "
  />
  <FullscreenLoadingMessage ref="fsb" />
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import EmphasizedBox from '@/components/EmphasizedBox.vue';
  import FullscreenLoadingMessage from '@/components/FullscreenLoadingMessage.vue';
  import Online from '@/components/Online.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import defaultErrorHandler from '@/utils/defaultErrorHandler';
  import loadWhenOnline from '@/utils/loadWhenOnline';

  // Store Modules
  import { filesStore } from '@/stores/user-space/files';
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';

  // External Modules
  import { computed, ref, onMounted } from 'vue';
  import { useOnline, useClipboard, useDropZone } from '@vueuse/core';
  import { useRouter } from 'vue-router';

  const fileDropZone = ref<HTMLElement | null>(null),
    fileDialog = ref<HTMLInputElement>(),
    router = useRouter(),
    toast = toastStore(),
    user = userStore(),
    files = filesStore(),
    online = useOnline(),
    { copied, copy, isSupported: clipboardIsSupported } = useClipboard(),
    { isOverDropZone } = useDropZone(fileDropZone, onDrop),
    file = ref<File>(),
    uploadData = ref<Cumulonimbus.Data.SuccessfulUpload>(),
    fsb = ref<typeof FullscreenLoadingMessage>();

  const dropZoneText = computed(() => {
    if (isOverDropZone.value) return 'Drop it here!';
    if (!file.value) return 'Drop your file here.';
    return file.value.name;
  });

  function onDrop(files: File[] | null) {
    if (!files || files.length < 1) return;
    if (files.length > 1)
      return toast.show('You can only upload one file at a time.', 5e3);
    console.log(files[0]);
    file.value = files[0];
  }

  async function uploadFile() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    if (!file.value) {
      toast.show(
        'In order to upload a file, you need a file to upload.',
        7.5e3,
      );
      return;
    }
    try {
      uploadData.value = undefined;
      await fsb.value!.show();
      const data = await user.client!.upload(file.value);
      await files.getFiles(files.page);
      uploadData.value = data.result;
      file.value = undefined;
      await copyToClipboard();
    } catch (error) {
      if (error instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(error, router);
        if (!handled) {
          switch (error.code) {
            case 'BODY_TOO_LARGE_ERROR':
              toast.show('Unfortunately, the max file size is 100MB.', 5e3);
              break;
          }
        }
      } else {
        console.error(error);
        toast.clientError();
      }
    } finally {
      fsb.value!.hide();
    }
  }

  async function copyToClipboard() {
    if (!clipboardIsSupported) {
      toast.show(
        "Your browser doesn't support putting the URL on your clipboard, but you can open it in a new tab!",
        7.5e3,
      );
      return;
    }
    try {
      await copy(uploadData.value!.url);
      toast.show('Copied to clipboard!');
    } catch (error) {
      toast.show(
        "I wasn't able to put the URL on your clipboard, but you can try again!",
        7.5e3,
      );
    }
  }

  function inNewTab() {
    window.open(uploadData.value!.url, '_blank');
  }

  async function uploadFromShareTarget() {
    if (router.currentRoute.value.query['shared-file'] === null) {
      const shareTargetCache = await caches.open('share-target-cache');
      const fileRes = await shareTargetCache.match('/shared-file');
      if (!fileRes) return;
      file.value = new File(
        [await fileRes.blob()],
        fileRes.headers.get('Filename') as string,
      );
      await uploadFile();
      shareTargetCache.delete('/shared-file');
    }
  }

  onMounted(() => loadWhenOnline(uploadFromShareTarget));
</script>

<style>
  .file-drop-zone {
    cursor: pointer;
    margin: 10px 15px;
    border: 1px solid var(--ui-border);
    background-color: var(--ui-background);
    border-radius: 10px;
    padding: 10px 15px;
    transition: border 0.25s, background-color 0.25s;
    outline: none;
  }

  .file-drop-zone:focus,
  .file-drop-zone:hover {
    border: 1px solid var(--ui-border-hover);
    background-color: var(--ui-background-hover);
  }

  .upload-buttons-container {
    display: grid;
    grid: auto / 1fr;
  }

  .upload-buttons-container button {
    margin: 5px;
  }

  .file-dialog {
    visibility: hidden;
    width: 0;
    height: 0;
  }
</style>
