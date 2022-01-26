<template>
  <h1>Welcome to Cumulonimbus!</h1>
  <div class="auth-box-container">
    <div class="auth-box"
      ><br />
      <div class="checkbox-container"
        ><p @click="$data.signIn = false" class="label-left">Register</p>
        <input
          type="checkbox"
          id="sign-in-toggle"
          :checked="$data.signIn"
          @change="signInOrRegister"
        />
        <label for="sign-in-toggle"><span></span></label
        ><p @click="$data.signIn = true" class="label-right">Sign In</p>
      </div>
      <template v-if="$data.signIn">
        <h2>Sign In</h2>
        <form ref="signInForm" @submit.prevent="submitSignIn">
          <input
            type="text"
            autocomplete="username"
            placeholder="Username or Email"
            maxlength="100"
            name="user"
            required
          />
          <br />
          <input
            type="password"
            autocomplete="password"
            placeholder="Password"
            name="pass"
            required
          />
          <br />
          <div class="checkbox-container">
            <input type="checkbox" id="remember-me1" name="rememberMe" />
            <label for="remember-me1"><span></span></label
            ><p class="label-right">Remember Me</p>
          </div>
          <br />
          <button>Sign In</button>
        </form>
      </template>
      <template v-else>
        <h2>Register</h2>
        <form ref="registerForm" @submit.prevent="submitRegister">
          <input
            type="text"
            autocomplete="username"
            placeholder="Username"
            maxlength="100"
            name="username"
            required
          />
          <br />
          <input
            type="email"
            autocomplete="email"
            placeholder="Email"
            maxlength="100"
            name="email"
            required
          />
          <br />
          <input
            type="password"
            autocomplete="new-password"
            placeholder="Password"
            name="password"
            required
          />
          <br />
          <input
            type="password"
            autocomplete="new-password"
            placeholder="Repeat Password"
            name="repeatPassword"
            required
          />
          <br />
          <div class="checkbox-container">
            <input type="checkbox" id="remember-me2" name="rememberMe" />
            <label for="remember-me2"><span></span></label
            ><p class="label-right">Remember Me</p>
          </div>
          <br />
          <button>Register</button>
        </form>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';
  import App from '@/App.vue';

  @Options({
    components: {},
    data() {
      return {
        signIn: true
      };
    },
    title: 'Sign-in/Register'
  })
  export default class Auth extends Vue {
    declare $refs: {
      signInForm: HTMLFormElement;
      registerForm: HTMLFormElement;
    };
    declare $data: {
      signIn: boolean;
    };
    async submitSignIn() {
      try {
        let a = new FormData(this.$refs.signInForm);

        let loginRes = await this.$store.dispatch('login', {
          user: a.get('user'),
          pass: a.get('pass'),
          rememberMe: a.has('rememberMe')
        });
        if (loginRes === true) this.authedRedir();
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "Uh oh, looks like you've been banned from Cumulonimbus, sorry for the inconvenience.",
                5000
              );
              break;
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
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

    async submitRegister() {
      try {
        let a = new FormData(this.$refs.registerForm);

        if (a.get('password') !== a.get('repeatPassword')) {
          (this.$parent?.$parent as any).temporaryToast(
            'These passwords do not match!',
            5000
          );
        } else {
          let createAccRes = await this.$store.dispatch('createAccount', {
            username: a.get('username') as string,
            password: a.get('password') as string,
            repeatPassword: a.get('repeatPassword') as string,
            email: a.get('email') as string,
            rememberMe: a.has('rememberMe')
          });
          if (createAccRes === true) this.authedRedir();
        }
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'MISSING_FIELDS_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'You need to fill everything out.',
                5000
              );
              break;
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'USER_EXISTS_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'Someone already has that username or email!',
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

    signInOrRegister(e: InputEvent) {
      this.$data.signIn = (e.target as HTMLInputElement).checked;
    }

    authedRedir() {
      const urlSearchParams = new URLSearchParams(window.location.search);
      this.$router.push(
        urlSearchParams.has('redirect')
          ? (urlSearchParams.get('redirect') as string)
          : '/dashboard/'
      );
    }

    async mounted() {
      if (!navigator.onLine) {
        (this.$parent?.$parent as App).temporaryToast(
          "Looks like you're offline, I'm pretty useless offline.",
          5000
        );
        return;
      }
      if (await (this.$parent?.$parent as App).isLoggedIn()) {
        this.authedRedir();
      }
    }

    success() {
      const urlSearchParams = new URLSearchParams(window.location.search);
      this.$router.push(
        urlSearchParams.has('redirect')
          ? (urlSearchParams.get('redirect') as string)
          : '/dashboard/'
      );
    }
  }
</script>

<style>
  .auth-box-container {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 100px 0 25px 0;
  }

  .auth-box {
    border-radius: 50px;
    width: 40vw;
    border: 2px solid #cccccc;
    box-shadow: 0px 0px 75px 20px #ccccccaa;
    transition: background-color 0.25s, border 0.25s, box-shadow 0.25s;
    padding: 0 25px 45px 25px;
    min-width: fit-content;
  }

  form input {
    text-align: center;
  }

  .auth-box h2 {
    margin-top: 45px;
  }

  html.dark-theme .auth-box {
    border: 2px solid #000000;
    box-shadow: 0px 0px 75px 20px #000000aa;
  }

  .label-left,
  .label-right {
    cursor: pointer;
  }

  .auth-box input {
    font-size: 20px;
  }
</style>
