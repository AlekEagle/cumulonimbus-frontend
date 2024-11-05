<template>
  <h1>File Details</h1>
  <h2>View and manage this file.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/staff/files" />
    <button
      @click="deleteFileModal!.show()"
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
      v-text="copied ? 'Copied to clipboard!' : 'Share'"
    />
    <button @click="download" :disabled="file.loading || file.errored">
      Download
    </button>
    <button
      @click="renameFileModal!.show()"
      :disabled="file.loading || file.errored"
    >
      Rename
    </button>
    <button
      @click="editFileExtensionModal!.show()"
      :disabled="file.loading || file.errored"
    >
      Edit Extension
    </button>
  </div>
  <Online>
    <template v-if="!file.loading">
      <template v-if="!file.errored">
        <div class="content-box-container">
          <template v-if="file.data">
            <ContentBox
              :title="file.data.name ?? file.data.id"
              :src="fileIcon"
              :to="fileUrl"
              theme-safe
              nowrap
            >
              <span class="sb-code-label">
                <p>Saved on Cumulonimbus as:</p>
                <code v-text="file.data.id" />
              </span>
              <span class="sb-code-label">
                <p>Uploaded:</p>
                <code v-text="toDateString(new Date(file.data.createdAt))" />
              </span>
              <span class="sb-code-label">
                <p>Last modified:</p>
                <code v-text="toDateString(new Date(file.data.updatedAt))" />
              </span>
              <span class="sb-code-label">
                <p>Size:</p>
                <code v-text="size(file.data.size)" />
              </span>
              <p>Click me to open the file in a new tab.</p>
            </ContentBox>
          </template>
          <LoadingMessage spinner v-else />
        </div>
        <Separator v-if="file.data && !file.errored" />
        <div class="content-box-container" v-if="file.uploader">
          <ContentBox
            title="Uploaded by"
            :src="profileIcon"
            :to="`/staff/user?id=${file.uploader.id}`"
            theme-safe
          >
            <p>
              {{ file.uploader.username }} (<code>{{ file.uploader.id }}</code
              >)
            </p>
          </ContentBox>
        </div>
      </template>
      <div v-else>
        <h1>Something went wrong.</h1>
        <button @click="fetchFile">Retry</button>
      </div>
    </template>
    <LoadingMessage spinner v-else />
  </Online>
  <ConfirmModal
    ref="deleteFileModal"
    @submit="deleteFile"
    title="Are you sure?"
  >
    <p>Are you sure you want to delete this file?</p>
    <p>
      <code>{{ file.data!.id }}</code> will be lost forever! (A long time!)
    </p>
  </ConfirmModal>
  <FormModal ref="renameFileModal" @submit="renameFile" title="Rename File">
    <p>
      Give the file a new name so you can recognize it easier, or leave it blank
      to reset it.
    </p>
    <strong
      >This does not affect the name the file is saved as, it will forever be
      <code v-text="file.data!.id"
    /></strong>
    <br />
    <input
      type="text"
      :placeholder="file.data!.id"
      :value="file.data!.name ?? ''"
      name="filename"
    />
    <template #after-form>
      <div class="modal-footer">
        <button @click="deleteFilename" v-if="file.data?.name">
          Clear Name
        </button>
      </div>
    </template>
  </FormModal>
  <FormModal
    ref="editFileExtensionModal"
    @submit="editFileExtension"
    title="Edit File Extension"
  >
    <p>
      If Cumulonimbus chose the wrong file extension, you can change it here.
    </p>
    <strong>
      This will not affect the file's contents. Any links using the old
      extension will break and you will have to share the new one.
    </strong>
    <br />
    <div class="file-extension-container">
      <p @click="extensionInput!.focus()">{{ idNoExtension }}.</p>
      <input
        type="text"
        placeholder="extension"
        :value="idExtension"
        name="extension"
        ref="extensionInput"
        required
      />
    </div>
  </FormModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import FormModal from '@/components/FormModal.vue';
  import LoadingMessage from '@/components/LoadingMessage.vue';
  import Online from '@/components/Online.vue';
  import Separator from '@/components/Separator.vue';

  // In-House Modules
  import backWithFallback from '@/utils/routerBackWithFallback';
  import fileIcon from '@/assets/images/file.svg';
  import profileIcon from '@/assets/images/profile.svg';
  import size from '@/utils/size';
  import toDateString from '@/utils/toDateString';
  import loadWhenOnline from '@/utils/loadWhenOnline';

  // Store Modules
  import { fileStore } from '@/stores/staff-space/file';
  import { filesStore } from '@/stores/staff-space/files';
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';

  // External Modules
  import { ref, onMounted, computed } from 'vue';
