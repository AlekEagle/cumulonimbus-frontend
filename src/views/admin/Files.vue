<template>
  <h1>All Files</h1>
  <h2>
    Here's <b>everything</b> that's been uploaded{{
      $route.query.uid ? ' by this user' : ''
    }}. There's {{ $data.fileCount }} files in total.
  </h2>
  <div class="quick-action-buttons-container">
    <button @click="goBack" title="Back to cool town square."> Back </button>
    <button
      title="Bulk delete files."
      v-if="!$data.bulkDeleteMode"
      @click="$data.bulkDeleteMode = true"
    >
      Bulk Delete
    </button>
    <template v-if="$data.bulkDeleteMode">
      <button
        @click="$refs.confirmBulkDeleteModal.show()"
        title="Haha delete stuff go bRRR"
      >
        Delete 'em!
      </button>
      <button
        @click="
          $data.bulkDeleteMode = false;
          $data.selectedFiles = [];
        "
        title="Nevermind"
      >
        Nevermind..
      </button>
    </template>
  </div>
  <Paginator :max="$data.maxPage" ref="paginator" @change="getFiles">
    <div v-if="!$data.loading" class="content-box-group-container">
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
      >
        <p
          v-text="
            $data.bulkDeleteMode
              ? 'Click me to select or dis-select'
              : 'Take a closer look at this file.'
          "
        />
      </ContentBox>
    </div>
    <Loading v-else />
  </Paginator>
  <ConfirmModal
    title="Bulk Delete files"
    ref="confirmBulkDeleteModal"
    cancelable
    @confirm="bulkDelete"
    @deny="clearSelection"
  >
    <p
      >Are you sure you want to delete the
      {{ $data.selectedFiles.length }} file{{
        $data.selectedFiles.length !== 1 ? 's' : ''
      }}
      that you selected? They will never be seen again!</p
    >
  </ConfirmModal>
  <FullscreenLoading ref="fullscreenLoading" />
</template>

<script lang="ts">
  import { Vue, Options } from 'vue-class-component';
  import ContentBox from '@/components/ContentBox.vue';
  import Loading from '@/components/Loading.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';

  import Paginator from '@/components/Paginator.vue';
  import FullscreenLoading from '@/components/FullscreenLoading.vue';
  import App from '@/App.vue';
  import { Client, Cumulonimbus } from '../../../../cumulonimbus-wrapper';

  @Options({
    components: {
      ContentBox,
      Loading,
      ConfirmModal,
      Paginator,
      FullscreenLoading
    },
    title: 'All Files',
    data() {
      return {
        files: [],
        loading: false,
        fileCount: 0,
        maxPage: -1,
        bulkDeleteMode: false,
        selectedFiles: [],
        noPreviewFiles: []
      };
    }
  })
  export default class AllFiles extends Vue {
    declare $data: {
      files: Cumulonimbus.Data.File[];
      loading: boolean;
      fileCount: number;
      maxPage: number;
      bulkDeleteMode: boolean;
      selectedFiles: string[];
      noPreviewFiles: string[];
    };
    declare $refs: {
      paginator: Paginator;
      fullscreenLoading: FullscreenLoading;
      confirmBulkDeleteModal: ConfirmModal;
    };
    async mounted() {
      if (!navigator.onLine) {
        (this.$parent?.$parent as App).temporaryToast(
          "Looks like you're offline, I'm pretty useless offline. Without the internet I cannot do the things you requested me to. I don't know what anything is without the internet. I wish i had the internet so I could browse TikTok. Please give me access to TikTok.",
          15000
        );
        return;
      }

      if (!(await (this.$parent?.$parent as App).isStaff())) {
        this.$router.replace('/');
      }
      await this.getFiles();
    }

    async getFiles() {
      if (this.$route.query.uid) await this.getUserFiles();
      else await this.getAllFiles();
    }

    async getAllFiles() {
      try {
        this.$data.loading = true;
        this.$data.files = [];
        const curPageFiles = await (
          this.$store.state.client as Client
        ).getFiles(50, 50 * this.$refs.paginator.pageZeroIndexed);
        if (
          curPageFiles.items.length < 1 &&
          this.$refs.paginator.pageZeroIndexed > 0
        ) {
          this.$refs.paginator.setPage(
            this.$data.maxPage <= 0 ? this.$data.maxPage : 0,
            true,
            true
          );
        }
        this.$data.fileCount = curPageFiles.count;
        this.$data.maxPage = Math.floor(this.$data.fileCount / 50);
        this.$data.files = curPageFiles.items;
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          this.$data.loading = false;
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
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
      } finally {
        this.$data.loading = false;
      }
    }

    async getUserFiles() {
      try {
        this.$data.loading = true;
        this.$data.files = [];
        const curPageFiles = await (
          this.$store.state.client as Client
        ).getUserFiles(
          this.$route.query.uid as string,
          50,
          50 * this.$refs.paginator.pageZeroIndexed
        );
        if (
          curPageFiles.items.length < 1 &&
          this.$refs.paginator.pageZeroIndexed > 0
        ) {
          this.$refs.paginator.setPage(
            this.$data.maxPage <= 0 ? this.$data.maxPage : 0,
            true,
            true
          );
        }
        this.$data.fileCount = curPageFiles.count;
        this.$data.maxPage = Math.floor(this.$data.fileCount / 50);
        this.$data.files = curPageFiles.items;
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "That user doesn't exist!",
                5000
              );
              this.$router.replace('/admin/users');
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
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
      } finally {
        this.$data.loading = false;
      }
    }

    goBack() {
      this.$refs.paginator.reset();
      if (this.$route.query.uid)
        this.$router.push({
          path: '/admin/user',
          query: { uid: this.$route.query.uid }
        });
      else this.$router.push('/admin');
    }

    clearSelection() {
      this.$data.selectedFiles = [];
      this.$data.bulkDeleteMode = false;
    }

    isSelected(f: string): boolean {
      return this.$data.bulkDeleteMode && this.$data.selectedFiles.includes(f);
    }

    async bulkDelete() {
      try {
        this.$refs.fullscreenLoading.show();
        let res = await (
          this.$store.state.client as Client
        ).bulkDeleteFilesByID(this.$data.selectedFiles);
        await this.getFiles();
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
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
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
        this.clearSelection();
        this.$refs.fullscreenLoading.hide();
      }
    }

    handleClickEvent(f: string) {
      if (!this.$data.bulkDeleteMode) this.$router.push(`/admin/file/?id=${f}`);
      else {
        if (this.$data.selectedFiles.includes(f))
          this.$data.selectedFiles = this.$data.selectedFiles.filter(
            a => a !== f
          );
        else {
          if (this.$data.selectedFiles.length >= 100) {
            (this.$parent?.$parent as App).temporaryToast(
              'You can only select up to 100 files at a time.',
              5000
            );
            return;
          }
          this.$data.selectedFiles.push(f);
        }
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
          case 500:
          case 501:
          case 502:
            await cb(false);
          default:
            await cb();
        }
      } else {
        cb();
      }
    }
  }
</script>
