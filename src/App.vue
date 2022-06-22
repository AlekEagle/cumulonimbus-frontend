<template>
  <header>
    <RouterLink to="/">
      <div class="logo">
        <img src="@/assets/images/Cumulonimbus.svg" alt="Cumulonimbus Logo" />
        <p>Cumulonimbus</p>
      </div>
    </RouterLink>
    <nav :class="mobileMenu ? 'active' : ''">
      <ul @click.self="mobileMenu = false">
        <li>
          <ThemeManager />
        </li>
        <li
          v-for="(item, index) in menuItems"
          @click="mobileMenu = false"
          :key="index"
        >
          <RouterLink
            v-if="!item.external"
            :to="item.path"
            v-text="item.name"
          />
          <a
            v-else
            :href="item.path"
            v-text="item.name"
            rel="noopener"
            target="_blank"
          />
        </li>
      </ul>
      <div @click="mobileMenu = !mobileMenu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>
    </nav>
  </header>

  <main class="content">
    <RouterView />
  </main>
  <transition name="toast">
    <div class="toast-box" v-text="toast.text" v-if="toast.visible" />
  </transition>
</template>

<script lang="ts" setup>
import ThemeManager from "@/components/ThemeManager.vue";
import { userStore } from "./stores/user";
import { ref, onMounted } from "vue";
import { toastStore } from "./stores/toast";
import { useRouter, useRoute } from "vue-router";

const user = userStore();
const toast = toastStore();
const router = useRouter();
const route = useRoute();
const host = window.location.host;
const menuItems = [
  {
    name: "Home",
    path: "/",
    external: false,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    external: false,
  },
  {
    name: "Documentation",
    path: `https://docs.${host}/`,
    external: true,
  },
  {
    name: "Discord",
    path: "https://alekeagle.com/d",
    external: true,
  },
];
const mobileMenu = ref(false);

// use the beforeEach hook on the router to check if the user is logged in when navigating to a route that requires authentication
router.beforeEach(async (to, from, next) => {
  // is the route the user is trying to navigate to the soft 404 page?
  if (to.name === "404") {
    // don't do anything
    next();
  }
  // is the route the user is trying to navigate to the auth page?
  else if (to.name === "auth") {
    // check if the user is already logged in
    if (user.loggedIn) {
      // if so, redirect to wherever the redirect query param is set to or to the dashboard
      next(
        route.query.redirect ? (route.query.redirect as string) : "/dashboard"
      );
    } else {
      // if not, continue to the auth page
      next();
    }
  }

  // is the route the user is trying to navigate to a route that requires authentication?
  else if (to.meta.requiresAuth) {
    // check if the user is logged in
    if (user.loggedIn) {
      // if so, check if the route the user is trying to navigate to is a route that requires staff privileges
      if (to.meta.requiresStaff) {
        // if so, check if the user is staff
        if (user.user.staff) {
          // if so, continue to the route
          next();
        } else {
          // if not, redirect to the home page
          next("/");
        }
      } else {
        // if not, continue to the route
        next();
      }
    } else {
      // if not, redirect to the auth page with the redirect query param set to the current route
      next({
        name: "auth",
        hash: "#login",
        query: {
          redirect: to.fullPath,
        },
      });
    }
  } else {
    // if not, continue to the route
    next();
  }
});

onMounted(() => {
  // check if the user is on the soft 404 page
  if (route.name === "404") {
    // if so, do nothing
    return;
  }
  // check if the user is on the auth page
  if (route.name === "auth") {
    // if so, check if the user is already logged in
    if (user.loggedIn) {
      // if so, redirect to wherever the redirect query param is set to or to the dashboard
      router.replace(
        route.query.redirect ? (route.query.redirect as string) : "/dashboard"
      );
    } else {
      // if not, continue to the auth page
      return;
    }
  }

  // check if the user is on a route that requires authentication
  if (route.meta.requiresAuth) {
    // check if the user is logged in
    if (user.loggedIn) {
      // if so, check if the route the user is trying to navigate to is a route that requires staff privileges
      if (route.meta.requiresStaff) {
        // if so, check if the user is staff
        if (user.user.staff) {
          // if so, continue to the route
          return;
        } else {
          // if not, redirect to the home page
          router.replace("/");
        }
      } else {
        // if not, continue to the route
        return;
      }
    } else {
      // if not, redirect to the auth page with the redirect query param set to the current route
      router.replace({
        name: "auth",
        hash: "#login",
        query: {
          redirect: route.fullPath,
        },
      });
    }
  } else {
    // if not, continue to the route
    return;
  }
});

user.restoreClient();
</script>

<style>
@font-face {
  font-family: "Ubuntu";
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url(@/assets/fonts/Ubuntu/Ubuntu-Light.ttf) format("truetype");
}

@font-face {
  font-family: "Ubuntu";
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: url(@/assets/fonts/Ubuntu/Ubuntu-LightItalic.ttf) format("truetype");
}

