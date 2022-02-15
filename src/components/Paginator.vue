<template>
  <div class="page-selector">
    <button @click="prevPage" :disabled="$data.page <= 0">Prev</button>
    <input
      type="number"
      min="1"
      :max="max > 0 ? max.toString() : '1'"
      @change="pageChange"
      placeholder="Page #"
      :value="$data.page + 1"
      class="page-number-box"
    />
    <button @click="nextPage" :disabled="max !== -1 && $data.page >= max"
      >Next</button
    >
  </div>
  <slot />
  <div class="page-selector">
    <button @click="prevPage" :disabled="$data.page <= 0">Prev</button>
    <input
      type="number"
      min="1"
      :max="max > 0 ? max.toString() : '1'"
      @change="pageChange"
      placeholder="Page #"
      :value="$data.page + 1"
      class="page-number-box"
    />
    <button @click="nextPage" :disabled="max !== -1 && $data.page >= max"
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
      },
      noStore: {
        type: Boolean,
        default: false
      }
    },
    emits: ['change'],
    data() {
      return {
        page: 0
      };
    }
  })
  export default class Paginator extends Vue {
    declare min: number;
    declare max: number;
    declare noStore: boolean;
    declare $data: {
      page: number;
    };
    mounted() {
      if (this.$route.query.page as string) {
        this.setPage(parseInt(this.$route.query.page as string), false, false);
        return;
      }

      if (this.$store.state.page !== null) {
        this.setPage(this.$store.state.page, true, false);
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

      if (this.max !== -1 && page > this.max) {
        input.value = (this.max + 1).toString();
        return;
      }

      this.setPage(page, false);
    }

    setPage(page: number, zeroIndexed: boolean = true, emit: boolean = true) {
      if (!page || page <= 0 || (!zeroIndexed && page <= 1)) {
        this.$data.page = 0;
        this.$router.replace({ query: { ...this.$route.query, page: null } });
        if (!this.noStore) this.$store.commit('setPage', null);
        if (emit) {
          this.$emit('change', this.$data.page);
        }
        return;
      }
      if (zeroIndexed) {
        this.$data.page = page;
      } else {
        this.$data.page = page - 1;
      }
      this.$router.replace({
        query: { ...this.$route.query, page: this.$data.page + 1 }
      });
      if (!this.noStore) this.$store.commit('setPage', this.$data.page);
      if (emit) {
        this.$emit('change', this.$data.page);
      }
    }

    nextPage() {
      if (this.max !== -1 && this.$data.page >= this.max) {
        return;
      }

      this.setPage(this.$data.page + 1, true);
    }

    prevPage() {
      if (this.$data.page <= 0) {
        return;
      }

      this.setPage(this.$data.page - 1, true);
    }

    get page() {
      return this.$data.page;
    }

    beforeUnmount() {
      this.$store.commit('setPage', null);
    }
  }
</script>
