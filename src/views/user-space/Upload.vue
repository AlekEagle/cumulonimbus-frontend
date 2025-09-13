<template>
  <h1>Upload</h1>
  <h2>Do the upload things.</h2>

  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard" />
  </div>

  <EmphasizedBox v-if="!user.account?.user.verifiedAt">
    <h1>Sorry...</h1>
    <h2>But you need to verify your email before you can upload files.</h2>
  </EmphasizedBox>
  <EmphasizedBox v-else>
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
  import defaultErrorHandler from '@/utils/defaultErrorHandler.js';
  import loadWhenOnline from '@/utils/loadWhenOnline.js';
  import { useOnline } from '@/utils/ConnectivityCheck.js';

  // Store Modules
  import { filesStore } from '@/stores/user-space/files.js';
  import { toastStore } from '@/stores/toast.js';
  import { cumulonimbusOptions, userStore } from '@/stores/user.js';

  // External Modules
  import { computed, ref, onMounted } from 'vue';
  import { useClipboard, useDropZone, useFileDialog } from '@vueuse/core';
  import { useRouter } from 'vue-router';

  const fileDropZone = ref<HTMLElement | null>(null),
    files = filesStore(),
    online = useOnline(),
    router = useRouter(),
    toast = toastStore(),
    user = userStore(),
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
    isChromium = computed(
      // @ts-ignore
      () => !!window.chrome && import.meta.env.MODE === 'production',
    );

  onChange((files) => (files ? onDrop(Array.from(files)) : void 0));

  function onDrop(files: File[] | null) {
    if (!files || files.length < 1) return;
    if (files.length > 1)
      return toast.show('You can only upload one file at a time.', 5e3);
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
    if (file.value.size > 100e6)
      // 100MB
      return toast.show(
        'The file you are trying to upload is too large. The maximum file size is 100MB.',
        7.5e3,
      );
    try {
      // If the user is using Chromium, we can use its experimental readable stream as fetch body feature.
      if (isChromium.value) {
        // Reset the progress.
        progress.value = 0;
        progressBytes.value = 0;
        // Create our own damn form data stream because FormData doesn't support being read as a stream.
        // The boundary.
        const boundary = `${'-'.repeat(27)}${Math.pow(2, 20)}`,
          // The content type header.
          contentTypeHeader = `multipart/form-data; boundary=${boundary}`,
          // The beginning boundary.
          boundaryBegin = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${
            file.value!.name
          }"\r\nContent-Type: ${file.value!.type}\r\n\r\n`,
          // The ending boundary.
          boundaryEnd = `\r\n--${boundary}--`;
        // Construct the data stream for the file.
        const multipartFormDataStream = new ReadableStream({
          async start(controller) {
            // Write the boundary to the beginning of the stream.
            controller.enqueue(new TextEncoder().encode(boundaryBegin));
            const reader = file.value!.stream().getReader();
            // Loop through the file and write it to the stream.
            while (true) {
              const { done, value } = await reader.read();
              // If we're done, break out of the loop.
              if (done) break;
              controller.enqueue(value);
            }
            // After the file is written, write the ending boundary.
            controller.enqueue(new TextEncoder().encode(boundaryEnd));
            // Finally, close the stream.
            controller.close();
          },
        });
        // Create a transform stream to track the progress of the upload.
        const transformStream = new TransformStream({
          // Our transform function. (It doesn't actually transform anything, just tracks progress.)
          async transform(chunk, controller) {
            // Add the length of the chunk to the progress bytes.
            progressBytes.value += chunk.byteLength;
            // Set the progress to the percentage of the file uploaded.
            progress.value =
              (progressBytes.value /
                (file.value!.size +
                  boundaryBegin.length +
                  boundaryEnd.length)) *
              100;
            // Enqueue the chunk to the controller.
            controller.enqueue(chunk);
          },
        });
        // Reset the upload data and show the loading message.
        uploadData.value = undefined;
        await fsm.value!.show();
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

        if (data.status !== 201) {
          // Collect ratelimit headers.
          const ratelimitHeaders = {
            limit: Number(data.headers.get('X-Ratelimit-Limit')),
            remaining: Number(data.headers.get('X-Ratelimit-Remaining')),
            reset: Number(data.headers.get('X-Ratelimit-Reset')),
          };
          throw new Cumulonimbus.ResponseError(
            await data.json(),
            ratelimitHeaders,
          );
        } else {
          // Everything went well, so we can get the data.
          await files.getFiles(files.page);
          uploadData.value = await data.json();
          // Clear the file from the input.
          file.value = undefined;
        }
      } else {
        // If the user isn't using Chromium, we can't use the experimental readable stream as fetch body feature, so we upload the file the old-fashioned way.
        uploadData.value = undefined;
        await fsm.value!.show();
        const data = await user.client!.upload(file.value!);
        await files.getFiles(files.page);
        uploadData.value = data.result;
        file.value = undefined;
      }
      // Copy the URL to the clipboard.
      await copyToClipboard();
    } catch (error) {
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          break;
        case 'SECOND_FACTOR_CHALLENGE_REQUIRED':
          console.error('what the hell, this should never happen');
          break;
        case 'NOT_RESPONSE_ERROR':
        case 'NOT_HANDLED':
        default:
          toast.show(
            'There was an error uploading your file. Please try again.',
            7.5e3,
          );
          console.error(error);
          break;
      }
    } finally {
      fsm.value?.hide();
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
    // If the user is coming from a share target, we will automatically upload the file.
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
