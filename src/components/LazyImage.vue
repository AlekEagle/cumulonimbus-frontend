<template>
  <img
    class="lazy"
    v-if="$data.done"
    ref="lazyImg"
    :alt="$props.alt"
    :src="$data.lazyBlobURL || $props.failedSrc"
  />
  <Loading v-else />
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import Loading from '@/components/Loading.vue';

  @Options({
    components: { Loading },
    props: {
      src: {
        type: String,
        required: true
      },
      alt: {
        type: String,
        default: 'A lazily loaded image.'
      },
      failedSrc: {
        type: String,
        default: '/assets/images/exclamation-mark.svg'
      },
      tries: {
        type: Number,
        default: 5
      },
      wait: {
        type: Number,
        default: 5000
      },
      errorHandler: {
        type: Function,
        default: (
          res: Response | Error,
          cb: (data?: string | boolean) => void
        ) => {
          cb(true);
        }
      }
    },
    data() {
      return {
        done: false,
        lazyBlobURL: undefined,
        currentTries: 0,
        timeout: undefined,
        hasErrored: false,
        firstLoad: true
      };
    },
    watch: {
      src() {
        this.loadIcon();
      }
    }
  })
  export default class LazyImage extends Vue {
    declare $props: {
      src: string;
      alt: string;
      failedSrc: string;
      tries: number;
      wait: number;
      errorHandler: (
        res: Response | Error,
        cb: (data?: string | boolean) => Promise<void>
      ) => void;
    };
    declare $data: {
      done: boolean;
      lazyBlobURL?: string;
      currentTries: number;
      timeout?: number;
      hasErrored: boolean;
      firstLoad: boolean;
    };

    async loadIcon(
      url: string = this.$props.src,
      skipWaiting: boolean = false
    ) {
      await new Promise(resolve =>
        setTimeout(
          resolve,
          this.$data.firstLoad || skipWaiting ? 0 : this.$props.wait
        )
      );
      try {
        this.$data.firstLoad = false;
        let res = await fetch(url);
        if (res.ok) {
          let slimySlime = await res.blob();
          this.$data.lazyBlobURL = URL.createObjectURL(slimySlime);
          this.$data.done = true;
        } else {
          this.handleFail(res);
        }
      } catch (error) {
        console.error(error);
        this.handleFail(error as Error);
      }
    }

    async handleFail(res: Response | Error) {
      if (this.$data.hasErrored) {
        this.$data.done = true;
        return;
      }
      if (++this.$data.currentTries >= this.$props.tries) {
        this.$data.hasErrored = true;
        await this.loadIcon(this.$props.failedSrc, true);
      }
      const callback = async (data?: string | boolean) => {
        switch (typeof data) {
          case 'string':
            await this.loadIcon(data, true);
            return;
          case 'boolean':
            if (data) {
              await this.loadIcon();
              return;
            } else {
              this.$data.hasErrored = true;
              await this.loadIcon(this.$props.failedSrc, true);
              return;
            }
          default:
            await this.loadIcon();
            return;
        }
      };

      this.$props.errorHandler(res, callback);
    }

    mounted() {
      this.loadIcon();
    }

    retry() {
      this.$data.hasErrored = false;
      this.$data.firstLoad = true;
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
