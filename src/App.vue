<template>
  <header class="header">
    <router-link to="/">
      <div class="nav-logo">
        <img src="/assets/images/Cumulonimbus.svg" />
        <p>Cumulonimbus</p>
      </div>
    </router-link>
    <nav class="navbar">
      <ul ref="navMenu" class="nav-menu">
        <li class="nav-item">
          <ThemeToggle />
        </li>
        <li class="nav-item" @click="hideMobileMenu">
          <router-link to="/">Home</router-link>
        </li>
        <li class="nav-item" @click="hideMobileMenu">
          <router-link
            :to="
              !!this.$store.state.client
                ? '/dashboard/'
                : '/auth/?redirect=%2Fdashboard%2F'
            "
            >Dashboard</router-link
          >
        </li>
        <li class="nav-item" @click="hideMobileMenu">
          <a :href="`https://docs.${hostname}`" target="_blank"
            >Documentation</a
          >
        </li>
        <li class="nav-item" @click="hideMobileMenu">
          <a href="https://alekeagle.com/d" target="_blank">Discord</a>
        </li>
      </ul>
      <div ref="hamburger" class="hamburger" @click="mobileMenu"
        ><span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>
    </nav>
  </header>
  <div class="content">
    <router-view />
  </div>
  <Toast ref="toast" />
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import ThemeToggle from '@/components/ThemeToggle.vue';
  import Toast from '@/components/Toast.vue';
  import { Client } from '../../cumulonimbus-wrapper';

  @Options({
    components: {
      ThemeToggle,
      Toast
    },
    data() {
      return {
        hostname: undefined
      };
    }
  })
  export default class App extends Vue {
    declare $refs: {
      navMenu: HTMLUListElement;
      hamburger: HTMLDivElement;
      toast: Toast;
    };

    declare $data: {
      hostname?: string;
    };

    async isLoggedIn() {
      if (!!this.$store.state.client) {
        let authCheck = await this.$store.dispatch('checkClientAuth');
        if (typeof authCheck === 'boolean') return authCheck;
        else return false;
      } else return false;
    }

    async redirectIfNotLoggedIn(path: string): Promise<boolean> {
      if (!(await this.isLoggedIn())) {
        if (!path.startsWith('/dashboard')) return false;
        this.$router.push(`/auth/?redirect=${encodeURIComponent(path)}`);
        return true;
      } else return false;
    }

    mobileMenu() {
      this.$refs.navMenu.classList.toggle('active');
      this.$refs.hamburger.classList.toggle('active');
    }

    hideMobileMenu() {
      this.$refs.navMenu.classList.remove('active');
      this.$refs.hamburger.classList.remove('active');
    }

    showToast(time?: number | boolean) {
      this.$refs.toast.show(time);
    }

    hideToast() {
      this.$refs.toast.hide();
    }

    temporaryToast(text: string, time?: number) {
      this.$refs.toast.toastTemporary(text, time);
    }

    permanentToast(text: string) {
      this.$refs.toast.toastPermanent(text);
    }

    ratelimitToast(reset: number) {
      let timeLeftMills = reset * 1000 - Date.now();
      let hours = Math.floor(timeLeftMills / (1000 * 60 * 60));
      timeLeftMills = timeLeftMills % (1000 * 60 * 60);
      let minutes = Math.floor(timeLeftMills / (1000 * 60));
      timeLeftMills = timeLeftMills % (1000 * 60);
      let seconds = Math.round(timeLeftMills / 1000);
      this.temporaryToast(
        `Woah, slow down! Please wait ${hours > 0 ? `${hours} hour(s) ` : ''}${
          minutes > 0 ? `${minutes} minute(s) ` : ''
        }${
          hours > 0 || minutes > 0 ? 'and ' : ''
        }${seconds} second(s) before trying again.`
      );
    }

    async beforeMount() {
      if (localStorage.getItem('token')) {
        this.$store.commit(
          'setClient',
          new Client(localStorage.getItem('token') as string)
        );
        let s = await (this.$store.state.client as Client).getSelfSessionByID();
        this.$store.commit('setSession', s);
        let u = await (this.$store.state.client as Client).getSelfUser();
        this.$store.commit('setUser', u);
      }
    }

    mounted() {
      this.$data.hostname = window.location.hostname;
      (window as any).cumClient = this.$store.state.client;
    }
  }
