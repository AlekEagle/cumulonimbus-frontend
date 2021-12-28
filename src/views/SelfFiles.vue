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
  <div class="content-box-group-container">
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
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';
  import App from '@/App.vue';
  import ContentBox from '@/components/ContentBox.vue';

  @Options({
    components: { ContentBox },
    title: 'Cumulonimbus | Your Files',
    data() {
      return {
        files: [],
        fileCount: undefined,
        page: 0
      };
    }
  })
  export default class SelfFiles extends Vue {
    declare $data: {
      files: Cumulonimbus.Data.File[];
      fileCount: number;
      page: number;
    };
    async mounted() {
      this.getPage();
      await this.getFiles();
    }

    getPage() {
      const urlSearchParams = new URLSearchParams(window.location.search);
      if (urlSearchParams.has('page')) {
        const page = Number(urlSearchParams.get('page'));
        if (isNaN(page)) this.$router.replace(window.location.pathname);
        else this.$data.page = page - 1;
      }
    }

    setPage(page?: number, zeroIndexed: boolean = true) {
      if (!page || page === 0) {
        this.$router.replace(window.location.pathname);
        this.$data.page = 0;
      } else {
        if (isNaN(page)) throw new Error('Cannot be NaN');
        if (!isFinite(page)) throw new Error('Cannot be infinite');
        this.$data.page = page - (zeroIndexed ? 0 : 1);
        this.$router.replace(
          window.location.pathname + '?page=' + (this.$data.page - 1)
        );
      }
    }

    async getFiles() {
      try {
        const curPageFiles = await (
          this.$store.state.client as Client
        ).getAllSelfFiles(50, 50 * this.$data.page);
        if (curPageFiles.items.length < 1) {
          this.setPage(0);
          this.getFiles();
        }
        this.$data.fileCount = curPageFiles.count;
        this.$data.files = curPageFiles.items;
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
          default:
            (this.$parent?.$parent as App).temporaryToast(
              'I did a bad.',
              10000
            );
            console.error(error);
        }
      }
    }
  }
</script>
