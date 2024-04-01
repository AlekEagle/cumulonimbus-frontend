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
        @click="openFileDialog()"
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
  <FullscreenLoadingMessage ref="fsm">
    <ProgressBar :progress="progress" v-if="isChromium" />
  </FullscreenLoadingMessage>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import EmphasizedBox from '@/components/EmphasizedBox.vue';
  import FullscreenLoadingMessage from '@/components/FullscreenLoadingMessage.vue';
  import Online from '@/components/Online.vue';
  import ProgressBar from '@/components/ProgressBar.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import loadWhenOnline from '@/utils/loadWhenOnline';

  // Store Modules
  import { filesStore } from '@/stores/user-space/files';
  import { toastStore } from '@/stores/toast';
  import { cumulonimbusOptions, userStore } from '@/stores/user';

  // External Modules
  import { computed, ref, onMounted } from 'vue';
  import {
    useOnline,
    useClipboard,
    useDropZone,
    useFileDialog,
  } from '@vueuse/core';
  import { useRouter } from 'vue-router';

  const fileDropZone = ref<HTMLElement | null>(null),
    router = useRouter(),
    toast = toastStore(),
    user = userStore(),
    files = filesStore(),
    online = useOnline(),
    { copied, copy, isSupported: clipboardIsSupported } = useClipboard(),
    { isOverDropZone } = useDropZone(fileDropZone, onDrop),
    { open: openFileDialog, onChange } = useFileDialog(),
    file = ref<File>(),
    uploadData = ref<Cumulonimbus.Data.SuccessfulUpload>(),
    fsm = ref<InstanceType<typeof FullscreenLoadingMessage>>(),
    progressBytes = ref(0),
    progress = ref(0);

  const dropZoneText = computed(() => {
      if (isOverDropZone.value) return 'Drop it here!';
      if (!file.value) return 'Drop your file here.';
      return file.value.name;
    }),
    // @ts-ignore
    isChromium = computed(() => !!window.chrome);

  onChange((files) => (files ? onDrop(Array.from(files)) : void 0));

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
    if (file.value.size > 100000000)
      return toast.show(
        'The file you are trying to upload is too large. The maximum file size is 100MB.',
        7.5e3,
      );
    try {
      if (isChromium.value) {
        progress.value = 0;
        progressBytes.value = 0;
        // Create our own damn form data stream because FormData doesn't support being read as a stream.
        const boundary = `${'-'.repeat(27)}${Math.pow(2, 20)}`,
          contentTypeHeader = `multipart/form-data; boundary=${boundary}`,
          boundaryBegin = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${
            file.value!.name
          }"\r\nContent-Type: ${file.value!.type}\r\n\r\n`,
          boundaryEnd = `\r\n--${boundary}--`;
        const multipartFormDataStream = new ReadableStream({
          async start(controller) {
            controller.enqueue(new TextEncoder().encode(boundaryBegin));
            const reader = file.value!.stream().getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
            controller.enqueue(new TextEncoder().encode(boundaryEnd));
            controller.close();
          },
        });
        const transformStream = new TransformStream({
          async transform(chunk, controller) {
            progressBytes.value += chunk.byteLength;
            progress.value =
              (progressBytes.value /
                (file.value!.size +
                  boundaryBegin.length +
                  boundaryEnd.length)) *
              100;
            controller.enqueue(chunk);
          },
        });
        uploadData.value = undefined;
        await fsm.value!.show();
        // TODO: handle errors from the upload endpoint
        const data = await fetch(`${cumulonimbusOptions.baseURL}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': user.account!.session.token,
            'Content-Type': contentTypeHeader,
          },
          body: multipartFormDataStream.pipeThrough(transformStream),
          // @ts-ignore - This is a valid option, but TypeScript doesn't know about it.
          duplex: 'half',
        });
        await files.getFiles(files.page);
        uploadData.value = await data.json();
        file.value = undefined;
      } else {
        uploadData.value = undefined;
        await fsm.value!.show();
        const data = await user.client!.upload(file.value!);
        await files.getFiles(files.page);
        uploadData.value = data.result;
        file.value = undefined;
      }
      await copyToClipboard();
    } catch (error) {
      console.error(error);
      toast.clientError();
    } finally {
      fsm.value!.hide();
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
</style>
