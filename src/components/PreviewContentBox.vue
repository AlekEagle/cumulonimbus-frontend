<template>
  <div
    class="content-box click-target"
    v-intersection-observer="onInView"
    :href="location.href"
    v-if="selecting"
    @click="spanClicked"
  >
    <div class="content-box-inner">
      <h3 class="title" v-text="props.file.name ?? props.file.id" />
      <template v-if="!props.selected">
        <img
          :class="{ 'theme-safe': noPreview }"
          v-if="imgBlobSrc"
          :src="imgBlobSrc"
          width="80"
          height="80"
        />
        <LoadingSpinner v-else />
      </template>
      <img
        v-else
        class="theme-safe"
        src="@/assets/images/checkmark.svg"
        width="80"
        height="80"
      />
      <div class="content-box-content">
        <p>Click me to select or deselect this file.</p>
      </div>
    </div>
  </div>
  <a
    class="content-box click-target"
    v-intersection-observer="onInView"
    :href="location.href"
    @click.prevent="linkClicked"
    v-else
    title="Pro tip: Hold Ctrl and click to directly open this file in a new tab!"
  >
    <div class="content-box-inner">
      <h3 class="title" v-text="props.file.name ?? props.file.id" />
      <img
        :class="{ 'theme-safe': noPreview }"
        v-if="imgBlobSrc"
        :src="imgBlobSrc"
        width="80"
        height="80"
      />
      <LoadingSpinner v-else />
      <div class="content-box-content">
        <p>Saved on Cumulonimbus as <code v-text="props.file.id" /></p>
      </div>
    </div>
  </a>
</template>

<script lang="ts" setup>
  // Vue Components
  import './ContentBox.vue'; // Importing this to get the CSS
  import LoadingSpinner from './LoadingSpinner.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper'; // We're considering this in-house because I also wrote it.
  import exclamationMarkIcon from '@/assets/images/exclamation-mark.svg';
  import noPreviewIcon from '@/assets/images/no-preview.svg';
  import { wait } from '@/utils/wait';

  // Store Modules
  import { userStore } from '@/stores/user';

  // External Modules
  import { computed, ref, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { vIntersectionObserver } from '@vueuse/components';

  const emit = defineEmits<{
    (event: 'click', file: Cumulonimbus.Data.File): void;
  }>();

  const router = useRouter();
  const noPreview = ref(false);
  const user = userStore();

  const props = defineProps({
    file: {
      type: null,
      required: true,
    },
    selecting: Boolean,
    selected: Boolean,
  });

  const location = computed(() => {
    return router.resolve({
      path: `/${
        router.currentRoute.value.meta.requiresStaff
          ? 'staff/file'
          : 'dashboard/file'
      }`,
      query: {
        id: props.file.id,
      },
    });
  });

  const imgBlobSrc = ref<string>(),
    isObjectURL = ref(false);

  async function linkClicked(e: MouseEvent) {
    if (props.selecting) return;
    if (e.ctrlKey)
      return window.open(`https://cdn.alekeagle.me/${props.file.id}`, '_blank');
    await router.push(location.value);
  }

  async function spanClicked() {
    if (!props.selecting) return;
    emit('click', props.file);
  }

  async function onInView([{ isIntersecting }]: IntersectionObserverEntry[]) {
    if (!isIntersecting) return;
    if (imgBlobSrc.value) return;
    if (noPreview.value) return;
    await loadImage();
  }

  async function loadImage(tryCount: number = 0) {
    if (tryCount > 10) {
      imgBlobSrc.value = exclamationMarkIcon;
      return;
    }
    try {
      const thumbArrayBuf = await user.client!.getThumbnail(props.file.id);
      const blob = new Blob([thumbArrayBuf], {
        type: 'image/webp',
      });
      isObjectURL.value = true;
      imgBlobSrc.value = URL.createObjectURL(blob);
    } catch (error) {
      if (error instanceof Cumulonimbus.ThumbnailError) {
        switch (error.code) {
          case 415:
            noPreview.value = true;
            imgBlobSrc.value = noPreviewIcon;
            break;
          case 504:
          case 408:
            await wait(1000);
            await loadImage(tryCount + 1);
            break;
          default:
            imgBlobSrc.value = exclamationMarkIcon;
            break;
        }
      } else {
        imgBlobSrc.value = exclamationMarkIcon;
      }
    }
  }

  onUnmounted(() => {
    if (!isObjectURL.value) return;
    URL.revokeObjectURL(imgBlobSrc.value!);
  });
</script>
