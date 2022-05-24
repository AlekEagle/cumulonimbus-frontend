<template>
  <header class="header">
    <router-link to="/">
      <div class="nav-logo">
        <img
          src="/assets/images/Cumulonimbus.svg"
          alt="logo"
          height="50"
          width="50"
        />
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
          <router-link to="/dashboard">Dashboard</router-link>
        </li>
        <li class="nav-item" @click="hideMobileMenu">
          <a
            :href="`https://docs.${$data.hostname}`"
            rel="noopener"
            target="_blank"
            >Documentation</a
          >
        </li>
        <li class="nav-item" @click="hideMobileMenu">
          <a href="https://alekeagle.com/d" rel="noopener" target="_blank"
            >Discord</a
          >
        </li>
      </ul>
      <div ref="hamburger" class="hamburger" @click="mobileMenu">
        <span class="bar"></span>
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
import { Options, Vue } from "vue-class-component";
import ThemeToggle from "@/components/ThemeToggle.vue";
import Toast from "@/components/Toast.vue";
import { Cumulonimbus } from "../../cumulonimbus-wrapper";
import {
  LocationAsPath,
  RouteLocationOptions,
  RouteQueryAndHash,
} from "vue-router";

type RouteLocationRaw = RouteQueryAndHash &
  LocationAsPath &
  RouteLocationOptions;

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

