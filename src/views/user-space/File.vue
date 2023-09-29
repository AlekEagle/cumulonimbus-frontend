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
  <div class="content-box-container" v-if="online">
    <template v-if="!file.loading">
      <template v-if="!file.errored">
        <template v-if="file.data">
          <ContentBox
            :title="filename"
            :src="fileIcon"
            :to="fileUrl"
            theme-safe
            nowrap
          >
            <p>
              Saved on Cumulonimbus as:
              <code v-text="file.data.id" />
            </p>
            <p>
              Uploaded at:
              <code v-text="toDateString(new Date(file.data.createdAt))" />
            </p>
            <p>
              Size:
              <code v-text="size(file.data.size)" />
            </p>
            <p>Click me to open the file in a new tab.</p>
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
    <h2>
      You are currently offline. Please connect to the internet to continue.
    </h2>
  </div>
  <ConfirmModal
    ref="deleteFileModal"
    @submit="deleteFile"
    title="Are you sure?"
    :disabled="file.loading"
  >
    <p>Are you sure you want to delete this file?</p>
    <p><code v-text="filename" /> will be lost forever! (A long time!)</p>
  </ConfirmModal>
  <FormModal ref="renameFileModal" @submit="renameFile" title="Rename File" :disabled="file.loading">
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
  </FormModal>
  <FormModal
    ref="editFileExtensionModal"
    @submit="editFileExtension"
    title="Edit File Extension"
    :disabled="file.loading"
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
      <p @click="editFileExtensionModal!.form.form.elements.extension.focus()">
        {{ idNoExtension }}.
      </p>
      <input
        type="text"
        placeholder="extension"
        :value="idExtension"
        name="extension"
        required
      />
    </div>
  </FormModal>
  <FullscreenLoadingBlurb ref="fullscreenLoadingBlurb" />
</template>

<script lang="ts" setup>
import ContentBox from "@/components/ContentBox.vue";
import BackButton from "@/components/BackButton.vue";
import LoadingBlurb from "@/components/LoadingBlurb.vue";
import FullscreenLoadingBlurb from "@/components/FullscreenLoadingBlurb.vue";
import { fileStore } from "@/stores/user-space/file";
import { filesStore } from "@/stores/user-space/files";
import { toastStore } from "@/stores/toast";
import { userStore } from "@/stores/user";
import { ref, onMounted, watch, computed } from "vue";
import Cumulonimbus from "cumulonimbus-wrapper";
import { useRouter } from "vue-router";
import { useOnline, useShare, useClipboard } from "@vueuse/core";
import fileIcon from "@/assets/images/file.svg";
import backWithFallback from "@/utils/routerBackWithFallback";
import toDateString from "@/utils/toDateString";
import size from "@/utils/size";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FormModal from "@/components/FormModal.vue";
import defaultErrorHandler from "@/utils/defaultErrorHandler";

const toast = toastStore(),
  user = userStore(),
  file = fileStore(),
  files = filesStore(),
  router = useRouter(),
  online = useOnline(),
  fileUrl = computed(() => {
    if (file.data) {
      if (import.meta.env.MODE === "ptb")
        return `https://alekeagle.me/${file.data.id}`;
      else
        return `${window.location.protocol}//${window.location.host}/${file.data.id}`;
    }
    return "";
  }),
  filename = computed(() => {
    if (file.data) return file.data.name ?? file.data.id;
    return "";
  }),
  idNoExtension = computed(() => {
    if (file.data) return file.data.id.split(".")[0];
    return "";
  }),
  idExtension = computed(() => {
    if (file.data) return file.data.id.split(".").slice(1).join(".");
    return "";
  }),
  deleteFileModal = ref<typeof ConfirmModal>(),
  renameFileModal = ref<typeof FormModal>(),
  editFileExtensionModal = ref<typeof FormModal>(),
  fullscreenLoadingBlurb = ref<typeof FullscreenLoadingBlurb>(),
  { isSupported: clipboardIsSupported, copy, copied } = useClipboard(),
  { share, isSupported: shareIsSupported } = useShare();

