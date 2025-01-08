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
        v-if="props.debug"
        class="file-content-box-preview"
        src="https://via.placeholder.com/512"
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
          class="file-content-box-preview no-fit theme-safe"
          :src="exclamationMarkIcon"
          alt="Preview Failed"
        />
        <!-- LOADING -->
        <LoadingSpinner v-else />
      </template>
    </div>
    <div class="file-content-box-content">
      <!-- DEBUG TEXT -->
      <template v-if="props.debug">
        <p class="file-content-box-primary-text">Friendly File Name</p>
        <p class="file-content-box-secondary-text">
          Saved As: <code>abc.xyz</code>
        </p>
      </template>
      <template v-else>
        <p
          class="file-content-box-primary-text"
          v-text="props.file?.name ?? props.file?.id ?? 'No File Loaded'"
        />
        <p class="file-content-box-secondary-text">
          Saved As: <code v-text="props.file?.id ?? 'No File Loaded'" />
        </p>
      </template>
    </div>
    <div class="file-content-box-content-overflow-shadow" />
    <div class="file-content-box-checkbox">
      <label @click.prevent.stop="checkModel">
        <input
          :checked="model.includes(props.file?.id ?? '')"
          type="checkbox"
        />
        <span></span>
      </label>
    </div>
  </a>
</template>

<script setup lang="ts">
  // Vue Components
  import LoadingSpinner from '@/components/LoadingSpinner.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import exclamationMarkIcon from '@/assets/images/exclamation-mark.svg';
  import noPreviewIcon from '@/assets/images/no-preview.svg';
  import { wait } from '@/utils/wait';

  // Store Modules
  import { userStore } from '@/stores/user';

  // External Modules
  import { computed, ref, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { vIntersectionObserver } from '@vueuse/components';

  const router = useRouter();
  const noPreview = ref(false);
  const previewFailed = ref(false);
  const user = userStore();
  const cameIntoView = ref(false);

  const props = defineProps<{
    debug?: boolean;
    file?: Cumulonimbus.Data.File;
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
      name: props.toStaff ? 'staff-space-file' : 'user-space-file',
      query: {
        id: props.file?.id,
      },
    });
  });

  async function linkClicked(e: MouseEvent) {
    console.log('linkClicked');
    if (props.debug) return;
    if (e.ctrlKey)
      return window.open(
        `https://cdn.alekeagle.me/${props.file?.id}`,
        '_blank',
      );
    await router.push(location.value);
  }

  async function loadImage(tryCount: number = 0) {
    if (tryCount > 3) {
      previewFailed.value = true;
    }
    try {
      const thumb = await user.client!.getThumbnail(props.file!.id);
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
          default:
            previewFailed.value = true;
            break;
        }
      }
    }
  }

  function checkModel() {
    console.log('checkModel');
    if (model.value.includes(props.file?.id ?? '')) {
      model.value = model.value.filter((id) => id !== props.file?.id);
    } else {
      model.value.push(props.file?.id ?? '');
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
    background-color: var(--ui-background);
    border: 1px solid var(--ui-border);
    transition: background-color 0.25s, border 0.25s;
    overflow-y: hidden;
    display: grid;
    height: 200px;
    grid-template-columns: 8fr 1fr;
    grid-template-rows: auto 64px;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
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

  html.dark-theme .file-content-box-preview.theme-safe {
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
    grid-column: 1 / span 2;
    text-align: left;
    overflow: auto hidden;
  }

  .file-content-box-primary-text {
    display: inline-table;
    margin: 0 64px 0 0;
    padding: 6px 10px 2px;
    font-size: 1.5rem;
    color: var(--ui-foreground);
    font-family: var(--font-heading);
    font-weight: 600;
    word-break: keep-all;
    white-space: nowrap;
  }

  .file-content-box-secondary-text {
    margin: 0 64px 0 0;
    padding: 2px 10px 6px;
    font-size: 1rem;
    color: var(--ui-foreground);
    font-family: var(--font-body);
    font-weight: 400;
    word-break: keep-all;
    white-space: nowrap;
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

  .file-content-box-content-overflow-shadow {
    position: absolute;
    grid-row: 2 / span 2;
    grid-column: 2 / span 2;
    width: 100%;
    height: calc(100% - 3px);
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--ui-background) 25%
    );
  }

  .file-content-box-checkbox {
    display: flex;
    justify-content: center;
    align-items: center;
    grid-row: 2 / span 2;
    grid-column: 2 / span 2;
    width: 64px;
    height: 64px;
  }

  .file-content-box-checkbox label {
    display: block;
    position: relative;
    padding-left: 16px;
    margin-bottom: 24px;
    cursor: pointer;
    font-size: 22px;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
  }

  .file-content-box-checkbox label input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .file-content-box-checkbox label span {
    position: absolute;
    top: 0;
    left: -5px;
    height: 25px;
    width: 25px;
    background-origin: border-box;
    background-image: radial-gradient(
      circle at 12.5px 12.5px,
      var(--logo-color-bottom),
      var(--logo-color-top)
    );
    border: 1px solid var(--ui-border);
    border-radius: 100%;
    overflow: hidden;
  }

  .file-content-box-checkbox label input:checked ~ span:after {
    transform: scale(0);
  }

  .file-content-box-checkbox label span:after {
    content: '';
    position: relative;
    display: block;
    border-radius: 100%;
    background-color: var(--ui-background);
    top: calc(50% - 2.5px);
    left: calc(50% - 2.5px);
    width: 5px;
    height: 5px;
    transform: scale(6);
    transition: transform 0.25s;
  }
</style>
