<template>
  <h1>Manage Sessions</h1>
  <h2
    >Manage the devices/services that have access to your account, there are
    {{ $data.sessionCount || 'some amount' }} session{{
      typeof $data.sessionCount === 'number'
        ? $data.sessionCount !== 1
          ? 's'
          : ''
        : 's'
    }}
    for your account.</h2
  >
  <div class="quick-action-buttons-container">
    <button
      @click="
        $router.back();
      "
      title="Go back!"
      >Back</button
    >
    <button
      title="Invalidate a bunch of sessions!"
      v-if="!$data.bulkInvalidateMode"
      @click="$data.bulkInvalidateMode = true"
      >Bulk Delete Mode</button
    >
    <template v-else>
      <button
        @click="$refs.bulkInvalidateSessionModal.show()"
        title="Haha delete stuff go bRRR"
        >Delete 'em!</button
      >
      <button
        @click="
          $data.bulkInvalidateMode = false;
          $data.selectedSessions = [];
        "
        title="Nevermind"
        >Nevermind..</button
      >
    </template>
  </div>
  <Paginator :max="$data.maxPage" ref="paginator" @change="getSessions">
    <div class="content-box-group-container" v-if="$data.loaded">
      <ContentBox
        span
        theme-safe
        v-for="session in $data.sessions"
        :key="session.iat"
        :title="session.name"
        @click="handleClickEvent(session)"
        :src="
          isSelected(session.iat.toString())
            ? '/assets/images/checkmark.svg'
            : '/assets/images/gear.svg'
        "
      >
        <p v-if="session.iat === $store.state.session?.iat"
          ><strong>This session!</strong></p
        >
        <p>Click me to invalidate this session!</p>
        <p
          >Expires at:
          <code
            v-text="($parent?.$parent as any).toDateString(new Date(session.exp * 1000))"
        /></p>
      </ContentBox>
    </div>
    <Loading v-else />
  </Paginator>

  <ConfirmModal
    ref="invalidateSessionModal"
    @confirm="invalidateSession"
    @deny="$data.session = undefined"
    cancelable
  >
    <p v-if="$data.session?.iat === $store.state.session?.iat">
      <strong>Doing this will sign you out!</strong>
    </p>
    <p>
      Are you sure you want to invalidate the session that belongs to
      <code v-text="$data.session?.name" />?
    </p>
  </ConfirmModal>

  <ConfirmModal
    ref="bulkInvalidateSessionModal"
    title="Are you sure?"
    cancelable
    @accept="invalidateSelectedSessions"
    @deny="clearSelection"
  >
    <p>
      Are you sure you want to invalidate the
      {{ $data.selectedSessions.length }} session{{
        typeof $data.sessionCount === 'number'
          ? $data.sessionCount !== 1
            ? 's'
            : ''
          : 's'
      }}
      that you selected?
    </p>
  </ConfirmModal>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import Loading from '@/components/Loading.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import App from '@/App.vue';
  import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';
  import Paginator from '../components/Paginator.vue';

  @Options({
    components: { ConfirmModal, Loading, ContentBox, Paginator },
    title: 'Manage Sessions',
    data() {
      return {
        sessions: [],
        session: undefined,
        sessionCount: undefined,
        maxPage: -1,
        loaded: false,
        bulkInvalidateMode: false,
        selectedSessions: []
      };
    }
  })
  export default class Sessions extends Vue {
    declare $data: {
      sessions: Cumulonimbus.Data.Session[];
      session?: Cumulonimbus.Data.Session;
      sessionCount: number;
      maxPage: number;
      loaded: boolean;
      bulkInvalidateMode: boolean;
      selectedSessions: string[];
    };
    declare $refs: {
      invalidateSessionModal: ConfirmModal;
      bulkInvalidateSessionModal: ConfirmModal;
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
      await this.getSessions();
    }

    clearSelection() {
      this.$data.bulkInvalidateMode = false;
      this.$data.selectedSessions = [];
    }

    async getSessions() {
      try {
        let res = await (this.$store.state.client as Client).getSelfSessions(
          50,
          50 * this.$refs.paginator.pageZeroIndexed
        );
        if (res.items.length < 1 && this.$refs.paginator.pageZeroIndexed > 0) {
          this.$data.maxPage <= 0 ? this.$data.maxPage : 0;
          this.getSessions();
        }
        this.$data.sessionCount = res.count;
        this.$data.maxPage = Math.floor(this.$data.sessionCount / 50);
        this.$data.sessions = res.items;
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

    promptInvalidateSession(s: Cumulonimbus.Data.Session) {
      this.$data.session = s;
      this.$refs.invalidateSessionModal.show();
    }

    async invalidateSession() {
      try {
        await (this.$store.state.client as Client).deleteSelfSessionByID(
          (this.$data.session?.iat as number).toString()
        );
        this.$refs.invalidateSessionModal.hide();
        (this.$parent?.$parent as App).temporaryToast('Done!', 2000);
        await this.getSessions();
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              if (!(await (this.$parent?.$parent as App).isLoggedIn())) {
                (this.$parent?.$parent as App).handleInvalidSession();
              } else {
                (this.$parent?.$parent as App).temporaryToast(
                  "Look's like it's already invalid!",
                  5000
                );
                this.$refs.invalidateSessionModal.hide();
                this.$data.session = undefined;
                await this.getSessions();
              }
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

    isSelected(sessionID: string): boolean {
      return (
        this.$data.bulkInvalidateMode &&
        this.$data.selectedSessions.includes(sessionID)
      );
    }

    handleClickEvent(session: Cumulonimbus.Data.Session) {
      if (this.$data.bulkInvalidateMode) {
        if (this.$data.selectedSessions.includes(session.iat.toString())) {
          this.$data.selectedSessions = this.$data.selectedSessions.filter(
            s => s !== session.iat.toString()
          );
        } else {
          if (this.$data.selectedSessions.length >= 100) {
            (this.$parent?.$parent as App).temporaryToast(
              'You can only select up to 100 sessions at a time.',
              5000
            );
            return;
          }
          this.$data.selectedSessions.push(session.iat.toString());
        }
      } else {
        this.promptInvalidateSession(session);
      }
    }

    async invalidateSelectedSessions() {
      try {
        await (this.$store.state.client as Client).bulkDeleteSelfSessionsByID(
          this.$data.selectedSessions
        );
        this.$refs.invalidateSessionModal.hide();
        (this.$parent?.$parent as App).temporaryToast('Done!', 2000);
        if (
          this.$data.selectedSessions.includes(
            this.$store.state.session?.iat.toString() as string
          )
        ) {
          this.$store.commit('setSession', null);
          this.$store.commit('setClient', null);
          (this.$parent?.$parent as App).redirectIfNotLoggedIn(
            window.location.pathname
          );
          return;
        }
        this.$data.selectedSessions = [];
        this.$data.bulkInvalidateMode = false;
        await this.getSessions();
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              if (!(await (this.$parent?.$parent as App).isLoggedIn())) {
                (this.$parent?.$parent as App).handleInvalidSession();
              } else {
                (this.$parent?.$parent as App).temporaryToast(
                  "Look's like it's already invalid!",
                  5000
                );
                this.$refs.invalidateSessionModal.hide();
                this.$data.session = undefined;
                await this.getSessions();
              }
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

<style></style>
