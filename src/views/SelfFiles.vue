<template>
  <h1>Your Files</h1>
  <h2
    >Take a look at all of the files you have uploaded. You've uploaded
    {{
      typeof $data.fileCount === 'number' ? $data.fileCount : 'some amount of'
    }}
    file{{
      typeof $data.fileCount === 'number'
        ? $data.fileCount !== 1
          ? 's'
          : ''
        : 's'
    }}.</h2
  >
  <div class="quick-action-buttons-container">
    <button title="Go Back!" @click="goBack">Back</button>
  </div>
  <div v-if="loaded" class="content-box-group-container">
    <ContentBox
      v-for="file in $data.files"
      :key="file.filename"
      :title="file.filename"
      span
      lazy-load
      :src="`https://previews.${$el.ownerDocument.location.hostname}/${file.filename}`"
      :to="`/dashboard/file/?id=${file.filename}`"
      ><p>Take a closer look at this file.</p></ContentBox
    >
  </div>
  <Loading v-else />
  <div class="page-selector">
    <button @click="prevPage" :disabled="$data.page <= 0">Prev</button>
    <input type="number" min="1" max="1" ref="pageNum" @change="pageChange" placeholder="Page #" :value="$data.page + 1" class="page-number-box" />
    <button @click="nextPage" :disabled="$data.maxPage !== -1 && $data.page >= $data.maxPage">Next</button>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';
  import App from '@/App.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import Loading from '@/components/Loading.vue';

  @Options({
    components: { ContentBox, Loading },
    title: 'Your Files',
    data() {
      return {
        loaded: false,
        files: [],
        fileCount: undefined,
        page: 0,
        maxPage: -1
      };
    }
  })
  export default class SelfFiles extends Vue {
    declare $data: {
      loaded: boolean;
      files: Cumulonimbus.Data.File[];
      fileCount: number;
      page: number;
      maxPage: number;
    };
    declare $refs: {
      pageNum: HTMLInputElement;
    }
    async mounted() {
      if (
        await (this.$parent?.$parent as App).redirectIfNotLoggedIn(
          window.location.pathname + window.location.search
        )
      )
        return;
      if (this.$store.state.filePage !== null) this.setPage(this.$store.state.filePage);
      this.getPageFromQuery();
      await this.getFiles();
    }

    getPageFromQuery() {
      const urlSearchParams = new URLSearchParams(window.location.search);
      if (urlSearchParams.has('page')) {
        const page = Number(urlSearchParams.get('page'));
        if (isNaN(page)) this.$router.replace(window.location.pathname);
        else this.setPage(page, false);
      }
    }

    setPage(page?: number, zeroIndexed: boolean = true) {
      if (!page || page < 1 || (page < 2 && !zeroIndexed)) {
        this.$router.replace(window.location.pathname);
        this.$data.page = 0;
      } else {
        if (isNaN(page)) throw new Error('Cannot be NaN');
        if (!isFinite(page)) throw new Error('Cannot be infinite');
        this.$data.page = page - (zeroIndexed ? 0 : 1);
        this.$store.commit('setFilePage', this.$data.page);
        this.$router.replace(
          window.location.pathname + '?page=' + (this.$data.page + 1)
        );
      }
    }

    async prevPage() {
      if (this.$data.page <= 0) return;
      this.setPage(this.$data.page - 1);
      await this.getFiles();
    }

    async nextPage() {
      if (this.$data.maxPage !== -1 && this.$data.page >= this.$data.maxPage) return;
      this.setPage(this.$data.page +1);
      await this.getFiles();
    }

    async pageChange(e: InputEvent) {
      if ((e.target as HTMLInputElement).valueAsNumber < 1) (e.target as HTMLInputElement).valueAsNumber = 1;
      if ((e.target as HTMLInputElement).valueAsNumber > this.$data.maxPage + 1) (e.target as HTMLInputElement).valueAsNumber = this.$data.maxPage + 1;
      this.setPage((e.target as HTMLInputElement).valueAsNumber, false);
      this.getFiles();
      console.log(e);
    }

    async getFiles() {
      try {
        this.$data.loaded = false;
        this.$data.files = [];
        const curPageFiles = await (
          this.$store.state.client as Client
        ).getSelfFiles(50, 50 * this.$data.page);
        if (curPageFiles.items.length < 1 && this.$data.page > 0) {
          this.setPage(this.$data.maxPage <= 0 ? this.$data.maxPage : 0);
          this.getFiles();
        }
        this.$data.fileCount = curPageFiles.count;
        this.$data.maxPage = Math.floor(this.$data.fileCount / 50);
        this.$refs.pageNum.max = (this.$data.maxPage + 1).toString();
        this.$data.files = curPageFiles.items;
        this.$data.loaded = true;
      } catch (error) {
        switch ((error as Cumulonimbus.ResponseError).code) {
          case 'RATELIMITED_ERROR':
            (this.$parent?.$parent as App).ratelimitToast(
              (error as Cumulonimbus.ResponseError).ratelimit.resetsAt
            );
            break;
          case 'INVALID_SESSION_ERROR':
            (this.$parent?.$parent as App).temporaryToast(
              "That's funny, your session just expired!",
              15000
            );
            this.$store.commit('setUser', null);
            this.$store.commit('setSession', null);
            this.$store.commit('setClient', null);
            (this.$parent?.$parent as App).redirectIfNotLoggedIn(
              window.location.pathname
            );
            break;
            case 'BANNED_ERROR':
            (this.$parent?.$parent as App).temporaryToast('lol ur banned', 10000);
            (this.$parent?.$parent as App).redirectIfNotLoggedIn(
              window.location.pathname
            );
            break;
          default:
            (this.$parent?.$parent as App).temporaryToast(
              'I did a bad.',
              10000
            );
            console.error(error);
        }
      }
    }

    goBack() {
      this.$router.push('/dashboard/');;
      this.$store.commit('setFilePage', null);
    }
  }
</script>

<style>
  .page-number-box {
    width: 65px;
    margin: 0 5px;
  }
</style>