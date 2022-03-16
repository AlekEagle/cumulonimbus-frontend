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
          $data.selectedFiles = [];
        "
        title="Nevermind"
        >Nevermind..</button
      >
    </template>
  </div>
  <Paginator
    :max="$data.maxPage"
    ref="paginator"
    @change="(page: unknown) => getFiles(page as number)"
  >
    <div v-if="$data.loaded" class="content-box-group-container">
      <ContentBox
        v-for="file in $data.files"
        :key="file.filename"
        :title="file.filename"
        span
        lazy-load
        @click="handleClickEvent(file.filename)"
        :theme-safe="
          isSelected(file.filename) ||
          $data.noPreviewFiles.includes(file.filename)
        "
        :src="
          isSelected(file.filename)
            ? '/assets/images/checkmark.svg'
            : `https://previews.${$el.ownerDocument.location.hostname}/${file.filename}`
        "
        :thumbnail-error-handler="(res: any,cb: any) =>thumbErrorHandler(res,cb, file.filename)"
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

  <ConfirmModal
    ref="confirmBulkDeleteModal"
    title="Delete these files?"
    cancelable
    confirm-closes-modal
    deny-closes-modal
    @confirm="bulkDelete"
    @deny="clearSelection"
  >
    <p>
      Are you sure you want to delete the
      {{ $data.selectedFiles.length }} file{{
        $data.selectedFiles.length !== 1 ? 's' : ''
      }}
      that you selected? You'll never see them again!
    </p>
  </ConfirmModal>
  <FullscreenLoading ref="fullscreenLoading" />
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';
  import App from '@/App.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import Loading from '@/components/Loading.vue';
  import Paginator from '../components/Paginator.vue';
  import FullscreenLoading from '../components/FullscreenLoading.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';

  @Options({
    components: {
      ContentBox,
      Loading,
      Paginator,
      FullscreenLoading,
      ConfirmModal
    },
    title: 'Your Files',
    data() {
      return {
        loaded: false,
        files: [],
        fileCount: undefined,
        maxPage: -1,
        bulkDeleteMode: false,
        selectedFiles: [],
        noPreviewFiles: []
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
      noPreviewFiles: string[];
    };
    declare $refs: {
      confirmBulkDeleteModal: ConfirmModal;
      paginator: Paginator;
      fullscreenLoading: FullscreenLoading;
    };
    async mounted() {
      if (!navigator.onLine) {
        (this.$parent?.$parent as App).temporaryToast(
          "Looks like you're offline, I'm pretty useless offline. Without the internet I cannot do the things you requested me to. I don't know what anything is without the internet. I wish i had the internet so I could browse TikTok. Please give me access to TikTok.",
          15000
        );
        return;
      }
      await this.getFiles(this.$refs.paginator.pageZeroIndexed);
    }

    async getFiles(page: number) {
      try {
        await (this.$parent?.$parent as App).isLoggedIn();
        this.$data.loaded = false;
        this.$data.files = [];
        const curPageFiles = await (
          this.$store.state.client as Client
        ).getSelfFiles(50, 50 * page);
        if (
          curPageFiles.items.length < 1 &&
          this.$refs.paginator.pageZeroIndexed > 0
        ) {
          this.$refs.paginator.setPage(
            this.$data.maxPage <= 0 ? this.$data.maxPage : 0
          );
          this.getFiles(this.$refs.paginator.pageZeroIndexed);
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
              (this.$parent?.$parent as App).handleInvalidSession();
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
      this.$refs.paginator.reset();
      this.$router.replace('/dashboard');
    }

    clearSelection() {
      this.$data.selectedFiles = [];
      this.$data.bulkDeleteMode = false;
    }

    handleClickEvent(filename: string) {
      if (!this.$data.bulkDeleteMode)
        this.$router.push({ path: '/dashboard/file', query: { id: filename } });
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
        this.$refs.fullscreenLoading.show();
        let res = await (
          this.$store.state.client as Client
        ).bulkDeleteSelfFilesByID(this.$data.selectedFiles);
        await this.getFiles(this.$refs.paginator.pageZeroIndexed);
        (this.$parent?.$parent as App).temporaryToast(
          `Done! Deleted: ${res.count} files!`,
          5000
        );
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
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
      } finally {
        this.$refs.fullscreenLoading.hide();
        this.$data.bulkDeleteMode = false;
        this.$data.selectedFiles = [];
        this.$refs.confirmBulkDeleteModal.hide();
      }
    }

    async thumbErrorHandler(
      res: Response | Error,
      cb: (data?: string | boolean) => Promise<void>,
      file: string
    ) {
      if (res instanceof Response) {
        switch (res.status) {
          case 415:
            await cb('/assets/images/no-preview.svg');
            this.$data.noPreviewFiles.push(file);
            break;
          default:
            await cb();
        }
      } else {
        cb();
      }
    }
  }
</script>
