<template>
  <h1>Manage Sessions</h1>
  <h2
    >Manage the devices/services that have access to your account, there are
    {{ $data.sessionCount || 'some amount' }} sessions for your account.</h2
  >
  <div class="quick-action-buttons-container">
    <button @click="$router.replace('/dashboard/profile/')" title="Go back!"
      >Back</button
    >
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
  <div class="content-box-group-container">
    <ContentBox
      span
      src="/assets/images/gear.svg"
      theme-safe
      v-for="session in $data.sessions"
      :key="session.iat"
      :title="session.name"
      @click="promptInvalidateSession(session)"
    >
      <p>Click me to invalidate this session!</p>
      <p
        >Expires at:
        <code
          v-text="$parent.$parent.toDateString(new Date(session.exp * 1000))"
      /></p>
    </ContentBox>
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

  <Modal ref="invalidateSessionModal" title="Invalidate Session" cancelable>
    <p
      >Are you sure you want to invalidate the session that belongs to
      <code v-text="$data.session.name" />?</p
    >
    <template v-slot:buttons>
      <button @click="invalidateSession" title="Change it!">Confirm</button>
    </template>
  </Modal>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import Modal from '@/components/Modal.vue';
  import Loading from '@/components/Loading.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import App from '@/App.vue';
  import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';

  @Options({
    components: { Modal, Loading, ContentBox },
    title: 'Manage Sessions',
    data() {
      return {
        sessions: [],
        session: undefined,
        sessionCount: undefined,
        page: 0,
        maxPage: -1,
        loaded: false
      };
    }
  })
  export default class Sessions extends Vue {
    declare $data: {
      sessions: Cumulonimbus.Data.Session[];
      session?: Cumulonimbus.Data.Session;
      sessionCount: number;
      page: number;
      maxPage: number;
      loaded: boolean;
    };
    declare $refs: {
      invalidateSessionModal: Modal;
    };
    async mounted() {
      if (!navigator.onLine) {
        (this.$parent?.$parent as App).temporaryToast(
          "Looks like you're offline, I'm pretty useless offline.",
          10000
        );
        return;
      }
      this.getPageFromQuery();
      await this.getSessions();
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
        this.$router.replace(
          window.location.pathname + '?page=' + (this.$data.page + 1)
        );
      }
    }

    async prevPage() {
      if (this.$data.page <= 0) return;
      this.setPage(this.$data.page - 1);
      await this.getSessions();
    }

    async nextPage() {
      if (this.$data.maxPage !== -1 && this.$data.page >= this.$data.maxPage)
        return;
      this.setPage(this.$data.page + 1);
      await this.getSessions();
    }

    async pageChange(e: InputEvent) {
      if ((e.target as HTMLInputElement).valueAsNumber < 1)
        (e.target as HTMLInputElement).valueAsNumber = 1;
      if ((e.target as HTMLInputElement).valueAsNumber > this.$data.maxPage + 1)
        (e.target as HTMLInputElement).valueAsNumber = this.$data.maxPage + 1;
      this.setPage((e.target as HTMLInputElement).valueAsNumber, false);
      this.getSessions();
      console.log(e);
    }

    async getSessions() {
      try {
        let res = await (this.$store.state.client as Client).getSelfSessions(
          50,
          50 * this.$data.page
        );
        if (res.items.length < 1 && this.$data.page > 0) {
          this.setPage(this.$data.maxPage <= 0 ? this.$data.maxPage : 0);
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
        (this.$parent?.$parent as App).temporaryToast('Done!', 10000);
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
              } else {
                (this.$parent?.$parent as App).temporaryToast(
                  "Look's like it's already invalid!",
                  15000
                );
                this.$refs.invalidateSessionModal.hide();
                this.$data.session = undefined;
                await this.getSessions();
              }
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

<style></style>
