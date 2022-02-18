<template>
  <h1>Set Up</h1>
  <h2>Trust me, you'll be done in a couple minutes.</h2>
  <div class="quick-action-buttons-container">
    <button @click="$router.replace('/dashboard/set-up')" title="Go back!"
      >Back</button
    >
  </div>
  <Modal ref="identityModal" title="Verify your identity">
    <p
      >Please verify your identity. That way we can make sure its really you and
      create a unique session for this service so you can keep your account more
      secure.
      <br />
      <br />
      Give a name to this session that will be created so its easily
      identifiable in case the session needs to be invalidated.</p
    >

    <form ref="identityForm" @submit.prevent="verify">
      <input
        type="text"
        autocomplete="off"
        :placeholder="`${$data.instruction?.displayName} on ${$data.os}`"
        :value="`${$data.instruction?.displayName} on ${$data.os}`"
        name="tname"
      />
      <br />
      <input
        type="password"
        autocomplete="password"
        placeholder="Password"
        name="pass"
        autofocus
        required
      />
      <input type="submit" />
    </form>

    <template v-slot:buttons>
      <button @click="goBack" title="Go back">Nevermind</button>
      <button @click="verify" title="Yes I am me">Verify</button>
    </template>
  </Modal>
  <template v-if="$data.newIdentity !== undefined">
    <div class="content-box-group-container" v-if="$data.loaded">
      <ContentBox
        v-for="(step, index) in $data.instruction?.steps"
        :key="index"
        :title="`Step ${index + 1}`"
        :selectable="index !== 0"
        :span="index === 0"
        @click="downloadSetUpFile(index)"
        ><p>{{ step }}</p></ContentBox
      >
    </div>
    <Loading v-else />
  </template>
  <p v-else>Please verify your identity before continuing.</p>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import ContentBox from '@/components/ContentBox.vue';
  import Modal from '@/components/Modal.vue';
  import Loading from '@/components/Loading.vue';
  import App from '@/App.vue';
  import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';

  @Options({
    components: { ContentBox, Modal, Loading },
    data() {
      return {
        instruction: undefined,
        loaded: false,
        newIdentity: undefined,
        os: undefined
      };
    }
  })
  export default class SetUpService extends Vue {
    declare $data: {
      instruction?: Cumulonimbus.Data.Instruction;
      loaded: boolean;
      newIdentity?: Cumulonimbus.Data.SuccessfulAuth;
      os?: string;
    };

    declare $refs: {
      identityModal: Modal;
      identityForm: HTMLFormElement;
    };

    async mounted() {
      this.$data.os = (navigator as any).userAgentData
        ? (navigator as any).userAgentData.platform
        : navigator.platform;
      const urlSearchParams = new URLSearchParams(window.location.search);
      if (!navigator.onLine) {
        (this.$parent?.$parent as App).temporaryToast(
          "Looks like you're offline, I'm pretty useless offline. Without the internet I cannot do the things you requested me to. I don't know what anything is without the internet. I wish i had the internet so I could browse TikTok. Please give me access to TikTok.",
          15000
        );
        return;
      }
      try {
        if (!urlSearchParams.has('name')) {
          this.$router.push('/dashboard/set-up');
          return;
        }
        let res = await (this.$store.state.client as Client).getInstructionByID(
          urlSearchParams.get('name') as string
        );
        this.$data.instruction = res;
        this.$data.loaded = true;
        this.$refs.identityModal.show();
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'INVALID_INSTRUCTION_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "That service doesn't exist silly!",
                5000
              );
              this.$router.push('/dashboard/set-up');
              break;
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

    copyToClipboard() {
      navigator.clipboard
        .writeText(this.$data.newIdentity?.token as string)
        .then(
          () => {
            (this.$parent?.$parent as App).temporaryToast(
              'Copied to your clipboard!'
            );
          },
          err => {
            (this.$parent?.$parent as App).temporaryToast(
              "I still wasn't able to do it, it might be a browser permission issue. Let us know about it in the discord please!",
              10000
            );
            console.error(err);
          }
        );
    }

    async downloadSetUpFile(index: number) {
      if (index !== 0) return;
      let configWithToken = this.$data.instruction?.fileContent.replace(
        '{{token}}',
        this.$data.newIdentity?.token as string
      );
      if (this.$data.instruction?.filename !== null) {
        let aE = document.createElement('a'),
          url = URL.createObjectURL(new Blob([configWithToken as string]));
        aE.download = this.$data.instruction?.filename as string;
        aE.style.display = 'none';
        aE.href = url;
        document.body.appendChild(aE);
        aE.click();
        URL.revokeObjectURL(url);
        aE.remove();
      } else {
        this.copyToClipboard();
      }
    }

    goBack() {
      this.$refs.identityModal.hide();
      setTimeout(() => this.$router.push('/dashboard/set-up'), 400);
    }

    async verify() {
      const data = new FormData(this.$refs.identityForm),
        formTName = data.get('tname')?.toString(),
        tName =
          formTName !== '' && formTName !== undefined
            ? formTName
            : `${this.$data.instruction?.displayName} on ${this.$data.os}`;
      try {
        let newSession = await fetch(Cumulonimbus.BASE_URL + '/user/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Token-Name': tName
          },
          body: JSON.stringify({
            user: this.$store.state.user?.username,
            pass:
              (data.get('pass') as string) === ''
                ? null
                : (data.get('pass') as string),
            rememberMe: true
          })
        });
        let json = await newSession.json();
        if (newSession.ok) {
          this.$data.newIdentity = json;
          this.$refs.identityModal.hide();
        } else {
          switch (json.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                Number(newSession.headers.get('X-RateLimit-Reset') as string)
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
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "Hmm, I can't seem to find anyone with that username or email!",
                5000
              );
              break;
            case 'INVALID_PASSWORD_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'No, that is not the password.',
                5000
              );
              break;
            case 'MISSING_FIELDS_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The password is not optional.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(json);
          }
        }
      } catch (error) {
        (this.$parent?.$parent as App).temporaryToast(
          'I did something weird, lets try again later.',
          5000
        );
        console.error(error);
      }
    }
  }
</script>

<style scoped>
  form input[type='submit'] {
    display: none;
  }
</style>
