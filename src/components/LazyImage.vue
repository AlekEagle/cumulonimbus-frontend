<template>
  <img
    class="lazy"
    v-if="done"
    ref="lazyImg"
    :alt="alt"
    :src="$data.lazyBlobURL || failedSrc"
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
      }
    },
    data() {
      return {
        done: false,
        lazyBlobURL: undefined,
        currentTries: 0,
        timeout: undefined
      };
    },
    watch: {
      src() {
        this.loadIcon();
      }
    }
  })
  export default class LazyImage extends Vue {
    declare src: string;
    declare alt: string;
    declare tries: number;
    declare wait: number;
    declare $data: {
      done: boolean;
      lazyBlobURL?: string;
      currentTries: number;
      timeout?: number;
    };

    async loadIcon() {
      this.$data.timeout = undefined;
      try {
        let res = await fetch(this.src);
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
      if (++this.$data.currentTries <= this.tries) {
        this.$data.timeout = setTimeout(this.loadIcon, this.wait);
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
