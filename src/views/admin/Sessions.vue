<template>
  <h1>User Sessions</h1>
  <h2
    >Manage the sessions of a specific user. Specifically
    {{ $data.total }} sessions in total for this user.</h2
  >
  <div class="quick-action-buttons-container">
    <button @click="goBack" title="Back to cool town square.">Back</button>
  </div>

  <Paginator ref="paginator" :max="$data.maxPage" @change="loadSessions">
    <div v-if="!$data.loading" class="content-box-group-container">
      <ContentBox
        v-for="session in $data.sessions"
        :key="session.iat"
        :title="session.name"
        :src="
          isSelected(session.iat)
            ? '/assets/images/checkmark.svg'
            : '/assets/images/gear.svg'
        "
        span
        @click="handleClickEvent(session)"
        theme-safe
      >
        <p
          >Session expires at:
          <code
            v-text="($parent?.$parent as any).toDateString(
              new Date(session.exp * 1000)
            )"
          />
        </p>
      </ContentBox>
    </div>
  </Paginator>
  <ConfirmModal
    cancelable
    ref="invalidateSessionModal"
    @confirm="invalidateSession"
    @deny="clearSelection"
    title="Invalidate this session?"
    deny-closes-modal
  >
    <p>
      Are you sure you want to invalidate this session that belongs to
      {{ $data.selectedSession?.name }}?
    </p>
  </ConfirmModal>
  <ConfirmModal
    cancelable
    ref="confirmBulkInvalidateModal"
    @confirm="bulkInvalidateSessions"
    @deny="clearSelection"
    title="Invalidate these sessions?"
    deny-closes-modal
  >
    <p>
      Are you sure you want to invalidate all
      {{ $data.selectedSessions.length }} of these session{{
        $data.selectedSessions.length !== 1 ? 's' : ''
      }}?</p
    >
  </ConfirmModal>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import { Cumulonimbus, Client } from '../../../../cumulonimbus-wrapper';
  import Paginator from '@/components/Paginator.vue';
  import Loading from '@/components/Loading.vue';
  import App from '@/App.vue';

  @Options({
    components: {
      ConfirmModal,
      ContentBox,
      Paginator,
      Loading
    },
    data() {
      return {
        sessions: [],
        loading: true,
        maxPage: 0,
        total: 0,
        selectedSession: null,
        selectedSessions: [],
        bulkDeleteMode: false,
        user: null
      };
    },
    title: 'All Sessions for User'
  })
  export default class AdminUserSessions extends Vue {
    declare $data: {
      sessions: Cumulonimbus.Data.Session[];
      loading: boolean;
      maxPage: number;
      total: number;
      selectedSession: Cumulonimbus.Data.Session | null;
      selectedSessions: Cumulonimbus.Data.Session[];
      bulkDeleteMode: boolean;
      user: Cumulonimbus.Data.User | null;
    };
    declare $refs: {
      invalidateSessionModal: ConfirmModal;
      confirmBulkInvalidateModal: ConfirmModal;
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
      this.loadSessions();
    }

    async loadSessions() {
      try {
        if (this.$route.query.uid === undefined) {
          this.$router.replace('/admin/user');
          return;
        }
        this.$data.loading = true;
        this.$data.sessions = [];
        const curPageSessions = await (
          this.$store.state.client as Client
        ).getUserSessionsByID(
          this.$route.query.uid as string,
          50,
          50 * this.$refs.paginator.pageZeroIndexed
        );
        this.$data.sessions = curPageSessions.items;
        this.$data.maxPage = Math.floor(curPageSessions.count / 50);
        this.$data.total = curPageSessions.count;
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
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'INVALID_USER_ERROR':
              this.$router.replace('/admin/users');
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

    clearSelection() {
      this.$data.selectedSession = null;
      this.$data.selectedSessions = [];
      this.$data.bulkDeleteMode = false;
    }

    isSelected(sid: number) {
      return (
        this.$data.bulkDeleteMode &&
        this.$data.selectedSessions.findIndex(s => s.iat === sid) !== -1
      );
    }

    handleClickEvent(session: Cumulonimbus.Data.Session) {
      if (this.$data.bulkDeleteMode) {
        if (this.isSelected(session.iat)) {
          this.$data.selectedSessions = this.$data.selectedSessions.filter(
            s => s.iat !== session.iat
          );
        } else this.$data.selectedSessions.push(session);
      } else {
        this.$data.selectedSession = session;
        this.$refs.invalidateSessionModal.show();
      }
    }

    async invalidateSession() {
      try {
        this.$data.loading = true;
        await (this.$store.state.client as Client).deleteUserSessionByID(
          this.$data.selectedSession?.sub as string,
          (this.$data.selectedSession?.iat as number).toString()
        );
        this.loadSessions();
        (this.$parent?.$parent as App).temporaryToast('Done!', 5000);
        this.$refs.invalidateSessionModal.hide();
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
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'This user does not exist.',
                5000
              );
              this.$router.replace('/admin/users');
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

    async bulkInvalidateSessions() {
      try {
        this.$data.loading = true;
        let res = await (
          this.$store.state.client as Client
        ).bulkDeleteUserSessionsByID(
          this.$data.selectedSessions[0].sub,
          this.$data.selectedSessions.map(s => s.iat.toString())
        );
        (this.$parent?.$parent as App).temporaryToast(
          `Done! Invalidated ${res.count} sessions!`,
          5000
        );
        this.clearSelection();
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
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'This user does not exist.',
                5000
              );
              this.$router.replace('/admin/users');
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
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
      this.$router.push({
        path: '/admin/user',
        query: { uid: this.$route.query.uid }
      });
    }
  }
</script>
