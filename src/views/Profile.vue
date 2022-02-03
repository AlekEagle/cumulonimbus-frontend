<template>
  <h1>Your Profile</h1>
  <h2>Make yourself feel at home.</h2>
  <div class="quick-action-buttons-container">
    <button @click="$router.replace('/dashboard/')" title="Go back!"
      >Back</button
    >
  </div>
  <div class="content-box-group-container" v-if="$store.state.loadComplete">
    <ContentBox title="You" class="profile" selectable>
      <p>
        Username:
        <code
          v-text="
            `${$store.state.user.username} (${$store.state.user.displayName})`
          "
        />
      </p>
      <p>
        User ID:
        <code v-text="$store.state.user.id" />
      </p>
      <p>
        Email:
        <code v-text="$store.state.user.email" />
      </p>
      <p>
        Domain Selection:
        <code
          v-text="
            `${
              $store.state.user.subdomain
                ? `${$store.state.user.subdomain}.`
                : ''
            }${$store.state.user.domain}`
          "
        />
      </p>
      <p>
        Created at:
        <code
          v-text="
            $parent.$parent.toDateString(new Date($store.state.user.createdAt))
          "
        />
      </p>
      <p>
        Updated at:
        <code
          v-text="
            $parent.$parent.toDateString(new Date($store.state.user.updatedAt))
          "
        />
      </p>
      <p v-if="$store.state.user.staff !== null">
        Staff:
        <code v-text="$store.state.user.staff" />
      </p>
    </ContentBox>
    <ContentBox
      title="Change your username"
      span
      src="/assets/images/gear.svg"
      theme-safe
      @click="$refs.changeUsernameModal.show()"
    >
      <p>Click me to change your username!</p>
    </ContentBox>
    <ContentBox
      title="Change your email"
      span
      src="/assets/images/gear.svg"
      theme-safe
      @click="$refs.changeEmailModal.show()"
    >
      <p>Click me to change your email!</p>
    </ContentBox>
    <ContentBox
      title="Change your password"
      span
      src="/assets/images/gear.svg"
      theme-safe
      @click="$refs.changePasswordModal.show()"
    >
      <p>Click me to change your password!</p>
    </ContentBox>
    <ContentBox
      title="Change your domain"
      span
      src="/assets/images/gear.svg"
      theme-safe
      @click="showDomainModal()"
    >
      <p>Click me to change your domain selection!</p>
    </ContentBox>
    <ContentBox
      title="Manage sessions"
      span
      src="/assets/images/gear.svg"
      theme-safe
      to="sessions/"
    >
      <p>Manage devices/services that have access to your account!</p>
    </ContentBox>
    <ContentBox
      title="Clear preview cache"
      span
      src="/assets/images/gear.svg"
      theme-safe
      @click="$refs.clearCacheModal.show()"
    >
      <p>Having issues seeing previews in the file view? Try this!</p>
    </ContentBox>
    <ContentBox
      title="Clear all cached data"
      span
      src="/assets/images/gear.svg"
      theme-safe
      @click="$refs.clearDataModal.show()"
    >
      <p>Try me to attempt to fix interesting issues.</p>
    </ContentBox>
    <ContentBox
      title="About Cumulonimbus"
      span
      src="/assets/images/info.svg"
      theme-safe
      @click="$refs.aboutCumulonimbusModal.show()"
    >
      <p>Various information about the funny cloud platform.</p>
    </ContentBox>
  </div>
  <Loading v-else />
  <template v-if="$store.state.loadComplete">
    <h1>Danger Zone</h1>
    <h2>All of these actions are IRREVERSIBLE. Use them at your own risk!</h2>
    <div class="content-box-group-container">
      <ContentBox
        title="Sign out everywhere"
        src="/assets/images/gear.svg"
        span
        theme-safe
        @click="$refs.invalidateSessionsModal.show()"
      >
        <p
          >Feel like someone got into your account? Paranoid about security?
          Signing out everywhere can help keep your account safe.</p
        >
      </ContentBox>
      <ContentBox
        title="Delete all your files"
        src="/assets/images/gear.svg"
        span
        theme-safe
        @click="$refs.deleteAllFilesModal.show()"
      >
        <p
          >Want to rid the server of all your files without deleting your
          account? I can help you!</p
        >
      </ContentBox>
      <ContentBox
        title="Delete your account"
        src="/assets/images/gear.svg"
        span
        theme-safe
        @click="$refs.deleteAccountModal.show()"
      >
        <p>You want to delete your account? Here it is!</p>
      </ContentBox>
    </div>
  </template>
  <Modal ref="changeUsernameModal" title="Changing your username" cancelable>
    <p>Lets change your username!</p>
    <form ref="changeUsernameForm" @submit.prevent="changeUsername">
      <input
        name="username"
        placeholder="New Username"
        autocomplete="off"
        autofocus
      />
      <br />
      <input
        name="password"
        placeholder="Password"
        autocomplete="password"
        type="password"
      />
      <input type="submit" />
    </form>

    <template v-slot:buttons>
      <button @click="changeUsername" title="Change it!">Confirm</button>
    </template>
  </Modal>
  <Modal ref="changeEmailModal" title="Changing your email" cancelable>
    <p>Lets change your email!</p>
    <form ref="changeEmailForm" @submit.prevent="changeEmail">
      <input
        name="email"
        type="email"
        placeholder="New Email"
        autocomplete="off"
        autofocus
      />
      <br />
      <input
        type="password"
        name="password"
        placeholder="Password"
        autocomplete="password"
      />
      <input type="submit" />
    </form>

    <template v-slot:buttons>
      <button @click="changeEmail" title="Change it!">Confirm</button>
    </template>
  </Modal>
  <Modal ref="changePasswordModal" title="Changing your password" cancelable>
    <p>Lets change your password!</p>
    <form ref="changePasswordForm" @submit.prevent="changePassword">
      <input
        name="newPassword"
        type="password"
        placeholder="New Password"
        autocomplete="new-password"
        autofocus
      />
      <br />
      <input
        name="repeatNewPassword"
        type="password"
        placeholder="Repeat New Password"
        autocomplete="new-password"
        autofocus
      />
      <br />
      <input
        name="password"
        type="password"
        placeholder="Current Password"
        autocomplete="password"
      />
      <input type="submit" />
    </form>

    <template v-slot:buttons>
      <button @click="changePassword" title="Change it!">Confirm</button>
    </template>
  </Modal>
  <Modal ref="changeDomainModal" title="Change your domain" cancelable>
    <p>Let's change what your domain is!</p>
    <form ref="changeDomainForm" @submit.prevent="changeDomain">
      <input
        name="subdomain"
        type="text"
        maxlength="63"
        placeholder="Subdomain"
        :value="$store.state.user.subdomain"
        :disabled="!$data.subdomainCompatible"
      />
      <p>.</p>
      <select name="domain" @change="allowsSubdomains">
        <option
          v-for="domain in $data.domains"
          :key="domain.domain"
          :name="domain.domain"
          v-text="domain.domain"
        />
      </select>
    </form>

    <template v-slot:buttons>
      <button @click="changeDomain" title="Change it!">Confirm</button>
    </template>
  </Modal>
  <Modal ref="clearCacheModal" title="Clear preview cache" cancelable>
    <p
      >Clear the preview cache for the file previews in the file list! This may
      fix issues with previews loading improperly.</p
    >
    <template v-slot:buttons>
      <button
        @click="clearCache"
        title="Ha ha clear button go bRRRRRRRRRRRRRRRRRR"
        >I'm sure</button
      >
      <button
        @click="$refs.clearCacheModal.hide()"
        title="That's what I thought."
        >On second thought...</button
      >
    </template>
  </Modal>
  <Modal ref="invalidateSessionsModal" title="Sign out everywhere" cancelable>
    <p> This is going to sign you out of: </p>
    <p><strong>Browsers</strong></p>
    <p><strong>Services</strong></p>
    <p><strong>3rd Party Apps</strong></p>
    <p
      >Or anything else, using your account, the switch below will determine
      wether or not you want to stay signed in on this browser.</p
    >
    <div class="checkbox-container">
      <input
        type="checkbox"
        id="keep-this-session"
        ref="keepThisSession"
        checked
      />
      <label for="keep-this-session"><span></span></label
      ><p class="label-right">Keep me signed in here</p>
    </div>
    <template v-slot:buttons>
      <button @click="invalidateSessions" title="So long logins!"
        >I'm sure</button
      >
      <button
        @click="$refs.invalidateSessionsModal.hide()"
        title="That's what I thought."
        >On second thought...</button
      >
    </template>
  </Modal>
  <Modal ref="deleteAllFilesModal" cancelable title="Delete all of your files">
    <p
      >This will delete EVERY file you've uploaded, and there are NO take
      backsies, period.</p
    >
    <template v-slot:buttons>
      <button @click="deleteAllFiles" title="So long files!">I'm sure</button>
      <button
        @click="$refs.deleteAllFilesModal.hide()"
        title="That's what I thought."
        >On second thought...</button
      >
    </template>
  </Modal>
  <Modal ref="deleteAccountModal" title="Delete your account" cancelable>
    <p
      >We're sad to see you go, but we understand if you really want to.
      Remember that this is permanent. All of your files will be permanently
      deleted, your account data will be deleted, not anonymized, and your
      username will be available to be taken by anyone creating a new
      account.</p
    >
    <p>
      If you're 100% positive you would like to delete your account, please
      confirm your username and password below.</p
    >
    <form ref="deleteAccountForm" @submit.prevent="deleteAccount">
      <input
        name="username"
        placeholder="Username"
        autocomplete="username"
        autofocus
      />
      <br />
      <input
        name="password"
        placeholder="Password"
        autocomplete="password"
        type="password"
      />
      <input type="submit" />
    </form>

    <template v-slot:buttons>
      <button @click="deleteAccount" title="Goodbye">Confirm</button>
      <button
        @click="$refs.deleteAccountModal.hide()"
        title="That's what I thought."
        >On second thought...</button
      >
    </template>
  </Modal>
  <Modal ref="clearDataModal" title="Clear all cached data" cancelable>
    <p
      >This can fix issues that come from your browser inconsistently updating,
      the update system is janky, even with my attempts to improve it, issues
      still fall through from time to time. If you think that's why you're
      having issues, go ahead and continue. You will need to be online to pull
      the latest version of Cumulonimbus.</p
    >
    <template v-slot:buttons>
      <button
        @click="clearData"
        title="Ha ha clear button go bRRRRRRRRRRRRRRRRRR"
        >I'm sure</button
      >
      <button
        @click="$refs.clearDataModal.hide()"
        title="That's what I thought."
        >On second thought...</button
      >
    </template>
  </Modal>
  <Modal ref="aboutCumulonimbusModal" cancelable title="About Cumulonimbus">
    <p> Frontend Version: <code v-text="$appInformation.version" /> </p>
    <p> Backend Version: <code v-text="$data.apiInfo.version" /> </p>
    <p>
      Thumbnail Backend Version: <code v-text="$data.thumbApiInfo.version" />
    </p>
    <p> API Wrapper version: <code v-text="$data.wrapperVersion" /> </p>
    <p>
      Backend Latency (as of:
      <code v-text="$data.apiInfo.asOf.toTimeString()" />):
      <code v-text="`${$data.apiInfo.latency} ms`" />
    </p>
    <p>
      Thumbnail Backend Latency (as of:
      <code v-text="$data.thumbApiInfo.asOf.toTimeString()" />):
      <code v-text="`${$data.thumbApiInfo.latency} ms`" />
    </p>
    <div class="dependency-list-container">
      <div class="dependency-list">
        <p><strong>Frontend Dependencies</strong></p>
        <p v-for="(ver, pkg) of $appInformation.dependencies" :key="pkg">
          <code v-text="pkg" />: <code v-text="ver" />
        </p>
      </div>
      <div class="dependency-list">
        <p><strong>Frontend Development Dependencies</strong></p>
        <p v-for="(ver, pkg) of $appInformation.devDependencies" :key="pkg">
          <code v-text="pkg" />: <code v-text="ver" />
        </p>
      </div>
    </div>
    <p>Made with ❤️ by Alek Evans</p>
    <template v-slot:buttons>
      <button @click="$refs.aboutCumulonimbusModal.hide()" title="Close">
        Close
      </button>
      <button @click="refreshAPIInfo" title="Refresh API Info">
        Refresh API Info
      </button>
    </template>
  </Modal>

  <transition name="long-action-animation-container">
    <div v-if="$data.longAction" class="long-action-animation-container"
      ><Loading
    /></div>
  </transition>
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
    data() {
      return {
        domains: [],
        subdomainCompatible: true,
        longAction: false,
        apiInfo: {},
        thumbApiInfo: {},
        wrapperVersion: Cumulonimbus.VERSION
      };
    },
    title: 'Your Profile'
  })
  export default class VueComponent extends Vue {
    declare $data: {
      domains: Cumulonimbus.Data.Domain[];
      subdomainCompatible: boolean;
      longAction: boolean;
      apiInfo: {
        latency: number;
        asOf: Date;
        version: string;
      };
      thumbApiInfo: {
        latency: number;
        asOf: Date;
        version: string;
      };
    };
    declare $refs: {
      changeUsernameModal: Modal;
      changeUsernameForm: HTMLFormElement;
      changeEmailModal: Modal;
      changeEmailForm: HTMLFormElement;
      changePasswordModal: Modal;
      changePasswordForm: HTMLFormElement;
      changeDomainModal: Modal;
      changeDomainForm: HTMLFormElement;
      clearCacheModal: Modal;
      clearDataModal: Modal;
      aboutCumulonimbusModal: Modal;
      invalidateSessionsModal: Modal;
      keepThisSession: HTMLInputElement;
      deleteAllFilesModal: Modal;
      deleteAccountModal: Modal;
      deleteAccountForm: HTMLFormElement;
    };
    async mounted() {
      if (!navigator.onLine) {
        (this.$parent?.$parent as App).temporaryToast(
          "Looks like you're offline, I'm pretty useless offline.",
          5000
        );
        return;
      }
      try {
        let domains = await (this.$store.state.client as Client).getDomains();
        this.$data.domains = domains.items;
        this.$data.subdomainCompatible = this.$data.domains.find(
          e => e.domain === this.$store.state.user?.domain
        )?.allowsSubdomains as boolean;
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
            case 'INVALID_PASSWORD_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'No, that is not the password.',
                5000
              );
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "Uh oh, looks like you've been banned from Cumulonimbus, sorry for the inconvenience.",
                5000
              );
              this.$store.commit('setUser', null);
              this.$store.commit('setSession', null);
              this.$store.commit('setClient', null);
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
      await this.refreshAPIInfo();
    }

    async refreshAPIInfo() {
      await this.getAPISanity();
      await this.getThumbAPISanity();
    }

    async getAPISanity() {
      try {
        const apiReqBegin = Date.now();
        let apiData = await (this.$store.state.client as Client).sanityCheck();
        const apiReqEnd = Date.now();
        this.$data.apiInfo.latency = apiReqEnd - apiReqBegin;
        this.$data.apiInfo.version = apiData.version;
        this.$data.apiInfo.asOf = new Date(apiReqEnd);
      } catch (error) {
        (this.$parent?.$parent as App).temporaryToast(
          'I did something weird, lets try again later.',
          5000
        );
        console.error(error);
      }
    }

    async getThumbAPISanity() {
      try {
        const apiReqBegin = Date.now();
        let apiData = await (
          this.$store.state.client as Client
        ).thumbnailSanityCheck();
        const apiReqEnd = Date.now();
        this.$data.thumbApiInfo.latency = apiReqEnd - apiReqBegin;
        this.$data.thumbApiInfo.version = apiData.version;
        this.$data.thumbApiInfo.asOf = new Date(apiReqEnd);
      } catch (error) {
        (this.$parent?.$parent as App).temporaryToast(
          'I did something weird, lets try again later.',
          5000
        );
        console.error(error);
      }
    }

    async changeUsername() {
      const data = new FormData(this.$refs.changeUsernameForm);
      try {
        let res = await (this.$store.state.client as Client).editSelfUser(
          data.get('password')?.toString() as string,
          { username: data.get('username')?.toString() as string }
        );

        this.$store.commit('setUser', res);
        this.$refs.changeUsernameModal.hide();
        (this.$parent?.$parent as App).temporaryToast('Done!', 2000);
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
            case 'INVALID_PASSWORD_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'No, that is not the password.',
                5000
              );
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "Uh oh, looks like you've been banned from Cumulonimbus, sorry for the inconvenience.",
                5000
              );
              this.$store.commit('setUser', null);
              this.$store.commit('setSession', null);
              this.$store.commit('setClient', null);
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

    async changeEmail() {
      const data = new FormData(this.$refs.changeEmailForm);
      try {
        let res = await (this.$store.state.client as Client).editSelfUser(
          data.get('password')?.toString() as string,
          { email: data.get('email')?.toString() as string }
        );

        this.$store.commit('setUser', res);
        this.$refs.changeEmailModal.hide();
        (this.$parent?.$parent as App).temporaryToast('Done!', 2000);
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
            case 'INVALID_PASSWORD_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'No, that is not the password.',
                5000
              );
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "Uh oh, looks like you've been banned from Cumulonimbus, sorry for the inconvenience.",
                5000
              );
              this.$store.commit('setUser', null);
              this.$store.commit('setSession', null);
              this.$store.commit('setClient', null);
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

    async changePassword() {
      const data = new FormData(this.$refs.changePasswordForm);
      if (
        (data.get('newPassword') as string) !==
        (data.get('repeatNewPassword') as string)
      ) {
        (this.$parent?.$parent as any).temporaryToast(
          'These passwords do not match!',
          5000
        );
        return;
      }
      try {
        let res = await (this.$store.state.client as Client).editSelfUser(
          data.get('password')?.toString() as string,
          { newPassword: data.get('newPassword')?.toString() as string }
        );

        this.$store.commit('setUser', res);
        this.$refs.changePasswordModal.hide();
        (this.$parent?.$parent as App).temporaryToast('Done!', 2000);
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
            case 'INVALID_PASSWORD_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'No, that is not the password.',
                5000
              );
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "Uh oh, looks like you've been banned from Cumulonimbus, sorry for the inconvenience.",
                5000
              );
              this.$store.commit('setUser', null);
              this.$store.commit('setSession', null);
              this.$store.commit('setClient', null);
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

    showDomainModal() {
      this.$refs.changeDomainModal.show();
      setTimeout(
        () =>
          ((
            document.querySelector('select[name="domain"]') as HTMLSelectElement
          ).value = this.$store.state.user?.domain as string),
        10
      );
    }

    allowsSubdomains() {
      const data = new FormData(this.$refs.changeDomainForm);
      this.$data.subdomainCompatible = this.$data.domains.find(
        a => a.domain === data.get('domain')
      )?.allowsSubdomains as boolean;

      if (!this.$data.subdomainCompatible) {
        (this.$parent?.$parent as App).temporaryToast(
          "This domain isn't compatible with subdomains! Sorry!",
          5000
        );
      }
    }

    async changeDomain() {
      const data = new FormData(this.$refs.changeDomainForm);
      try {
        let res = await (this.$store.state.client as Client).editSelfDomain(
          data.get('domain') as string,
          data.get('subdomain') !== '' && this.$data.subdomainCompatible
            ? (data.get('subdomain') as string)
            : undefined
        );
        this.$store.commit('setUser', res);
        this.$refs.changeDomainModal.hide();
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
            case 'INVALID_SUBDOMAIN_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "Your subdomain can't be longer than 63 characters!",
                5000
              );
              break;
            case 'SUBDOMAIN_NOT_SUPPORTED_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "I said, this domain doesn't support subdomains!",
                5000
              );
              break;
            case 'INVALID_DOMAIN_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "That domain isn't an option anymore, let me reload the list!",
                5000
              );
              let domains = await (
                this.$store.state.client as Client
              ).getDomains();
              this.$data.domains = domains.items;

              this.$data.subdomainCompatible = this.$data.domains.find(
                e => e.domain === this.$store.state.user?.domain
              )?.allowsSubdomains as boolean;
              (
                document.querySelector(
                  'select[name="domain"]'
                ) as HTMLSelectElement
              ).value = this.$store.state.user?.domain as string;
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "Uh oh, looks like you've been banned from Cumulonimbus, sorry for the inconvenience.",
                5000
              );
              this.$store.commit('setUser', null);
              this.$store.commit('setSession', null);
              this.$store.commit('setClient', null);
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

    clearCache() {
      navigator.serviceWorker.controller?.postMessage({
        op: 2
      });
      (this.$parent?.$parent as App).temporaryToast('Done!', 2000);
      this.$refs.clearCacheModal.hide();
    }

    async clearData() {
      let registration = await navigator.serviceWorker.getRegistration();
      await registration?.unregister();
      (this.$parent?.$parent as App).temporaryToast('Done, refreshing!', 1000);
      this.$refs.clearDataModal.hide();
      await new Promise(res => setTimeout(res, 1000));
      window.location.reload();
    }

    async invalidateSessions() {
      try {
        let res = await (
          this.$store.state.client as Client
        ).bulkDeleteAllSelfSessions(this.$refs.keepThisSession.checked);
        this.$refs.invalidateSessionsModal.hide();
        if (!this.$refs.keepThisSession.checked) {
          (this.$parent?.$parent as App).temporaryToast(
            `See you later! Logged out: ${res.count} sessions!`,
            5000
          );
          (this.$parent?.$parent as App).redirectIfNotLoggedIn(
            window.location.pathname
          );
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            `Done! Logged out: ${res.count} sessions!`,
            5000
          );
        }
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
              this.$store.commit('setUser', null);
              this.$store.commit('setSession', null);
              this.$store.commit('setClient', null);
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

    async deleteAllFiles() {
      try {
        this.$refs.deleteAllFilesModal.hide();
        this.$data.longAction = true;
        let res = await (
          this.$store.state.client as Client
        ).bulkDeleteAllSelfFiles();
        this.$refs.deleteAllFilesModal.hide();
        (this.$parent?.$parent as App).temporaryToast(
          `Done! Deleted: ${res.count} files!`,
          5000
        );
        this.$data.longAction = false;
      } catch (error) {
        this.$data.longAction = false;
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
              this.$store.commit('setUser', null);
              this.$store.commit('setSession', null);
              this.$store.commit('setClient', null);
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

    async deleteAccount() {
      const data = new FormData(this.$refs.deleteAccountForm);
      try {
        this.$refs.deleteAccountModal.hide();
        this.$data.longAction = true;
        let res = await (this.$store.state.client as Client).deleteSelfUser(
          data.get('username') as string,
          data.get('password') as string
        );
        this.$data.longAction = false;
        console.log(res);
        (this.$parent?.$parent as App).temporaryToast(
          'Goodbye, we hope you enjoyed Cumulonimbus!',
          5000
        );
        (this.$parent?.$parent as App).redirectIfNotLoggedIn(
          window.location.pathname
        );
      } catch (error) {
        this.$data.longAction = false;
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
              this.$store.commit('setUser', null);
              this.$store.commit('setSession', null);
              this.$store.commit('setClient', null);
              (this.$parent?.$parent as App).redirectIfNotLoggedIn(
                window.location.pathname
              );
              break;
            case 'INVALID_PASSWORD_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'No, that is not the password.',
                5000
              );
              break;
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'No, that is not your username.',
                5000
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
  }
</script>

<style>
  .content-box.profile {
    width: calc((100% - (25px * 2 + 20px * 2 + 1px * 2) * 1) / 1);
  }

  input[type='text'][name='subdomain'] {
    text-align: right;
  }

  select[name='domain'],
  input[type='text'][name='subdomain'] {
    width: 30vw;
  }

  input[type='text'][name='subdomain'] + p {
    display: inline;
    font-weight: 900;
    font-size: xx-large;
    margin: 0 5px;
  }

  .long-action-animation-container {
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

  .long-action-animation-container-enter-active,
  .long-action-animation-container-leave-active {
    transition: opacity 0.4s, backdrop-filter 0.4s;
  }

  .long-action-animation-container-enter-from,
  .long-action-animation-container-leave-to {
    opacity: 0;
    backdrop-filter: none;
  }

  .long-action-animation-container-enter-to,
  .long-action-animation-container-leave-from {
    opacity: 1;
    backdrop-filter: blur(3px);
  }

  .dependency-list-container {
    margin-top: 12px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }

  .dependency-list {
    width: 45%;
    padding: 8px;
    border-radius: 8px;
    background-color: #ddd;
  }

  @media screen and (max-width: 840px) {
    .dependency-list {
      width: 100%;
      margin: 6px 0;
    }

    .dependency-list:first-child {
      margin-top: 0;
    }

    .dependency-list:last-child {
      margin-bottom: 0;
    }
  }

  html.dark-theme .dependency-list {
    background-color: #161616;
  }
</style>
