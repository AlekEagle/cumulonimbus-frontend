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
    <button
      title="Delete a bunch of files!"
      v-if="!$data.bulkDeleteMode"
      @click="$data.bulkDeleteMode = true"
      >Bulk Delete Mode</button
    >
    <template v-if="$data.bulkDeleteMode">
      <button
        @click="$refs.confirmBulkDeleteModal.showModal()"
        title="Haha delete stuff go bRRR"
        >Delete 'em!</button
      >
      <button
        @click="
          $data.bulkDeleteMode = false;
          $data.selectedFiles = $data.selectedFiles.filter(() => false);
        "
        title="Nevermind"
        >Nevermind..</button
      >
    </template>
  </div>
  <div class="page-selector">
    <button @click="prevPage" :disabled="$data.page <= 0">Prev</button>
    <input
      type="number"
      min="1"
      :max="$data.maxPage > 0 ? $data.maxPage.toString() : '1'"
      @change="pageChange"
      placeholder="Page #"
      :value="$data.page + 1"
      class="page-number-box"
    />
    <button
      @click="nextPage"
      :disabled="$data.maxPage !== -1 && $data.page >= $data.maxPage"
      >Next</button
    >
  </div>
  <div v-if="loaded" class="content-box-group-container">
    <ContentBox
      v-for="file in $data.files"
      :key="file.filename"
      :title="file.filename"
      span
      lazy-load
      @click="handleClickEvent(file.filename)"
      :theme-safe="isSelected(file.filename)"
      :src="
        isSelected(file.filename)
          ? '/assets/images/checkmark.svg'
          : `https://previews.${$el.ownerDocument.location.hostname}/${file.filename}`
      "
      ><p
        v-text="
          $data.bulkDeleteMode
            ? 'Click me to select or dis-select me for deletion!'
            : 'Take a closer look at this file.'
        "
      ></p
    ></ContentBox>
  </div>
  <Loading v-else />
  <div class="page-selector">
    <button @click="prevPage" :disabled="$data.page <= 0">Prev</button>
    <input
      type="number"
      min="1"
      :max="$data.maxPage > 0 ? $data.maxPage.toString() : '1'"
      @change="pageChange"
      placeholder="Page #"
      :value="$data.page + 1"
      class="page-number-box"
    />
    <button
      @click="nextPage"
      :disabled="$data.maxPage !== -1 && $data.page >= $data.maxPage"
      >Next</button
    >
  </div>

  <Modal ref="confirmBulkDeleteModal" title="Delete Multiple Files" cancelable>
    <p
      >Are you sure you want to delete all of these files? You'll never see them
      again!</p
    >
    <template v-slot:buttons>
      <button
        title="baby"
        @click="
          $refs.confirmBulkDeleteModal.hideModal();
          $data.bulkDeleteMode = false;
          $data.selectedFiles = $data.selectedFiles.filter(() => false);
        "
        >Nevermind</button
      >
      <button @click="bulkDelete" title="haha they are gone">Buh Bye!</button>
    </template>
  </Modal>
  <transition name="delete-files-animation-container">
    <div v-if="$data.bulkDeleting" class="delete-files-animation-container"
      ><Loading
    /></div>
  </transition>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';
  import App from '@/App.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import Loading from '@/components/Loading.vue';
  import Modal from '@/components/Modal.vue';

  @Options({
    components: { ContentBox, Loading, Modal },
    title: 'Your Files',
    data() {
      return {
        loaded: false,
        files: [],
        fileCount: undefined,
        page: 0,
        maxPage: -1,
        bulkDeleteMode: false,
        selectedFiles: [],
        bulkDeleting: false
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
      bulkDeleteMode: boolean;
      selectedFiles: string[];
      bulkDeleting: boolean;
    };
    declare $refs: {
      confirmBulkDeleteModal: Modal;
    };
    async mounted() {
      if (!navigator.onLine) {
        (this.$parent?.$parent as App).temporaryToast(
          "Looks like you're offline, I'm pretty useless offline.",
          10000
        );
        return;
      }
      if (this.$store.state.filePage !== null)
        this.setPage(this.$store.state.filePage);
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
      if (this.$data.maxPage !== -1 && this.$data.page >= this.$data.maxPage)
        return;
      this.setPage(this.$data.page + 1);
      await this.getFiles();
    }

    async pageChange(e: InputEvent) {
      if ((e.target as HTMLInputElement).valueAsNumber < 1)
        (e.target as HTMLInputElement).valueAsNumber = 1;
      if ((e.target as HTMLInputElement).valueAsNumber > this.$data.maxPage + 1)
        (e.target as HTMLInputElement).valueAsNumber = this.$data.maxPage + 1;
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
        this.$data.files = curPageFiles.items;
        this.$data.loaded = true;
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
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
              (this.$parent?.$parent as App).temporaryToast(
                "Uh oh, looks like you've been banned from Cumulonimbus, sorry for the inconvenience.",
                10000
              );
              (this.$parent?.$parent as App).redirectIfNotLoggedIn(
                window.location.pathname
              );
              break;
            case 'INTERNAL_SERVER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                10000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                10000
              );
              console.error(error);
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            10000
          );
          console.error(error);
        }
      }
    }

    goBack() {
      this.$router.replace('/dashboard/');
      this.$store.commit('setFilePage', null);
    }

    handleClickEvent(filename: string) {
      if (!this.$data.bulkDeleteMode)
        this.$router.push(`/dashboard/file/?id=${filename}`);
      else {
        if (this.$data.selectedFiles.includes(filename))
          this.$data.selectedFiles = this.$data.selectedFiles.filter(
            a => a !== filename
          );
        else {
          if (this.$data.selectedFiles.length >= 100) {
            (this.$parent?.$parent as App).temporaryToast(
              'You can only bulk delete 100 files at a time, sorry!',
              10000
            );
            return;
          }
          this.$data.selectedFiles.push(filename);
        }
      }
    }

    isSelected(filename: string): boolean {
      return (
        this.$data.bulkDeleteMode && this.$data.selectedFiles.includes(filename)
      );
    }

    async bulkDelete() {
      try {
        this.$data.bulkDeleting = true;
        let res = await (
          this.$store.state.client as Client
        ).bulkDeleteSelfFilesByID(this.$data.selectedFiles);
        await this.getFiles();
        (this.$parent?.$parent as App).temporaryToast(
          `Done! Deleted: ${res.count} files!`,
          15000
        );

        this.$data.bulkDeleting = false;
        this.$refs.confirmBulkDeleteModal.hideModal();
      } catch (error) {
        this.$data.bulkDeleting = false;
        this.$refs.confirmBulkDeleteModal.hideModal();
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
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
              (this.$parent?.$parent as App).temporaryToast(
                "Uh oh, looks like you've been banned from Cumulonimbus, sorry for the inconvenience.",
                10000
              );
              (this.$parent?.$parent as App).redirectIfNotLoggedIn(
                window.location.pathname
              );
              break;
            case 'INTERNAL_SERVER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                10000
              );
              break;
            case 'MISSING_FIELDS_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'You can only bulk delete 100 files at a time, sorry!',
                10000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                10000
              );
              console.error(error);
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            10000
          );
          console.error(error);
        }
      }
    }
  }
</script>

<style>
  .delete-files-animation-container {
    z-index: 15;
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    cursor: wait;
    background-color: #000000aa;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(3px);
  }

  .delete-files-animation-container-enter-active,
  .delete-files-animation-container-leave-active {
    transition: opacity 0.4s, backdrop-filter 0.4s;
  }

  .delete-files-animation-container-enter-from,
  .delete-files-animation-container-leave-to {
    opacity: 0;
    backdrop-filter: none;
  }

  .delete-files-animation-container-enter-to,
  .delete-files-animation-container-leave-from {
    opacity: 1;
    backdrop-filter: blur(3px);
  }
</style>
