<template>
  <div class="page-selector">
    <button @click="prevPage" :disabled="$data.__page <= 0">Prev</button>
    <input
      type="number"
      min="1"
      :max="$props.max > 0 ? $props.max.toString() : '1'"
      @change="pageChange"
      placeholder="Page #"
      :value="$data.__page + 1"
      class="page-number-box"
    />
    <button
      @click="nextPage"
      :disabled="$props.max !== -1 && $data.__page >= $props.max"
      >Next</button
    >
  </div>
  <slot />
  <div class="page-selector">
    <button @click="prevPage" :disabled="$data.__page <= 0">Prev</button>
    <input
      type="number"
      min="1"
      :max="$props.max > 0 ? $props.max.toString() : '1'"
      @change="pageChange"
      placeholder="Page #"
      :value="$data.__page + 1"
      class="page-number-box"
    />
    <button
      @click="nextPage"
      :disabled="$props.max !== -1 && $data.__page >= $props.max"
      >Next</button
    >
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';

  @Options({
    props: {
      min: {
        type: Number,
        default: -1
      },
      max: {
        type: Number,
        default: -1
      }
    },
    emits: ['change'],
    data() {
      return {
        __page: 0
      };
    }
  })
  export default class Paginator extends Vue {
    declare $props: {
      min: number;
      max: number;
    };
    declare $data: {
      __page: number;
    };
    mounted() {
      if (this.$route.query.page as string) {
        this.setPage(parseInt(this.$route.query.page as string), false, false);
        return;
      }

      if (this.$store.state.page[this.$route.path] !== undefined) {
        this.setPage(this.$store.state.page[this.$route.path], true, false);
        return;
      }
    }

    pageChange(event: Event) {
      const input = event.target as HTMLInputElement;
      const page = parseInt(input.value);

      if (page < 1) {
        input.value = '1';
        return;
      }

      if (this.$props.max !== -1 && page > this.$props.max + 1) {
        input.value = (this.$props.max + 1).toString();
        this.setPage(this.$props.max);
        return;
      }

      this.setPage(page, false);
    }

    setPage(page: number, zeroIndexed: boolean = true, emit: boolean = true) {
      if (!page || page <= 0 || (!zeroIndexed && page <= 1)) {
        this.$data.__page = 0;
        this.$router.replace({
          query: { ...this.$route.query, page: undefined }
        });
        if (emit) {
          this.$emit('change', this.$data.__page);
        }
        return;
      }
      if (zeroIndexed) {
        this.$data.__page = page;
      } else {
        this.$data.__page = page - 1;
      }
      this.$router.replace({
        query: { ...this.$route.query, page: this.$data.__page + 1 }
      });
      if (emit) {
        this.$emit('change', this.$data.__page);
      }
    }

    nextPage() {
      if (this.$props.max !== -1 && this.$data.__page >= this.$props.max) {
        return;
      }

      this.setPage(this.$data.__page + 1, true);
    }

    prevPage() {
      if (this.$data.__page <= 0) {
        return;
      }

      this.setPage(this.$data.__page - 1, true);
    }

    get page() {
      return this.$data.__page + 1;
    }

    get pageZeroIndexed() {
      return this.$data.__page;
    }

    set page(page: number) {
      this.setPage(page, false);
    }

    set pageZeroIndexed(page: number) {
      this.setPage(page);
    }

    reset() {
      this.setPage(0, true, false);
    }
  }
</script>
