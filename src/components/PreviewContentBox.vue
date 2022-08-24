<template>
  <div class="content-box no-select" v-intersection-observer="onInView">
    <div class="content-box-inner">
      <h3 class="title" v-text="props.file.filename" />
      <template v-if="!props.selected">
        <img
          :class="`${noPreview ? 'theme-safe' : ''}`"
          v-if="imgBlobSrc"
          :src="imgBlobSrc"
          width="80"
          height="80"
        />
        <Loading v-else />
      </template>
      <img
        v-else
        class="theme-safe"
        src="@/assets/images/checkmark.svg"
        width="80"
        height="80"
      />
      <div class="content-box-content" v-if="!props.selecting">
        Click here to see more information about {{ props.file.filename }}.
      </div>
      <div class="content-box-content" v-else>
        Click me to select or deselect this file.
      </div>
    </div>
    <span class="content-box-overlay" @click="spanClicked">
      <a :href="location.href" @click.prevent="linkClicked">
        <div />
      </a>
    </span>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import Loading from './Loading.vue';
  import { wait } from '@/utils/wait';
  import './ContentBox.vue';
  import { userStore } from '@/stores/user';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import noPreviewIcon from '@/assets/images/no-preview.svg';
  import exclamationMarkIcon from '@/assets/images/exclamation-mark.svg';
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
      required: true
    },
    selecting: Boolean,
    selected: Boolean
  });

  const location = computed(() => {
    return router.resolve({
      path: `/${
        router.currentRoute.value.meta.requiresStaff
          ? 'staff/file'
          : 'dashboard/file'
      }`,
      query: {
        id: props.file.filename
      }
    });
  });

  const imgBlobSrc = ref<string>(),
    isObjectURL = ref(false);

  async function linkClicked() {
    if (props.selecting) return;
    await router.push(location.value);
  }

  async function spanClicked() {
    if (!props.selecting) return;
    emit('click', props.file);
  }

  async function onInView([{ isIntersecting }]: [{ isIntersecting: boolean }]) {
    if (!isIntersecting) return;
    if (imgBlobSrc.value) return;
    if (noPreview.value) return;
    loadImage();
  }

  async function loadImage(tryCount: number = 0) {
    if (tryCount > 10) {
      imgBlobSrc.value = exclamationMarkIcon;
      return;
    }
    try {
      const thumbArrayBuf = await user.client!.getThumbnail(
        props.file.filename
      );
      const blob = new Blob([thumbArrayBuf], {
        type: 'image/webp'
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
