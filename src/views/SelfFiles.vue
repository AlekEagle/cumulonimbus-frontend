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
        @click="$refs.confirmBulkDeleteModal.show()"
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
  <Paginator :max="$data.maxPage" ref="paginator" @change="getFiles">
    <div v-if="$data.loaded" class="content-box-group-container">
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
  </Paginator>

  <Modal ref="confirmBulkDeleteModal" title="Delete Multiple Files" cancelable>
    <p
      >Are you sure you want to delete the
      {{ $data.selectedFiles.length }} file{{
        $data.selectedFiles.length !== 1 ? 's' : ''
      }}
      that you selected? You'll never see them again!</p
    >
    <template v-slot:buttons>
      <button
        title="baby"
        @click="
          $refs.confirmBulkDeleteModal.hide();
          $data.bulkDeleteMode = false;
          $data.selectedFiles = [];
        "
      >
        Nevermind
      </button>
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
  import Paginator from '../components/Paginator.vue';

  @Options({
    components: { ContentBox, Loading, Modal, Paginator },
    title: 'Your Files',
    data() {
      return {
        loaded: false,
        files: [],
        fileCount: undefined,
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
      maxPage: number;
      bulkDeleteMode: boolean;
      selectedFiles: string[];
      bulkDeleting: boolean;
    };
    declare $refs: {
      confirmBulkDeleteModal: Modal;
      paginator: Paginator;
    };
    async mounted() {
      if (!navigator.onLine) {
        (this.$parent?.$parent as App).temporaryToast(
          "Looks like you're offline, I'm pretty useless offline.",
          5000
        );
        return;
      }
      await this.getFiles(this.$refs.paginator.page);
    }

    async getFiles(page: number) {
      try {
        await (this.$parent?.$parent as App).isLoggedIn();
        this.$data.loaded = false;
        this.$data.files = [];
        const curPageFiles = await (
          this.$store.state.client as Client
        ).getSelfFiles(50, 50 * page);
        if (curPageFiles.items.length < 1 && this.$refs.paginator.page > 0) {
          this.$refs.paginator.setPage(
            this.$data.maxPage <= 0 ? this.$data.maxPage : 0
          );
          this.getFiles(this.$refs.paginator.page);
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
                5000
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
                5000
              );
              (this.$parent?.$parent as App).redirectIfNotLoggedIn(
                window.location.pathname
              );
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(error);
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
          );
          console.error(error);
        }
      }
    }

    goBack() {
      this.$router.replace('/dashboard/');
      this.$store.commit('setPage', null);
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
              'You can only select up to 100 files at a time.',
              5000
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
        await this.getFiles(this.$refs.paginator.page);
        (this.$parent?.$parent as App).temporaryToast(
          `Done! Deleted: ${res.count} files!`,
          5000
        );

        this.$data.bulkDeleting = false;
        this.$data.bulkDeleteMode = false;
        this.$data.selectedFiles = [];
        this.$refs.confirmBulkDeleteModal.hide();
      } catch (error) {
        this.$data.bulkDeleting = false;
        this.$data.bulkDeleteMode = false;
        this.$data.selectedFiles = [];
        this.$refs.confirmBulkDeleteModal.hide();
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
                5000
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
                5000
              );
              (this.$parent?.$parent as App).redirectIfNotLoggedIn(
                window.location.pathname
              );
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            case 'MISSING_FIELDS_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'You can only bulk delete 100 files at a time, sorry!',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(error);
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
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
