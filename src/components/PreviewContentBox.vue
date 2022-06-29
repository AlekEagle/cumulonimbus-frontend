<template>
  <div
    :class="`content-box${props.disabled ? ' disabled' : ''}${
      span ? ' no-select' : ''
    }`"
  >
    <h2 class="title" v-text="props.title" />
    <template v-if="props.src && !props.selected">
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
      v-else-if="props.selected"
      src="@/assets/images/checkmark.svg"
      width="80"
      height="80"
    />
    <div class="content-box-content">
      <slot>
        <p>Imagine leaving a content box empty</p>
      </slot>
    </div>
    <span class="content-box-overlay" v-if="span" @click="spanClicked">
      <a v-if="displayLink" :href="linkToDisplay" @click.prevent="linkClicked">
        <div />
      </a>
    </span>
  </div>
</template>

<script lang="ts" setup>
  import {
    computed,
    ref,
    onMounted,
    onUnmounted,
    getCurrentInstance
  } from 'vue';
  import { useRouter } from 'vue-router';
  import Loading from './Loading.vue';
  import { wait } from '@/utils/wait';
  import './ContentBox.vue';

  const emit = defineEmits(['click']);

  const router = useRouter();
  const noPreview = ref(false);

  const props = defineProps({
    title: {
      type: String,
      default: 'Imagine leaving the title empty'
    },
    src: {
      type: String,
      required: true
    },
    disabled: Boolean,
    to: {
      type: null,
      default: undefined
    },
    selected: Boolean
  });

  const imgSrc = computed(() => {
    // check if src is cross-origin
    const srcStr = (props.src as string).replace(/^@/, '/src');
    const src = new URL(srcStr, window.location.origin);
    if (src.origin !== window.location.origin) {
      return props.src;
    } else return new URL(srcStr, import.meta.url).href;
  });

  const displayLink = computed(() => {
    return props.to !== undefined && props.to !== null && !props.disabled;
  });

  const linkToDisplay = computed(() => {
    if (props.to === undefined || props.to === null) {
      return undefined;
    } else if (typeof props.to === 'string') {
      return props.to;
    } else {
      return router.resolve(props.to).href;
    }
  });

  const span = computed(() => {
      return (
        displayLink.value ||
        props.disabled ||
        !!getCurrentInstance()?.vnode?.props?.onClick
      );
    }),
    imgBlobSrc = ref<string>();

  async function linkClicked() {
    if (props.disabled) return;
    await router.push(props.to);
  }

  async function spanClicked() {
    if (props.disabled) return;
    emit('click');
  }

  async function CORSPreflight(): Promise<boolean> {
    try {
      await fetch(imgSrc.value, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit'
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  async function loadImage(tryCount: number = 0) {
    if (tryCount > 10) {
      imgBlobSrc.value = new URL(
        '/src/assets/images/exclamation-mark.svg',
        import.meta.url
      ).href;
      return;
    }
    if (!props.src) return;
    if (
      new URL(props.src, window.location.origin).origin !==
      window.location.origin
    ) {
      if (!(await CORSPreflight())) {
        imgBlobSrc.value = imgSrc.value;
        return;
      }
    }
    const res = await fetch(imgSrc.value!, { mode: 'cors' });
    switch (res.status) {
      case 200:
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        imgBlobSrc.value = blobUrl;
        break;
      // Unsupported File Type
      case 415:
        imgBlobSrc.value = new URL(
          '/src/assets/images/no-preview.svg',
          import.meta.url
        ).href;
        noPreview.value = true;
        break;
      // Cloudflare Origin Timeout
      case 504:
        await wait(1000);
        await loadImage(tryCount + 1);
        break;
      default:
        imgBlobSrc.value = new URL(
          '/src/assets/images/exclamation-mark.svg',
          import.meta.url
        ).href;
    }
  }

  onUnmounted(() => {
    URL.revokeObjectURL(imgBlobSrc.value!);
  });

  onMounted(() => {
    loadImage();
  });
</script>