import { useClipboard, useShare } from '@vueuse/core';
  import { useOnline } from '@/utils/ConnectivityCheck';
  import { useRouter } from 'vue-router';

  const toast = toastStore(),
    user = userStore(),
    file = fileStore(),
    files = filesStore(),
    router = useRouter(),
    online = useOnline(),
    fileUrl = computed(() => {
      if (file.data) return `https://cdn.alekeagle.me/${file.data.id}`;
    }),
    filename = computed(() => {
      if (file.data) return file.data.name ?? file.data.id;
      return '';
    }),
    idNoExtension = computed(() => {
      if (file.data) return file.data.id.split('.')[0];
      return '';
    }),
    idExtension = computed(() => {
      if (file.data) return file.data.id.split('.').slice(1).join('.');
      return '';
    }),
    deleteFileModal = ref<InstanceType<typeof ConfirmModal>>(),
    renameFileModal = ref<InstanceType<typeof FormModal>>(),
    editFileExtensionModal = ref<InstanceType<typeof FormModal>>(),
    extensionInput = ref<HTMLInputElement>(),
    { isSupported: clipboardIsSupported, copy, copied } = useClipboard(),
    { share, isSupported: shareIsSupported } = useShare();

  async function fetchFile() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      await file.getFile(router.currentRoute.value.query.id as string);
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  onMounted(async () =>
    loadWhenOnline(
      fetchFile,
      !file.data || file.data.id !== router.currentRoute.value.query.id,
    ),
  );

  async function renameFile(data: { filename: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await file.editFilename(data.filename);
      if (status) {
        toast.show('File renamed.');
        await files.getFiles(files.page);
        await renameFileModal.value!.hide();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function deleteFilename() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await file.deleteFilename();
      if (status) {
        toast.show('Removed filename.');
        await files.getFiles(files.page);
        await renameFileModal.value!.hide();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function editFileExtension(data: { extension: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await file.editFileExtension(data.extension);
      if (status) {
        toast.show('File extension edited.');
        await files.getFiles(files.page);
        await router.replace({
          query: {
            id: file.data?.id,
          },
        });
        await editFileExtensionModal.value!.hide();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function deleteFile(choice: boolean) {
    if (!choice) {
      deleteFileModal.value!.hide();
      return;
    }
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await file.deleteFile();
      if (status) {
        toast.show('File deleted.');
        await deleteFileModal.value!.hide();
        await files.getFiles(files.page);
        await backWithFallback(router, '/staff/files', true);
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
        url: `https://${user.domain}/${file.data!.id}`,
      });
    } else {
      if (clipboardIsSupported) {
        await copy(`https://${user.domain}/${file.data!.id}`);
        toast.show('Copied to clipboard.');
      } else {
        toast.show('Clipboard not supported.');
      }
    }
  }

  async function download() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    if (file.data) {
      // Download the file as a blob
      const blob = await (await fetch(fileUrl.value!)).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.data.name ?? file.data.id;
      a.click();
    }
  }
</script>

<style>
  .file-extension-container {
    padding: 0;
    width: fit-content;
    border-radius: 10px;
    border: 1px solid var(--ui-border);
    background-color: var(--ui-background);
    transition: background-color 0.25s, border 0.25s;
    margin: 10px auto 0;
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: baseline;
  }

  .file-extension-container:hover:not(.disabled),
  .file-extension-container:focus-within:not(.disabled) {
    background-color: var(--ui-background-hover);
    border: 1px solid var(--ui-border-hover);
  }

  .file-extension-container.disabled {
    cursor: not-allowed;
    border: 1px solid var(--ui-border-disabled);
    background-color: var(--ui-background-disabled);
  }

  .file-extension-container p {
    margin: 0;
    padding-left: 10px;
    font-weight: 600;
    font-family: var(--font-heading);
  }

  .file-extension-container input {
    padding: 10px 10px 10px 0;
    margin: 0;
    width: 10ch;
    text-align: left;
    border: none;
    background-color: transparent;
  }

  .file-extension-container input:focus,
  .file-extension-container input:hover {
    border: none;
    background-color: transparent;
  }
</style>
