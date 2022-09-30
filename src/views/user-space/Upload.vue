<template>
  <h1>Upload</h1>
  <h2>Do the upload things.</h2>

  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard" />
  </div>

  <EmphasizedBox>
    <template v-if="online">
      <div
        class="file-drop-zone"
        ref="fileDropZone"
        @click="fileDialog!.click()"
        tabindex="0"
      >
        <template v-if="!isOverDropZone">
          <template v-if="!file">
            <h1 v-if="!tooManyFiles">Drop your file here.</h1>
            <h1 v-else>That's too many files for me!</h1>
          </template>
          <template v-else>
            <h1 v-text="file.name" />
          </template>
        </template>
        <h1 v-else> Drop it here! </h1>
        <h2>Or click to select a file.</h2>
      </div>
    </template>
    <template v-else>
      <h1>Offline</h1>
      <h2
        >You are currently offline. Please connect to the internet to
        continue.</h2
      >
    </template>
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
          : null
      )
    "
  />
  <FullscreenLoadingBlurb ref="fsb" />
</template>

<script lang="ts" setup>
  import BackButton from '@/components/BackButton.vue';
  import EmphasizedBox from '@/components/EmphasizedBox.vue';
  import FullscreenLoadingBlurb from '@/components/FullscreenLoadingBlurb.vue';
  import { useOnline, useClipboard, useDropZone } from '@vueuse/core';
  import { useRouter } from 'vue-router';
  import { ref, onMounted } from 'vue';
  import { userStore } from '@/stores/user';
  import { toastStore } from '@/stores/toast';
  import defaultErrorHandler from '@/utils/defaultErrorHandler';
  import Cumulonimbus from 'cumulonimbus-wrapper';

  const fileDropZone = ref<HTMLElement | null>(null),
    fileDialog = ref<HTMLInputElement>(),
    router = useRouter(),
    toast = toastStore(),
    user = userStore(),
    online = useOnline(),
    { copied, copy, isSupported: clipboardIsSupported, text } = useClipboard(),
    { isOverDropZone } = useDropZone(fileDropZone, onDrop),
    file = ref<File>(),
    tooManyFiles = ref(false),
    uploadData = ref<Cumulonimbus.Data.SuccessfulUpload>(),
    fsb = ref<typeof FullscreenLoadingBlurb>();

  function onDrop(files: File[] | null) {
    if (!files || files.length < 1) return;
    if (files.length > 1) return showTooManyFiles();
    file.value = files[0];
  }

  function showTooManyFiles() {
    if (tooManyFiles.value) return;
    tooManyFiles.value = true;
    setTimeout(() => {
      tooManyFiles.value = false;
    }, 5000);
  }

  async function uploadFile() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    if (!file.value) {
      toast.show('In order to upload a file, you need a file to upload.', 7500);
      return;
    }
    try {
      uploadData.value = undefined;
      await fsb.value!.show();
      const data = await user.client!.upload(file.value);
      uploadData.value = data.result;
      file.value = undefined;
      await copyToClipboard();
    } catch (error) {
      if (error instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(error, router);
        if (!handled) {
          switch (error.code) {
            case 'BODY_TOO_LARGE_ERROR':
              toast.show('Unfortunately, the max file size is 100MB.');
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
        7500
      );
      return;
    }
    try {
      await copy(uploadData.value!.url);
      toast.show('Copied to clipboard!');
    } catch (error) {
      toast.show(
        "I wasn't able to put the URL on your clipboard, but you can try again!"
      );
    }
  }

  function inNewTab() {
    window.open(uploadData.value!.url, '_blank');
  }

  onMounted(async () => {
    if (router.currentRoute.value.query['shared-file'] === null) {
      const shareTargetCache = await caches.open('share-target-cache');
      const fileRes = await shareTargetCache.match('/shared-file');
      if (!fileRes) return;
      file.value = new File(
        [await fileRes.blob()],
        fileRes.headers.get('Filename') as string
      );
      await uploadFile();
      shareTargetCache.delete('/shared-file');
    }
  });
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