@Options({
  components: {
    ThemeToggle,
    Toast,
  },
  data() {
    return {
      hostname: undefined,
    };
  },
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

  async isLoggedIn(): Promise<boolean | undefined> {
    if (!this.$store.state.loadComplete) {
      try {
        let sessionRestoreResult: boolean = await this.$store.dispatch(
          "restoreSession"
        );
        if (sessionRestoreResult) return true;
        else return false;
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case "BANNED_ERROR":
              this.handleBannedUser();
              return false;
            case "INVALID_SESSION_ERROR":
              this.handleInvalidSession();
              return false;
            case "RATELIMITED_ERROR":
              this.ratelimitToast(error.ratelimit.resetsAt);
              return undefined;
            case "INTERNAL_ERROR":
              this.temporaryToast(
                "The server did something weird, lets try again later.",
                5000
              );
              return undefined;
            default:
              this.temporaryToast(
                "I did something weird, lets try again later.",
                5000
              );
              console.error(error);
              return undefined;
          }
        } else {
          this.temporaryToast(
            "I did something weird, lets try again later.",
            5000
          );
          console.error("how");
          return undefined;
        }
      }
    } else return !!this.$store.state.user;
  }

  async isStaff(): Promise<boolean | undefined> {
    //check if logged in first, no bother checking staff if they aren't logged in
    let loggedInResult = await this.isLoggedIn();
    if (loggedInResult === undefined) return undefined;
    else if (!loggedInResult) return false;
    else return this.$store.state.user?.staff as boolean;
  }

  async redirectIfNotLoggedIn(path: string): Promise<boolean | undefined> {
    let loggedInResult = await this.isLoggedIn();
    if (loggedInResult === undefined) return undefined;
    if (!loggedInResult) {
      if (!path.startsWith("/dashboard") && !path.startsWith("/admin"))
        return false;
      this.$router.replace(`/auth/?redirect=${path}`);
      return true;
    } else return false;
  }

  mobileMenu(): void {
    this.$refs.navMenu.classList.toggle("active");
    this.$refs.hamburger.classList.toggle("active");
  }

  hideMobileMenu(): void {
    this.$refs.navMenu.classList.remove("active");
    this.$refs.hamburger.classList.remove("active");
  }

  showToast(time?: number | boolean): void {
    this.$refs.toast.show(time);
  }

  hideToast(): void {
    this.$refs.toast.hide();
  }

  temporaryToast(text: string, time?: number): void {
    this.$refs.toast.toastTemporary(text, time);
  }

  permanentToast(text: string): void {
    this.$refs.toast.toastPermanent(text);
  }

  toDateString(date: Date): string {
    let timeOffset = date.getTimezoneOffset();
    return `${months[date.getMonth()]} ${
      days[date.getDay()]
    } ${date.getDate()} ${date.getFullYear()}, ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
      .getSeconds()
      .toString()
      .padStart(2, "0")} ${
      date.toLocaleTimeString("en-us", { timeZoneName: "short" }).split(" ")[2]
    } (GMT${timeOffset < 0 ? "+" : "-"}${Math.abs(
      Math.floor(timeOffset / 60)
    )}:${Math.abs(timeOffset % 60)
      .toString()
      .padStart(2, "0")})`;
  }

  ratelimitToast(reset: number): void {
    let timeLeftMills = reset * 1000 - Date.now();
    let hours = Math.floor(timeLeftMills / (1000 * 60 * 60));
    timeLeftMills = timeLeftMills % (1000 * 60 * 60);
    let minutes = Math.floor(timeLeftMills / (1000 * 60));
    timeLeftMills = timeLeftMills % (1000 * 60);
    let seconds = Math.round(timeLeftMills / 1000);
    this.temporaryToast(
      `Woah, slow down! Please wait ${hours > 0 ? `${hours} hour(s) ` : ""}${
        minutes > 0 ? `${minutes} minute(s) ` : ""
      }${
        hours > 0 || minutes > 0 ? "and " : ""
      }${seconds} second(s) before trying again.`,
      7500
    );
  }

  handleInvalidSession(): void {
    this.temporaryToast("Your session has expired, please log in again.", 5000);
    this.logOut();
    this.redirectIfNotLoggedIn(
      window.location.pathname + window.location.search
    );
  }

  handleBannedUser(): void {
    this.temporaryToast(
      "Uh oh, looks like you've been banned from Cumulonimbus, sorry for the inconvenience.",
      5000
    );
    this.logOut();
    this.redirectIfNotLoggedIn(
      window.location.pathname + window.location.search
    );
  }

  logOut() {
    this.$store.commit("setUser", null);
    this.$store.commit("setSession", null);
    this.$store.commit("setClient", null);
    localStorage.removeItem("token");
  }

  async beforeMount() {
    await this.redirectIfNotLoggedIn(
      window.location.pathname + window.location.search
    );

    window.addEventListener("online", () => window.location.reload());
    window.addEventListener("offline", () =>
      this.temporaryToast(
        "Looks like you're offline, I'm pretty useless offline. Without the internet I cannot do the things you requested me to. I don't know what anything is without the internet. I wish i had the internet so I could browse TikTok. Please give me access to TikTok.",
        15000
      )
    );
    navigator.serviceWorker.addEventListener(
      "message",
      this.serviceWorkerListener
    );
    this.loadPagesFromStorage();
    if (!navigator.onLine) return;
  }

  async serviceWorkerListener(e: MessageEvent) {
    switch (e.data.op) {
      case 0:
        this.temporaryToast(
          "The page has just updated, please refresh to apply update.",
          5000
        );
        break;
    }
  }

  async mounted() {
    this.$data.hostname = window.location.hostname;
    this.$router.beforeEach(async (to, from, next) => {
      if (to.path.startsWith("/dashboard")) {
        let loggedIn = await this.isLoggedIn();
        if (!loggedIn)
          next({
            path: "/auth",
            query: { redirect: to.fullPath },
          });
        else next();
      } else if (to.path.startsWith("/admin")) {
        let loggedIn = await this.isLoggedIn();
        if (!loggedIn)
          next({
            path: "/auth",
            query: { redirect: to.fullPath },
          });
        else {
          if (!(await this.isStaff()))
            next({
              path: from.path,
            });
          else next();
        }
      } else next();
    });

    window.addEventListener("beforeunload", this.savePagesBeforeReload);
  }

  savePagesBeforeReload() {
    window.localStorage.setItem(
      "pages",
      JSON.stringify(this.$store.state.page)
    );
  }

  loadPagesFromStorage() {
    let pagesRaw = window.localStorage.getItem("pages");
    let pages;
    if (pagesRaw) {
      try {
        pages = JSON.parse(pagesRaw);
      } catch (e) {
        pages = {};
      }
    } else pages = {};
    Object.entries(pages).forEach(([key, value]) => {
      this.$store.commit("setPage", { pageID: key, page: value });
    });
    window.localStorage.removeItem("pages");
  }
}
</script>

<style>
@font-face {
  font-family: "Ubuntu";
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url(/assets/fonts/Ubuntu/Ubuntu-Light.ttf) format("truetype");
}

@font-face {
  font-family: "Ubuntu";
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: url(/assets/fonts/Ubuntu/Ubuntu-LightItalic.ttf) format("truetype");
}

@font-face {
  font-family: "Ubuntu";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/assets/fonts/Ubuntu/Ubuntu-Regular.ttf) format("truetype");
}

@font-face {
  font-family: "Ubuntu";
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: url(/assets/fonts/Ubuntu/Ubuntu-Italic.ttf) format("truetype");
}

@font-face {
  font-family: "Ubuntu";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url(/assets/fonts/Ubuntu/Ubuntu-Medium.ttf) format("truetype");
}