@font-face {
  font-family: "Ubuntu";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(@/assets/fonts/Ubuntu/Ubuntu-Regular.ttf) format("truetype");
}

@font-face {
  font-family: "Ubuntu";
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: url(@/assets/fonts/Ubuntu/Ubuntu-Italic.ttf) format("truetype");
}

@font-face {
  font-family: "Ubuntu";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url(@/assets/fonts/Ubuntu/Ubuntu-Medium.ttf) format("truetype");
}

@font-face {
  font-family: "Ubuntu";
  font-style: italic;
  font-weight: 500;
  font-display: swap;
  src: url(@/assets/fonts/Ubuntu/Ubuntu-MediumItalic.ttf) format("truetype");
}

@font-face {
  font-family: "Ubuntu";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(@/assets/fonts/Ubuntu/Ubuntu-Bold.ttf) format("truetype");
}

@font-face {
  font-family: "Ubuntu";
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: url(@/assets/fonts/Ubuntu/Ubuntu-BoldItalic.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 100;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-Thin.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 100;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-ThinItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 200;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-Light.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 200;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-LightItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-Light.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-LightItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-Regular.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-Italic.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-Medium.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 500;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-MediumItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-SemiBold.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-SemiBoldItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-Bold.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-BoldItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-ExtraBold.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 800;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-ExtraBoldItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-Black.ttf) format("truetype");
}

@font-face {
  font-family: "Montserrat";
  font-style: italic;
  font-weight: 900;
  font-display: swap;
  src: url(@/assets/fonts/Montserrat/Montserrat-BlackItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 200;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-ExtraLight.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 200;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-ExtraLightItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-Light.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-LightItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-Regular.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-Italic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-Medium.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 500;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-MediumItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-SemiBold.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-SemiBoldItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-Bold.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-BoldItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-ExtraBold.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 800;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-ExtraBoldItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-Black.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 900;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/static/SourceCodePro-BlackItalic.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 100 200 300 400 500 600 700 800 900;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/SourceCodePro-VariableFont_wght.ttf)
    format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: italic;
  font-weight: 100 200 300 400 500 600 700 800 900;
  font-display: swap;
  src: url(@/assets/fonts/SourceCodePro/SourceCodePro-Italic-VariableFont_wght.ttf)
    format("truetype");
}

html {
  --background: #fff;
  --foreground: #000;
  --link-color: #00ccff;
  --logo-shadow: #818181;
  --code-background: #ddd;
  --ui-background: #f3f3f3;
  --ui-foreground: #000;
  --ui-border: #aaaaaa;
  --ui-background-hover: #c0c0c0;
  --ui-foreground-hover: #000;
  --ui-border-hover: #8c8c8c;
  --ui-background-disabled: #b8b8b8;
  --ui-foreground-disabled: #000;
  --ui-border-disabled: #9e9e9e;
}

html.dark-theme {
  --background: #212121;
  --foreground: #fff;
  --logo-shadow: #000;
  --code-background: #161616;
  --ui-background: #272727;
  --ui-foreground: #fff;
  --ui-border: #424242;
  --ui-background-hover: #3c3c3c;
  --ui-foreground-hover: #fff;
  --ui-border-hover: #616161;
  --ui-background-disabled: #3c3c3c;
  --ui-foreground-disabled: #d2d2d2;
  --ui-border-disabled: #616161;
}

body {
  margin: 0;
  transition: background-color 0.25s, color 0.25s;
  overflow-y: overlay;
  overflow-x: hidden;
  background-color: var(--background);
  color: var(--foreground);
}

body.no-scroll {
  overflow-y: hidden;
}