async function fetchFile() {
  if (!online.value) {
    toast.connectivityOffline();
    return;
  }
  try {
    const status = await file.getFile(
      router.currentRoute.value.query.id as string
    );
    if (status instanceof Cumulonimbus.ResponseError) {
      const handled = await defaultErrorHandler(status, router);
      if (!handled) {
        switch (status.code) {
          case "INVALID_FILE_ERROR":
            toast.show("That file does not exist.");
            await files.getFiles(files.page);
            await backWithFallback(router, "/dashboard/files", true);
        }
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
        if (!file.data || file.data.id !== router.currentRoute.value.query.id) {
          fetchFile();
        }
        unwatchOnline();
      }
    });
  } else if (
    !file.data ||
    file.data.id !== router.currentRoute.value.query.id
  ) {
    fetchFile();
  }
});

async function renameFile(data: { filename?: string }) {
  if (!online.value) {
    toast.connectivityOffline();
    return;
  }
  try {
    fullscreenLoadingBlurb.value!.show();
    const status = await file.editFilename(data.filename);
    if (status instanceof Cumulonimbus.ResponseError) {
      const handled = await defaultErrorHandler(status, router);
      if (!handled) {
        switch (status.code) {
          case "INVALID_FILE_ERROR":
            toast.show("That file does not exist.");
            await files.getFiles(files.page);
            await backWithFallback(router, "/dashboard/files", true);
        }
      }
    } else if (!status) {
      toast.clientError();
    } else {
      toast.show("File renamed.");
      await files.getFiles(files.page);
      fullscreenLoadingBlurb.value!.hide();
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
    fullscreenLoadingBlurb.value!.show();
    const status = await file.editFileExtension(data.extension);
    if (status instanceof Cumulonimbus.ResponseError) {
      const handled = await defaultErrorHandler(status, router);
      if (!handled) {
        switch (status.code) {
          case "INVALID_FILE_ERROR":
            toast.show("That file does not exist.");
            await files.getFiles(files.page);
            await backWithFallback(router, "/dashboard/files", true);
        }
      }
    } else if (!status) {
      toast.clientError();
    } else {
      toast.show("File extension edited.");
      await files.getFiles(files.page);
      fullscreenLoadingBlurb.value!.hide();
      await editFileExtensionModal.value!.hide();
      await router.replace({
        query: {
          id: file.data?.id,
        },
      });
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
    fullscreenLoadingBlurb.value!.show();
    const status = await file.deleteFile();
    if (status instanceof Cumulonimbus.ResponseError) {
      const handled = await defaultErrorHandler(status, router);
      if (!handled) {
        switch (status.code) {
          case "INVALID_FILE_ERROR":
            toast.show("That file does not exist.");
            await files.getFiles(files.page);
            await backWithFallback(router, "/dashboard/files", true);
        }
      }
    } else if (!status) {
      toast.clientError();
    } else {
      toast.show("File deleted.");
      await files.getFiles(files.page);
      fullscreenLoadingBlurb.value!.hide();
      await deleteFileModal.value!.hide();
      await backWithFallback(router, "/dashboard/files", true);
    }
  } catch (e) {
    console.error(e);
    toast.clientError();
  }
}

async function onShare() {
  if (shareIsSupported) {
    await share({
      title: "Cumulonimbus",
      text: "Check out this file on Cumulonimbus, an open-source cloud hosting platform!",
      url: `https://${user.domain}/${file.data!.id}`,
    });
  } else {
    if (clipboardIsSupported) {
      await copy(`https://${user.domain}/${file.data!.id}`);
      toast.show("Copied to clipboard.");
    } else {
      toast.show("Sharing is not supported on your device.");
    }
  }
}

function download() {
  if (!online.value) {
    toast.connectivityOffline();
    return;
  }
  if (file.data) {
    const a = document.createElement("a");
    a.href = fileUrl.value;
    a.download = file.data.id;
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