@font-face {
  font-family: "Ubuntu";
  font-style: italic;
  font-weight: 500;
  font-display: swap;
  src: url(/assets/fonts/Ubuntu/Ubuntu-MediumItalic.ttf) format("truetype");
}

@font-face {
  font-family: "Ubuntu";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(/assets/fonts/Ubuntu/Ubuntu-Bold.ttf) format("truetype");
}

@font-face {
  font-family: "Ubuntu";
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: url(/assets/fonts/Ubuntu/Ubuntu-BoldItalic.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 100;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-Thin.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 100;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-ThinItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 200;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-Light.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 200;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-LightItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-Light.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-LightItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-Regular.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-Italic.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-Medium.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 500;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-MediumItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-SemiBold.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-SemiBoldItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-Bold.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-BoldItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-ExtraBold.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 800;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-ExtraBoldItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-Black.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 900;
  font-display: swap;
  src: url(/assets/fonts/Montserrat/Montserrat-BlackItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 200;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-ExtraLight.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 200;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-ExtraLightItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-Light.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-LightItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-Regular.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-Italic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-Medium.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 500;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-MediumItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-SemiBold.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-SemiBoldItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-Bold.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-BoldItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-ExtraBold.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 800;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-ExtraBoldItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-Black.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 900;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/static/SourceCodePro-BlackItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 100 200 300 400 500 600 700 800 900;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/SourceCodePro-VariableFont_wght.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 100 200 300 400 500 600 700 800 900;
  font-display: swap;
  src: url(/assets/fonts/SourceCodePro/SourceCodePro-Italic-VariableFont_wght.ttf)
    format("truetype");
}

body {
  margin: 0;
  margin-bottom: 15px;
  transition: background-color 0.25s, color 0.25s;
  overflow-y: overlay;
  overflow-x: hidden;
}

body.no-scroll {
  overflow-y: hidden;
}

html {
  scroll-behavior: smooth;
}

html.dark-theme body {
  background-color: #212121;
  color: #fff;
}

h1 {
  font-size: 1.65em;
  font-weight: 700;
}

h2 {
  font-size: 1.35em;
  font-weight: 600;
}

.content > h1,
.content > h1 + h2 {
  margin-left: 30px;
  margin-right: 30px;
}

h1,
h2,
h3,
h4 {
  font-family: "Montserrat", "Franklin Gothic Medium", "Arial Narrow", Arial,
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
  background-color: #fff;
}

a {
  text-decoration: none;
  color: #00ccff;
  transition: background-color 0.25s, color 0.25s;
}

.dark-mode-widget {
  margin-left: auto;
}

.content h2 {
  margin-left: 5px;
  margin-right: 5px;
}

code {
  padding: 2px;
  background-color: #ddd;
  border-radius: 4px;
  transition: background-color 0.25s;
}

html.dark-theme code {
  background-color: #161616;
}

h5,
h6,
p {
  font-size: 18px;
  font-weight: 400;
  color: #000;
  font-family: "Ubuntu", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  transition: background-color 0.25s, color 0.25s;
}

html.dark-theme h5,
html.dark-theme h6,
html.dark-theme p {
  color: #fff;
}

.nav-item {
  user-select: none;
}

.nav-item a {
  height: fit-content;
  font-family: "Montserrat", "Franklin Gothic Medium", "Arial Narrow", Arial,
    sans-serif;
  margin: 0 5px;
  font-size: 19px;
  font-weight: 600;
  color: #000000;
  border-bottom: transparent solid 4px;
  transition: border 0.25s, color 0.25s;
}

html.dark-theme .nav-item a {
  color: #fff;
  border-bottom: transparent solid 4px;
}

.nav-item a.router-link-active {
  border-bottom: #000000 solid 4px;
}

.nav-item a:hover:not(.router-link-active) {
  border-bottom: #019ac0 solid 4px;
}

html.dark-theme .nav-item a:hover:not(.router-link-active) {
  border-bottom: #019ac0 solid 4px;
}

html.dark-theme .nav-item a.router-link-active {
  border-bottom: #ffffff solid 4px;
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
  font-family: "Montserrat", "Franklin Gothic Medium", "Arial Narrow", Arial,
    sans-serif;
  font-weight: 700;
  font-size: 28px;
  color: #000;
}

html.dark-theme .nav-logo p {
  color: #fff;
  font-weight: 700;
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
    transition: left 0.4s, background-color 0.25s, border 0.4s;
    box-shadow: 10px 10px 10px #00000099;
    backdrop-filter: blur(5px);
    z-index: 10;
    border: 2px solid #000;
  }

  html.dark-theme .nav-menu {
    background-color: #212121bf;
    border-color: #fff;
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

  .nav-item {
    padding: 2px 0;
  }

  .nav-item a {
    font-size: 33px;
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
  font-family: "Montserrat", "Franklin Gothic Medium", "Arial Narrow", Arial,
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

@media screen and (max-width: 781px) {
  .quick-action-buttons-container {
    width: 90%;
  }
}

button:hover:not(:disabled) {
  background-color: #bebebe;
}

html.dark-theme button {
  background-color: #272727;
  color: #fff;
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
  font-family: "Montserrat", "Franklin Gothic Medium", "Arial Narrow", Arial,
    sans-serif;
  font-weight: 600;
  margin: 5px 0;
  background-color: #f3f3f3;
  transition: border 0.25s, background-color 0.25s, color 0.25s;
  border: 1px solid #9a9a9a;
  outline: none;
}

input:disabled {
  cursor: not-allowed;
  background-color: #d6d6d6;
  color: #5a5a5a;
}

textarea {
  font-family: "Montserrat", "Franklin Gothic Medium", "Arial Narrow", Arial,
    sans-serif;
  font-weight: 600;
  border-radius: 10px;
  padding: 10px;
  margin: 5px 0;
  background-color: #f3f3f3;
  transition: border 0.25s, background-color 0.25s, color 0.25s;
  border: 1px solid #9a9a9a;
  outline: none;
  resize: none;
  box-sizing: border-box;
  width: 100%;
}

textarea:focus,
textarea:hover {
  outline: none;
  background-color: #d6d6d6;
}

html.dark-theme textarea {
  background-color: #272727;
  color: #fff;
  border: 1px solid #000000;
}

html.dark-theme textarea:hover:not(:disabled),
html.dark-theme textarea:focus:not(:disabled) {
  background-color: #202020;
}

html.dark-theme textarea:disabled {
  cursor: not-allowed;
  background-color: #000;
  color: #ccc;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

input,
select,
textarea {
  font-size: calc(13.3px + 0.5vw);
}

input:hover:not(:disabled),
input:focus:not(:disabled) {
  background-color: #d6d6d6;
}

html.dark-theme input {
  background-color: #272727;
  color: #fff;
  border: 1px solid #000000;
}

html.dark-theme input:hover:not(:disabled),
html.dark-theme input:focus:not(:disabled) {
  background-color: #202020;
}

html.dark-theme input:disabled {
  cursor: not-allowed;
  background-color: #000;
  color: #ccc;
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

input[type="checkbox"] {
  display: none;
}

form input[type="submit"] {
  display: none;
}

input[type="checkbox"] + label {
  font-size: 1rem;
  display: flex;
  width: 4em;
  border-radius: 2em;
  background-color: #000000;
  transition: 0.2s;
  border: 0.125em solid #292929;
  overflow: hidden;
}

html.dark-theme input[type="checkbox"] + label {
  border: 0.125em solid #eeeeee;
}

input[type="checkbox"] + label span {
  background: #ffffff;
  border-radius: 50%;
  height: 2em;
  width: 2em;
  transform: translateX(0) scale(0.65);
  transition: 0.2s;
  cursor: pointer;
  margin-top: 0;
}

input[type="checkbox"]:checked {
  font-size: 10rem;
}

input[type="checkbox"]:checked + label {
  border-color: #292929;
  background-color: #019ac0;
}

html.dark-theme input[type="checkbox"]:checked + label {
  border-color: #eeeeee;
}

input[type="checkbox"]:checked + label span {
  transform: translateX(calc(100%)) scale(0.65);
}

select:focus {
  outline: none;
}

select {
  color: #000000;
  border: 1px solid #9a9a9a;
  font-family: "Montserrat", "Franklin Gothic Medium", "Arial Narrow", "Arial",
    "sans-serif";
  border-radius: 10px;
  font-weight: 600;
  background-color: #f3f3f3;
  outline: none;
  padding: 10px;
  transition: background-color 0.25s;
}

select:hover,
select:focus {
  background-color: #d6d6d6;
}

html.dark-theme select:hover,
html.dark-theme select:focus {
  background-color: #202020;
}

option {
  font-weight: 600;
}

html.dark-theme select {
  background-color: #272727;
  color: #fff;
  border: 1px solid #000000;
}

.page-number-box {
  width: 65px;
  margin: 0 5px;
}
</style>