html {
  scroll-behavior: smooth;
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

header {
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

header nav ul + div {
  display: none;
}

header nav ul {
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
  background-color: var(--foreground);
}

a {
  text-decoration: none;
  color: var(--link-color);
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
  background-color: var(--code-background);
  border-radius: 4px;
  transition: background-color 0.25s;
}

html.dark-theme code {
  background-color: var(--code-background);
}

h5,
h6,
p {
  font-size: 18px;
  font-weight: 400;
  color: var(--foreground);
  font-family: "Ubuntu", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  transition: background-color 0.25s, color 0.25s;
}

header nav ul li {
  user-select: none;
}

header nav ul li a {
  height: fit-content;
  font-family: "Montserrat", "Franklin Gothic Medium", "Arial Narrow", Arial,
    sans-serif;
  margin: 0 5px;
  font-size: 19px;
  font-weight: 600;
  color: var(--foreground);
  border-bottom: transparent solid 4px;
  transition: border 0.25s, color 0.25s;
}

header nav ul li a.router-link-active {
  border-bottom: var(--foreground) solid 4px;
}

header nav ul li a:hover:not(.router-link-active) {
  border-bottom: var(--link-color) solid 4px;
}

header a div.logo {
  display: flex;
  align-items: center;
  user-select: none;
}

header a div.logo p {
  height: fit-content;
  margin: 0 0 0 10px;
  padding: 0;
  font-family: "Montserrat", "Franklin Gothic Medium", "Arial Narrow", Arial,
    sans-serif;
  font-weight: 700;
  font-size: 28px;
  color: var(--foreground);
}

header a div.logo img {
  height: 50px;
  border-radius: 50%;
  box-shadow: 4px 4px 4px var(--logo-shadow);
  transition: box-shadow 0.25s;
}

.content {
  text-align: center;
}

@media only screen and (max-width: 840px) {
  header nav ul {
    padding: 10px 0;
    position: fixed;
    justify-content: center;
    left: -100%;
    top: 0;
    flex-direction: column;
    margin: 0;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    text-align: center;
    transition: left 0.4s;
    backdrop-filter: blur(5px);
    z-index: 10;
  }

  header nav ul:before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 10px;
    z-index: -1;
    background-color: var(--background);
    opacity: 0.6;
    transition: background-color 0.25s;
  }

  header nav.active ul {
    left: 0;
  }

  header nav ul + div {
    display: block;
    cursor: pointer;
    margin-right: 10px;
    position: relative;
    z-index: 10;
  }

  header nav.active .bar:nth-child(2) {
    opacity: 0;
  }

  header nav.active .bar:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }

  header nav.active .bar:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }

  header nav ul li {
    padding: 2px 0;
  }

  header nav ul li a {
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

::-webkit-scrollbar-thumb {
  background-color: var(--foreground);
}

button {
  padding: 10px;
  border-radius: 10px;
  font-size: calc(13.3px + 0.5vw);
  margin: 5px 0;
  font-family: "Montserrat", "Franklin Gothic Medium", "Arial Narrow", Arial,
    sans-serif;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--ui-border);
  background-color: var(--ui-background);
  color: var(--ui-foreground);
  transition: border 0.25s, background-color 0.25s, color 0.25s;
  user-select: none;
}

button:hover:not(:disabled) {
  border: 1px solid var(--ui-border-hover);
  background-color: var(--ui-background-hover);
  color: var(--ui-foreground-hover);
}

button:disabled {
  cursor: not-allowed;
  border: 1px solid var(--ui-border-disabled);
  background-color: var(--ui-background-disabled);
  color: var(--ui-foreground-disabled);
}

button:focus {
  outline: none;
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

input {
  padding: 10px;
  border-radius: 10px;
  font-family: "Montserrat", "Franklin Gothic Medium", "Arial Narrow", Arial,
    sans-serif;
  font-weight: 600;
  margin: 5px 0;
  transition: border 0.25s, background-color 0.25s, color 0.25s;
  outline: none;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

textarea {
  font-family: "Montserrat", "Franklin Gothic Medium", "Arial Narrow", Arial,
    sans-serif;
  font-weight: 600;
  border-radius: 10px;
  padding: 10px;
  margin: 5px 0;
  outline: none;
  resize: none;
  box-sizing: border-box;
  width: 100%;
}

input,
textarea,
select {
  border: 1px solid var(--ui-border);
  background-color: var(--ui-background);
  color: var(--ui-foreground);
  font-size: calc(13.3px + 0.5vw);
  transition: border 0.25s, background-color 0.25s, color 0.25s;
}

input:disabled,
textarea:disabled,
select:disabled {
  cursor: not-allowed;
  border: 1px solid var(--ui-border-disabled);
  background-color: var(--ui-background-disabled);
  color: var(--ui-foreground-disabled);
}

input:hover:not(:disabled),
input:focus:not(:disabled),
textarea:hover:not(:disabled),
textarea:focus:not(:disabled),
select:hover:not(:disabled),
select:focus:not(:disabled) {
  border: 1px solid var(--ui-border-hover);
  background-color: var(--ui-background-hover);
  color: var(--ui-foreground-hover);
  outline: none;
}

form input[type="submit"] {
  display: none;
}

select {
  font-family: "Montserrat", "Franklin Gothic Medium", "Arial Narrow", "Arial",
    "sans-serif";
  border-radius: 10px;
  font-weight: 600;
  outline: none;
  padding: 10px;
  transition: border 0.25s, background-color 0.25s, color 0.25s;
}

option {
  font-weight: 600;
}

.page-number-box {
  width: 65px;
  margin: 0 5px;
}

.toast-box {
  position: fixed;
  right: 35px;
  bottom: 35px;
  padding: 10px 15px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  background-color: var(--ui-background);
  color: var(--ui-foreground);
  font-size: calc(13.3px + 0.5vw);
  font-family: "Ubuntu", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  transition: background-color 0.25s, color 0.25s;
  overflow-y: hidden;
  margin-left: 35px;
  z-index: 100;
}

.toast-enter-active,
.toast-leave-active {
  transition: bottom 0.5s, opacity 0.5s;
}

.toast-enter-from,
.toast-leave-to {
  bottom: -50px;
  opacity: 0;
}

.toast-enter-to,
.toast-leave-from {
  bottom: 35px;
}
</style>
