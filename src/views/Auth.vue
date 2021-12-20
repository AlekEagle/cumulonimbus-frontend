<template>
  <h1>Welcome to Cumulonimbus!</h1>
  <div class="auth-box-container">
    <div class="auth-box"
      ><br />
      <div class="checkbox-container"
        ><p class="label-left">Register</p>
        <input
          type="checkbox"
          id="sign-in-toggle"
          :checked="signIn"
          @change="signInOrRegister"
        />
        <label for="sign-in-toggle"><span></span></label
        ><p class="label-right">Sign In</p>
      </div>
      <template v-if="signIn">
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
  import { Client } from '../../../cumulonimbus-wrapper';

  @Options({
    components: {},
    data() {
      return {
        signIn: true
      };
    }
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
      let a = new FormData(this.$refs.signInForm);

      let res = await Client.login(
        a.get('user') as string,
        a.get('pass') as string,
        !!(a.get('rememberMe') as string)
      );

      localStorage.setItem('token', (res as any).token);

      this.$store.commit('setClient', res);
      this.authedRedir();
    }

    async submitRegister() {
      let a = new FormData(this.$refs.registerForm);

      if (a.get('password') !== a.get('repeatPassword')) {
        (this.$parent?.$parent as any).temporaryToast(
          'These passwords do not match!',
          5000
        );
      } else {
        let res = await Client.createAccount(
          a.get('username') as string,
          a.get('password') as string,
          a.get('email') as string,
          !!(a.get('rememberMe') as string)
        );

        localStorage.setItem('token', (res as any).token);

        this.$store.commit('setClient', res);
        this.authedRedir();
      }
    }

    signInOrRegister(e: InputEvent) {
      this.$data.signIn = (e.target as HTMLInputElement).checked;
    }

    isSignedIn() {
      return !!this.$store.state.client;
    }

    authedRedir() {
      const urlSearchParams = new URLSearchParams(window.location.search);
      this.$router.push(
        urlSearchParams.has('redirect')
          ? (urlSearchParams.get('redirect') as string)
          : '/dashboard/'
      );
    }

    mounted() {
      if (this.isSignedIn()) {
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
    font-size: 20px;
  }

  .auth-box h2 {
    margin-top: 45px;
  }

  html.dark-theme .auth-box {
    border: 2px solid #000000;
    box-shadow: 0px 0px 75px 20px #000000aa;
  }
</style>
