<template>
  <img
    class="lazy"
    v-if="done"
    ref="lazyImg"
    :alt="altText"
    :src="$data.lazyBlobURL || failedLazySrc"
  />
  <Loading v-else />
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import Loading from '@/components/Loading.vue';

  @Options({
    components: { Loading },
    props: {
      src: String,
      alt: String,
      failedSrc: String,
      tries: Number,
      wait: Number
    },
    computed: {
      lazySrc() {
        return this.src;
      },
      altText() {
        return this.alt || 'A lazily loaded image.';
      },
      failedLazySrc() {
        return this.failedSrc || '/assets/images/exclamation-mark.svg';
      },
      maxTries() {
        return this.tries || 5;
      },
      waitPeriod() {
        return this.wait || 5000;
      }
    },
    data() {
      return {
        done: false,
        lazyBlobURL: undefined,
        currentTries: 0,
        timeout: undefined
      };
    }
  })
  export default class LazyImage extends Vue {
    declare lazySrc: string;
    declare altText: string;
    declare maxTries: number;
    declare waitPeriod: number;
    declare $data: {
      done: boolean;
      lazyBlobURL?: string;
      currentTries: number;
      timeout?: number;
    };

    async loadIcon() {
      this.$data.timeout = undefined;
      try {
        let res = await fetch(this.lazySrc);
        if (res.ok) {
          let slimySlime = await res.blob();
          this.$data.lazyBlobURL = URL.createObjectURL(slimySlime);
          this.$data.done = true;
        } else {
          this.handleFail();
        }
      } catch (error) {
        console.error(error);
        this.handleFail();
      }
    }

    handleFail() {
      if (++this.$data.currentTries <= this.maxTries) {
        this.$data.timeout = setTimeout(this.loadIcon, this.waitPeriod);
      } else {
        this.$data.lazyBlobURL;
        this.$data.done = true;
      }
    }

    mounted() {
      this.loadIcon();
    }

    retry() {
      this.$data.done = false;
      this.$data.lazyBlobURL = undefined;
      this.$data.currentTries = 0;
      this.loadIcon();
    }

    beforeUnmount() {
      if (this.$data.timeout) clearTimeout(this.$data.timeout);
      if (this.$data.lazyBlobURL) URL.revokeObjectURL(this.$data.lazyBlobURL);
    }
  }
</script>

<style></style>
