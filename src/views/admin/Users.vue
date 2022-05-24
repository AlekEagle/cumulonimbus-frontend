<template>
  <h1>All Users</h1>
  <h2>
    Here's everyone who has an account on Cumulonimbus. All
    {{ $data.userCount }} of them, to be exact.
  </h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/admin" title="Back to cool town square." />
    <button
      v-if="!$data.bulkDeleteMode"
      @click="$data.bulkDeleteMode = true"
      title="Haha delete stuff go bRRRRRRRRR"
      >Bulk Delete</button
    >
    <template v-if="$data.bulkDeleteMode">
      <button
        @click="$refs.confirmBulkDeleteModal.show()"
        title="Haha delete stuff go bRRR"
      >
        Delete 'em!
      </button>
      <button @click="clearSelection" title="Nevermind"> Nevermind.. </button>
    </template>
  </div>

  <Paginator ref="paginator" :max="$data.maxPage" @change="getUsers">
    <div v-if="!$data.loading" class="content-box-group-container">
      <ContentBox
        v-for="user in $data.users"
        :key="user.id"
        :title="user.username"
        :src="
          isSelected(user.id)
            ? '/assets/images/checkmark.svg'
            : '/assets/images/profile.svg'
        "
        span
        :to="
          !$data.bulkDeleteMode
            ? { path: '/admin/user', query: { uid: user.id } }
            : null
        "
        @click="handleClickEvent(user.id)"
        theme-safe
      >
        <p>
          <code v-text="user.id" />
        </p>
      </ContentBox>
    </div>
    <Loading v-else />
  </Paginator>

  <ConfirmModal
    ref="confirmBulkDeleteModal"
    @confirm="bulkDelete"
    @deny="clearSelection"
    title="Delete these users?"
    choice-closes-modal
    cancelable
  >
    <p>
      Are you sure you want to delete these
      {{ $data.selectedUsers.length }} user{{
        $data.selectedUsers.length === 1 ? '' : 's'
      }}?
    </p>
  </ConfirmModal>
  <FullscreenLoading ref="fullscreenLoading" />
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { Client, Cumulonimbus } from '../../../../cumulonimbus-wrapper';
  import Paginator from '@/components/Paginator.vue';
  import Loading from '@/components/Loading.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import FullscreenLoading from '@/components/FullscreenLoading.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import BackButton from '@/components/BackButton.vue';
  import App from '@/App.vue';

  @Options({
    components: {
      Paginator,
      Loading,
      ConfirmModal,
      FullscreenLoading,
      ContentBox,
      BackButton
    },
    data() {
      return {
        bulkDeleteMode: false,
        userCount: 0,
        maxPage: -1,
        loading: false,
        users: [],
        selectedUsers: []
      };
    },
    title: 'All Users'
  })
  export default class AllUsers extends Vue {
    declare $data: {
      userCount: number;
      bulkDeleteMode: boolean;
      users: Cumulonimbus.Data.User[];
      selectedUsers: string[];
      loading: boolean;
      maxPage: number;
    };
    declare $refs: {
      confirmBulkDeleteModal: ConfirmModal;
      fullscreenLoading: FullscreenLoading;
      paginator: Paginator;
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
      await this.getUsers();
    }

    clearSelection() {
      this.$data.bulkDeleteMode = false;
      this.$data.selectedUsers = [];
    }

    async getUsers() {
      try {
        this.$data.loading = true;
        const curPageUsers = await (
          this.$store.state.client as Client
        ).getUsers(50, 50 * this.$refs.paginator.pageZeroIndexed);
        this.$data.users = curPageUsers.items;
        this.$data.userCount = curPageUsers.count;
        this.$data.maxPage = Math.floor(curPageUsers.count / 50);
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INSUFFICIENT_PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
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

    isSelected(u: string) {
      return this.$data.bulkDeleteMode && this.$data.selectedUsers.includes(u);
    }

    handleClickEvent(u: string) {
      if (!this.$data.bulkDeleteMode) return;

      if (this.isSelected(u)) {
        this.$data.selectedUsers = this.$data.selectedUsers.filter(
          user => user !== u
        );
      } else {
        if (this.$data.selectedUsers.length >= 100) {
          (this.$parent?.$parent as App).temporaryToast(
            'You cannot select more than 100 users at once.',
            5000
          );
        } else this.$data.selectedUsers.push(u);
      }
    }

    async bulkDelete() {
      try {
        this.$refs.fullscreenLoading.show();
        const res = await (
          this.$store.state.client as Client
        ).bulkDeleteUsersByID(this.$data.selectedUsers);
        await this.getUsers();
        (this.$parent?.$parent as App).temporaryToast(
          `Deleted ${res.count} users!`,
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
            case 'INSUFFICIENT_PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            case 'MISSING_FIELDS_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'You can only bulk delete 100 users at a time, sorry!',
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
  }
</script>