</script>

<style>
  body {
    margin: 0;
    transition: background-color 0.25s, color 0.25s;
  }

  html.dark-theme body {
    background-color: #212121;
    color: white;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: 'Montserrat', 'Franklin Gothic Medium', 'Arial Narrow', Arial,
      sans-serif;

    transition: background-color 0.25s;
  }

  li {
    list-style: none;
  }

  .header {
    display: flex;
    width: calc(100vw - (10px * 2));
    justify-content: space-between;
    margin: 10px 10px 0;
    align-items: center;
  }

  .nav-links {
    margin-right: 15px;
    float: right;
  }

  .hamburger {
    display: none;
  }

  .nav-menu {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: fit-content;
    padding: 0;
    margin: 0;
  }

  .bar {
    display: block;
    width: 25px;
    height: 3px;
    margin: 5px auto;
    transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out,
      background-color 0.25s;
    background-color: #101010;
  }

  html.dark-theme .bar {
    background-color: white;
  }

  a {
    text-decoration: none;
    color: #005f77;
    transition: background-color 0.25s, color 0.25s;
  }

  html.dark-theme a {
    color: #00f7ff;
  }

  .dark-mode-widget {
    margin-left: auto;
  }

  .content h2 {
    margin-left: 5px;
    margin-right: 5px;
  }

  h5,
  h6,
  p {
    font-size: 20px;
    color: black;
    font-family: 'Ubuntu', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    transition: background-color 0.25s, color 0.25s;
  }

  html.dark-theme h5,
  html.dark-theme h6,
  html.dark-theme p {
    color: white;
  }

  .nav-item {
    user-select: none;
  }

  .nav-item a {
    height: fit-content;
    font-family: 'Montserrat', 'Franklin Gothic Medium', 'Arial Narrow', Arial,
      sans-serif;
    margin: 0 5px;
    font-size: 19px;
    font-weight: 600;
    color: #000000;
    border-bottom: transparent solid 2px;
    transition: border 0.25s, color 0.25s;
  }

  html.dark-theme .nav-item a {
    color: white;
    border-bottom: transparent solid 2px;
  }

  .nav-item a.router-link-active {
    border-bottom: #000000 solid 2px;
  }

  .nav-item a:hover:not(.router-link-active) {
    border-bottom: #019ac0 solid 2px;
  }

  html.dark-theme .nav-item a:hover:not(.router-link-active) {
    border-bottom: #019ac0 solid 2px;
  }

  html.dark-theme .nav-item a.router-link-active {
    border-bottom: #ffffff solid 2px;
  }

  .nav-logo {
    display: flex;
    align-items: center;
    user-select: none;
  }

  .nav-logo p {
    height: fit-content;
    margin: 0 0 0 10px;
    padding: 0;
    font-family: 'Montserrat', 'Franklin Gothic Medium', 'Arial Narrow', Arial,
      sans-serif;
    font-weight: 600;
    font-size: 28px;
    color: black;
  }

  html.dark-theme .nav-logo p {
    color: white;
  }

  .nav-logo img {
    height: 50px;
    border-radius: 50%;
    box-shadow: 4px 4px 4px #818181;
    transition: box-shadow 0.25s;
  }

  html.dark-theme .nav-logo img {
    box-shadow: 4px 4px 4px #000000;
  }

  .content {
    text-align: center;
  }

  @media only screen and (max-width: 840px) {
    .nav-menu {
      padding: 10px 0;
      position: fixed;
      left: -100%;
      top: 5rem;
      flex-direction: column;
      background-color: rgba(255, 255, 255, 0.75);
      margin: 0 30px;
      width: calc(100% - (30px * 2));
      border-radius: 10px;
      text-align: center;
      transition: left 0.4s, background-color 0.25s;
      box-shadow: 10px 10px 10px #00000099;
      backdrop-filter: blur(5px);
      z-index: 10;
    }

    html.dark-theme .nav-menu {
      background-color: #212121bf;
    }

    .nav-menu.active {
      left: 0;
    }

    .hamburger {
      display: block;
      cursor: pointer;
      margin-right: 10px;
    }

    .hamburger.active .bar:nth-child(2) {
      opacity: 0;
    }

    .hamburger.active .bar:nth-child(1) {
      transform: translateY(8px) rotate(45deg);
    }

    .hamburger.active .bar:nth-child(3) {
      transform: translateY(-8px) rotate(-45deg);
    }

    .nav-item a {
      font-size: 36px;
      margin: 10px 0;
    }
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
  }

  ::-webkit-scrollbar-corner {
    background-color: transparent;
  }

  html:not(.dark-theme) ::-webkit-scrollbar-thumb {
    background-color: #18222c;
  }

  html.dark-theme ::-webkit-scrollbar-thumb {
    background-color: #c2c2c2;
  }

  button {
    padding: 10px;
    border-radius: 10px;
    font-size: 18px;
    margin: 5px 0;
    font-family: 'Montserrat', 'Franklin Gothic Medium', 'Arial Narrow', Arial,
      sans-serif;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #aaaaaa;
    background-color: #f3f3f3;
    transition: border 0.25s, background-color 0.25s, color 0.25s;
    user-select: none;
  }

  button:disabled {
    cursor: not-allowed;
    border: 1px solid #aaaaaa;
    background-color: #b8b8b8;
  }

  .quick-action-buttons-container {
    display: flex;
    justify-content: space-around;
    margin: 0 auto;
    width: 40%;
    flex-wrap: wrap;
  }

  button:hover:not(:disabled) {
    background-color: #bebebe;
  }

  html.dark-theme button {
    background-color: #272727;
    color: white;
    border: 1px solid #000000;
  }

  html.dark-theme button:disabled {
    background-color: #141414;
    color: #8e8e8e;
  }

  html.dark-theme button:hover:not(:disabled) {
    background-color: #202020;
  }

  button:focus {
    outline: none;
  }

  input {
    padding: 10px;
    border-radius: 10px;
    font-family: 'Montserrat', 'Franklin Gothic Medium', 'Arial Narrow', Arial,
      sans-serif;
    font-weight: 600;
    margin: 5px 0;
    background-color: #f3f3f3;
    transition: border 0.25s, background-color 0.25s, color 0.25s;
    border: 1px solid #9a9a9a;
    outline: none;
  }

  input:hover,
  input:focus {
    background-color: #d6d6d6;
  }

  html.dark-theme input {
    background-color: #101010;
    color: white;
  }

  html.dark-theme input:hover,
  html.dark-theme input:focus {
    background-color: #202020;
  }

  .checkbox-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .checkbox-container p.label-left {
    margin: 0 10px 0 0;
  }

  .checkbox-container p.label-right {
    margin: 0 0 0 10px;
  }

  input[type='checkbox'] {
    display: none;
  }

  input[type='checkbox'] + label {
    font-size: 1rem;
    display: flex;
    width: 4em;
    border-radius: 2em;
    background-color: #000000;
    transition: 0.2s;
    border: 0.125em solid #292929;
    overflow: hidden;
  }

  html.dark-theme input[type='checkbox'] + label {
    border: 0.125em solid #eef3f6;
  }

  input[type='checkbox'] + label span {
    background: #fffad8;
    border-radius: 50%;
    height: 2em;
    width: 2em;
    transform: translateX(0) scale(0.65);
    transition: 0.2s;
    cursor: pointer;
    margin-top: 0;
  }

  input[type='checkbox']:checked {
    font-size: 10rem;
  }

  input[type='checkbox']:checked + label {
    border-color: #292929;
    background-color: #009fbb;
  }

  html.dark-theme input[type='checkbox']:checked + label {
    border-color: #eef3f6;
  }

  input[type='checkbox']:checked + label span {
    transform: translateX(calc(100%)) scale(0.65);
  }
</style>
