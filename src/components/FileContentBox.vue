<template>
  <a
    class="file-content-box"
    v-intersection-observer="onInView"
    :href="location.href"
    @click.prevent="linkClicked"
  >
    <div class="file-content-box-preview-container">
      <!-- DEBUG IMAGE -->
      <img
        v-if="debug"
        class="file-content-box-preview"
        src="https://cdn.alekeagle.me/eyK3KLBZyc.jpg"
        alt="Preview"
      />
      <!-- CAME INTO VIEW -->
      <template v-else-if="cameIntoView">
        <!-- PREVIEW LOADED -->
        <img
          v-if="imgBlob"
          class="file-content-box-preview"
          :src="imgBlob"
          alt="Preview"
        />
        <!-- NO PREVIEW -->
        <img
          v-else-if="noPreview"
          class="file-content-box-preview no-fit theme-safe"
          :src="noPreviewIcon"
          alt="No Preview"
        />
        <!-- PREVIEW FAILED -->
        <img
          v-else-if="previewFailed"
          class="file-content-box-preview no-fit"
          :src="exclamationMarkIcon"
          alt="Preview Failed"
        />
        <!-- LOADING -->
        <LoadingSpinner v-else />
      </template>
    </div>
    <div class="file-content-box-content">
      <!-- DEBUG TEXT -->
      <template v-if="debug">
        <p
          class="file-content-box-primary-text"
          title="Friendly File Name That is Long Enough to Overflow Hopefully"
          >Friendly File Name That is Long Enough to Overflow Hopefully</p
        >
        <p class="file-content-box-secondary-text">
          Saved As: <code>abc.xyz</code>
        </p>
      </template>
      <template v-else>
        <p
          class="file-content-box-primary-text"
          :title="file?.name ?? file?.id ?? 'No File Loaded'"
          v-text="file?.name ?? file?.id ?? 'No File Loaded'"
        />
        <p class="file-content-box-secondary-text">
          Saved As: <code v-text="file?.id ?? 'No File Loaded'" />
        </p>
      </template>
    </div>
    <div class="file-content-box-checkbox">
      <Checkmark
        :checked="model.includes(file?.id ?? debugId!)"
        @click.prevent.stop="checkModel"
      />
    </div>
  </a>
</template>

<script setup lang="ts">
  // Vue Components
  import LoadingSpinner from '&/LoadingSpinner.vue';
  import Checkmark from '&/Checkmark.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import exclamationMarkIcon from '!/images/exclamation-mark.svg';
  import noPreviewIcon from '!/images/no-preview.svg';
  import { wait } from '#/wait.js';

  // Store Modules
  import { userStore } from '$/user.js';

  // External Modules
  import { computed, ref, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { vIntersectionObserver } from '@vueuse/components';

  const router = useRouter();
  const noPreview = ref(false);
  const previewFailed = ref(false);
  const user = userStore();
  const cameIntoView = ref(false);

  const { debug, debugId, file, toStaff } = defineProps<{
    debug?: boolean;
    debugId?: string;
    file?: Pick<Cumulonimbus.Data.File, 'id' | 'name'>;
    toStaff?: boolean;
  }>();

  const model = defineModel<string[]>({ required: true });

  const imgBlob = ref<string>();

  async function onInView([{ isIntersecting }]: IntersectionObserverEntry[]) {
    if (!isIntersecting) return;
    if (cameIntoView.value) return;
    cameIntoView.value = true;
    if (imgBlob.value) return;
    if (noPreview.value) return;
    await loadImage();
  }

  const location = computed(() => {
    return router.resolve({
      name: toStaff ? 'staff-space-file' : 'user-space-file',
      query: {
        id: file?.id,
      },
    });
  });

  async function linkClicked(e: MouseEvent) {
    console.log('linkClicked');
    if (debug) return;
    // Open in new tab if Ctrl key (or Cmd key on Mac) is pressed
    if (
      (e.ctrlKey && !/Mac/i.test(navigator.platform)) ||
      (e.metaKey && /Mac/i.test(navigator.platform))
    )
      return window.open(`${__CDN_BASE_URL__}/${file?.id}`, '_blank');
    await router.push(location.value);
  }

  async function loadImage(tryCount: number = 0) {
    if (tryCount > 3) {
      previewFailed.value = true;
    }
    try {
      const thumb = await user.client!.getThumbnail(file!.id);
      const blob = new Blob([thumb], { type: 'image/webp' });
      imgBlob.value = URL.createObjectURL(blob);
    } catch (error) {
      if (error instanceof Cumulonimbus.ThumbnailError) {
        switch (error.code) {
          case 415:
            noPreview.value = true;
            break;
          case 504:
          case 408:
            await wait(1000);
            await loadImage(tryCount + 1);
            break;
          case 502:
          default:
            previewFailed.value = true;
            break;
        }
      } else {
        previewFailed.value = true;
      }
    }
  }

  function checkModel() {
    console.log('checkModel');
    if (model.value.includes(file?.id ?? debugId!)) {
      model.value = model.value.filter((id) => id !== (file?.id ?? debugId!));
    } else {
      model.value.push(file?.id ?? debugId!);
    }
  }

  onUnmounted(() => {
    if (imgBlob.value) URL.revokeObjectURL(imgBlob.value);
  });
</script>

<style>
  .file-content-box-container {
    display: grid;
    height: fit-content;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 10px;
    width: fit-content;
    max-width: calc(100% - 20px);
    margin: 0 auto;
  }

  .file-content-box {
    position: relative;
    max-width: 512px;
    border-radius: 10px;
    background-color: var(--look-page);
    border: 1px solid var(--look-page-text);
    transition:
      background-color var(--theme-switch-time) ease,
      border var(--theme-switch-time) ease;
    overflow-y: hidden;
    display: grid;
    height: 200px;
    grid-template-columns: minmax(0, 1fr) 64px;
    grid-template-rows: 1fr 64px;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
    text-decoration: none;
  }

  .file-content-box-preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    overflow: hidden;
    grid-row: 1 / span 1;
    grid-column: 1 / span 2;
  }

  .file-content-box-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  html.dark-mode .file-content-box-preview.theme-safe {
    filter: invert(100%);
  }

  .file-content-box-preview.no-fit {
    object-fit: contain;
  }

  .file-content-box-content {
    display: flex;
    flex-direction: column;
    justify-content: left;
    grid-row: 2 / span 1;
    grid-column: 1 / span 1;
    min-width: 0;
    text-align: left;
  }

  .file-content-box-primary-text {
    padding: 0px 10px;
    font-size: 1.5rem;
    color: var(--look-page-text);
    font-family: var(--font-heading);
    font-weight: 600;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-content-box-secondary-text {
    padding: 0px 10px;
    font-size: 1rem;
    color: var(--look-page-text);
    font-family: var(--font-body);
    font-weight: 400;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-content-box-content::-webkit-scrollbar {
    width: 3px;
    height: 3px;
  }

  .file-content-box-content::-webkit-scrollbar-thumb {
    height: 3px;
    visibility: hidden;
  }

  .file-content-box-content:hover::-webkit-scrollbar-thumb {
    visibility: visible;
  }

  .file-content-box-checkbox {
    display: flex;
    justify-content: center;
    align-items: center;
    grid-row: 2 / span 1;
    grid-column: 2 / span 1;
    width: 64px;
    height: 64px;
  }
</style>
