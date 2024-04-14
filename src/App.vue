<template>
  <header>
    <RouterLink to="/">
      <div class="logo">
        <img
          src="@/assets/images/Cumulonimbus.svg"
          alt="Cumulonimbus Logo"
          height="50"
          width="50"
        />
        <p>Cumulonimbus</p>
      </div>
    </RouterLink>
    <nav :class="{ active: hamburgerMenu }">
      <div
        @click="hamburgerMenu = !hamburgerMenu"
        @keydown="navMenuKeydown"
        tabindex="0"
      >
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>
      <ul @click.self="hamburgerMenu = false">
        <li>
          <ThemeManager :no-tab-index="hamburgerMenu" />
        </li>
        <li
          v-for="(item, index) in menuItems"
          @click="hamburgerMenu = false"
          :key="index"
        >
          <RouterLink v-if="!item.external" :to="item.path" custom>
            <template #default="{ navigate, href, isExactActive }">
              <a
                :class="isExactActive ? 'router-link-active' : ''"
                :href="href"
                @click="navigate"
                :tabindex="hamburgerMenu ? '0' : '-1'"
                v-text="item.name"
              />
            </template>
          </RouterLink>
          <a
            v-else
            :href="item.path"
            rel="noopener"
            target="_blank"
            :tabindex="hamburgerMenu ? '0' : '-1'"
          >
            {{ item.name }}
            <img
              :src="newTabIcon"
              alt="Icon indicating this link will open a new tab"
              height="24"
              width="24"
            />
          </a>
        </li>
      </ul>
    </nav>
  </header>

  <!-- The main element that contains the real deal content -->
  <main class="content">
    <!-- The real deal content -->
    <RouterView />
    <!-- The end of the real deal content -->
  </main>
  <!-- The end of the main element that contains the real deal content -->

  <Modal ref="ptbWarningModal" title="Warning">
    <template #default>
      This is the preview of frontend of Cumulonimbus, it may be unstable and
      will be revised in the future.
      <br />
      <br />
      If you are aware of the risks of using this preview, please click the
      button below to continue. Otherwise, you can click the other button to be
      taken to the stable version. If you don't know what this means, please go
      to the stable version. You will not see this message again if you
      continue.
    </template>

    <template #footer>
      <button @click="acceptPtbWarning">Continue</button>
      <button @click="gotoStable">Go to stable version</button>
    </template>
  </Modal>

  <SecondFactorModal />

  <Transition name="toast">
    <div class="toast-box" v-text="toast.text" v-if="toast.visible" />
  </Transition>
</template>

<script lang="ts" setup>
  // Vue Components
  import ThemeManager from '@/components/ThemeManager.vue';
  import Modal from '@/components/Modal.vue';
  import SecondFactorModal from '@/components/SecondFactorModal.vue';

  // In-House Modules
  import newTabIcon from '@/assets/images/newtab.svg';
  import { enableScrolling, disableScrolling } from '@/utils/scrollHandler';

  // Store Modules
  import { userStore } from '@/stores/user';
  import { toastStore } from '@/stores/toast';
  import { ptbStore } from '@/stores/ptb';

  // External Modules
  import { ref, onMounted, watch, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useOnline } from '@vueuse/core';

  const user = userStore(),
    toast = toastStore(),
    router = useRouter(),
    route = useRoute(),
    online = useOnline(),
    ptb = ptbStore(),
    host = window.location.host,
    menuItems = computed(() => {
      const currentLoc = route.fullPath;
      return [
        ...(user.account
          ? [
              {
                name: 'Dashboard',
                path: {
                  name: 'user-space-dashboard',
                },
                external: false,
              },
              {
                name: 'Switch Accounts',
                path: {
                  name: 'account-switcher',
                  query: {
                    redirect: currentLoc,
                  },
                },
                external: false,
              },
            ]
          : [
              {
                name: 'Login',
                path: {
                  name: 'account-switcher',
                  query: {
                    redirect: '/dashboard',
                  },
                },
                external: false,
              },
            ]),
        {
          name: 'About',
          path: '/about',
          external: false,
        },
        {
          name: 'Terms of Service',
          path: '/tos',
          external: false,
        },
        {
          name: 'Privacy Policy',
          path: '/privacy',
          external: false,
        },
        {
          name: 'Documentation',
          path: `https://docs.${host}/`,
          external: true,
        },
        {
          name: 'GitHub',
          path: 'https://github.com/AlekEagle/cumulonimbus-frontend',
          external: true,
        },
      ].filter((a) => typeof a !== 'undefined') as Array<{
        name: string;
        path: string;
        external: boolean;
      }>;
    }),
    hamburgerMenu = ref(false),
    ptbWarningModal = ref<InstanceType<typeof Modal>>();

  watch(hamburgerMenu, (val) => {
    if (val) {
      disableScrolling();
    } else {
      enableScrolling();
    }
  });

  watch(online, (val) => {
    if (!val) {
      toast.connectivityChangeOffline();
    } else {
      toast.connectivityChangeOnline();
    }
  });

  // use the beforeEach hook on the router to check if the user is logged in when navigating to a route that requires authentication
  router.beforeEach(async (to, from, next) => {
    // is the route the user is trying to navigate to the soft 404 page?
    if (to.name === '404') {
      // don't do anything
      next();
    }

    // is the route the user is trying to navigate to a route that requires authentication?
    else if (to.meta.requiresAuth) {
      // check if the user is logged in
      if (user.loggedIn) {
        // if so, check if the route the user is trying to navigate to is a route that requires staff privileges
        if (to.meta.requiresStaff) {
          // if so, check if the user is staff
          if (user.account!.user.staff) {
            // if so, continue to the route
            next();
          } else {
            // if not, display the insufficient permissions error and redirect to the home page
            toast.insufficientPermissions();
            next({
              path: '/',
            });
          }
        } else {
          // if not, continue to the route
          next();
        }
      } else {
        // if not, display a toast that says the user needs to login and redirect to the auth page with the redirect query param set to the current route
        toast.login();
        next({
          name: 'account-switcher',
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

  function acceptPtbWarning() {
    ptb.shownWarning = true;
    ptbWarningModal.value!.hide();
  }

  function gotoStable() {
    window.location.href = 'https://alekeagle.me';
  }

  onMounted(() => {
    if (ptb.isPtb && !ptb.shownWarning) ptbWarningModal.value!.show();
    // check if the user is on the soft 404 page
    if (route.name === '404') {
      // if so, do nothing
      return;
    }

    // check if the user is on a route that requires authentication
    if (route.meta.requiresAuth) {
      // check if the user is logged in
      if (user.loggedIn) {
        // if so, check if the route the user is trying to navigate to is a route that requires staff privileges
        if (route.meta.requiresStaff) {
          // if so, check if the user is staff
          if (user.account!.user.staff) {
            // if so, continue to the route
            return;
          } else {
            // if not, display the insufficient permissions error and redirect to the home page
            toast.insufficientPermissions();
            router.replace({
              path: '/',
            });
          }
        } else {
          // if not, continue to the route
          return;
        }
      } else {
        // if not, display a toast that says the user needs to login and redirect to the auth page with the redirect query param set to the current route
        toast.login();
        router.replace({
          name: 'account-switcher',
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

  // Register a message handler for the service worker
  navigator.serviceWorker?.addEventListener('message', (event) => {
    switch (event.data.type) {
      case 'update-complete':
        toast.updateComplete();
        break;
      case 'update-failed':
        toast.updateFailed();
        break;
    }
  });

  function navMenuKeydown(e: KeyboardEvent) {
    console.log(e);
    if (e.key === 'Enter' || e.key === ' ') {
      hamburgerMenu.value = !hamburgerMenu.value;
    }
  }

  window.addEventListener('unhandledrejection', (event) => {
    console.error(
      'An unhandled promise rejection occurred:',
      event.reason,
      '\nFull event trace:',
    );
    console.error(event);

    toast.clientError();
  });
</script>

<style>
  html {
    --background: #fff;
    --foreground: #000;
    --link-color: #0059ff;
    --logo-color-top: #7084e6;
    --logo-color-bottom: #00faff;
    --logo-shadow: #818181;
    --ui-code-background: #ddd;
    --ui-background: #f3f3f3;
    --ui-foreground: #000;
    --ui-border: #aaaaaa;
    --ui-background-hover: #c0c0c0;
    --ui-foreground-hover: #000;
    --ui-border-hover: #8c8c8c;
    --ui-background-disabled: #b8b8b8;
    --ui-foreground-disabled: #000;
    --ui-border-disabled: #9e9e9e;
    --ui-fs-overlay-background: #ffffff80;
    --font-heading: 'Montserrat', Verdana, sans-serif;
    --font-body: 'Ubuntu', 'Trebuchet MS', sans-serif;
    --font-code: 'Source Code Pro', 'Courier New', monospace;
  }

  html.dark-theme {
    --background: #212121;
    --foreground: #fff;
    --link-color: #00ccff;
    --logo-shadow: #000;
    --ui-code-background: #161616;
    --ui-background: #272727;
    --ui-foreground: #fff;
    --ui-border: #424242;
    --ui-background-hover: #3c3c3c;
    --ui-foreground-hover: #fff;
    --ui-border-hover: #616161;
    --ui-background-disabled: #161616;
    --ui-foreground-disabled: #949494;
    --ui-border-disabled: #353535;
    --ui-fs-overlay-background: #00000080;
  }

  body {
    margin: 0;
    transition: background-color 0.25s, color 0.25s;
    overflow-y: scroll;
    overflow-x: hidden;
    background-color: var(--background);
    color: var(--foreground);
  }

  main.content {
    padding-bottom: 15px;
  }

  html {
    scroll-behavior: smooth;
  }

  h1 {
    font-size: 1.65em;
    font-weight: 700;
  }

  h2,
  h3 {
    font-size: 1.35em;
    font-weight: 600;
    line-height: 1.5;
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
    font-family: var(--font-heading);

    transition: background-color 0.25s;
  }

  header {
    display: flex;
    justify-content: space-between;
    padding: 10px 10px 0;
    align-items: center;
    top: 0;
    position: sticky;
    position: -webkit-sticky;
    background: var(--background);
    transition: background-color 0.25s, box-shadow 0.25s;
    z-index: 10;
    box-shadow: 0px 10px 10px var(--background);
  }

  .nav-links {
    margin-right: 15px;
    float: right;
  }

  header nav > div {
    display: none;
  }

  .bar {
    display: block;
    width: 25px;
    height: 3px;
    margin: 5px auto;
    transition: transform 0.4s, opacity 0.4s, background-color 0.25s;
    background-color: var(--foreground);
    border-radius: 2px;
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
    display: inline-block;
    font-family: var(--font-code);
    padding: 0 10px;
    background-color: var(--ui-code-background);
    border-radius: 4px;
    transition: background-color 0.25s;
  }

  h5,
  h6,
  p,
  li {
    font-size: 18px;
    font-weight: 400;
    color: var(--foreground);
    font-family: var(--font-body);
    transition: background-color 0.25s, color 0.25s;
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
    font-family: var(--font-heading);
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

  header nav ul {
    display: flex;
    align-items: center;
    padding: 0;
    position: fixed;
    justify-content: center;
    bottom: 100vh;
    left: 0;
    flex-direction: column;
    margin: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 10px;
    text-align: center;
    transition: bottom 0.4s;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    z-index: 10;
    overflow: hidden;
  }

  header nav ul:before {
    content: '';
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
    bottom: 0;
  }

  header nav > div {
    display: block;
    cursor: pointer;
    position: relative;
    z-index: 11;
    top: 3px;
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
    user-select: none;
    list-style: none;
    padding: 2px 0;
  }

  header nav ul li a {
    height: fit-content;
    font-family: var(--font-heading);
    margin: 0 5px;
    font-weight: 600;
    color: var(--foreground);
    border-bottom: transparent solid 4px;
    transition: border 0.25s, color 0.25s;
    font-size: 33px;
  }

  header nav ul li a.router-link-active {
    border-bottom: var(--foreground) solid 4px;
  }

  header nav ul li a:hover:not(.router-link-active) {
    border-bottom: var(--link-color) solid 4px;
  }

  header nav ul li a img {
    width: 24px;
    transition: filter 0.25s;
  }

  html.dark-theme nav ul li a img {
    filter: invert(100%);
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--foreground);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-corner {
    background-color: transparent;
  }

  button {
    padding: 10px;
    border-radius: 10px;
    margin: 5px 0;
    font-size: 18px;
    font-family: var(--font-heading);
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--ui-border);
    background-color: var(--ui-background);
    color: var(--ui-foreground);
    transition: border 0.25s, background-color 0.25s, color 0.25s;
    user-select: none;
  }

  button:hover:not(:disabled),
  button:focus:not(:disabled) {
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
    padding: 0 5px;
    justify-content: space-evenly;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 0 auto 15px;
    width: 40%;
  }

  .quick-action-buttons-container > a {
    pointer-events: none;
  }

  .quick-action-buttons-container > button,
  .quick-action-buttons-container > a > button {
    margin-left: 5px;
    margin-right: 5px;
    pointer-events: all;
  }

  @media screen and (max-width: 781px) {
    .quick-action-buttons-container {
      width: 90%;
    }
  }

  input {
    padding: 10px;
    border-radius: 10px;
    font-family: var(--font-heading);
    font-weight: 600;
    margin: 5px 0;
    transition: border 0.25s, background-color 0.25s, color 0.25s;
    outline: none;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    appearance: none;
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    appearance: none;
    -moz-appearance: textfield;
  }

  textarea {
    font-family: var(--font-heading);
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
    font-size: 18px;
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

  form input[type='submit'] {
    display: none;
  }

  select {
    font-family: 'Montserrat', 'Franklin Gothic Medium', 'Arial Narrow', 'Arial',
      'sans-serif';
    border-radius: 10px;
    font-weight: 600;
    outline: none;
    padding: 10px;
    transition: border 0.25s, background-color 0.25s, color 0.25s;
  }

  option {
    font-weight: 600;
    border: 1px solid var(--ui-border);
    background-color: var(--ui-background);
    color: var(--ui-foreground);
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
    border: 1px solid var(--ui-border);
    font-size: 18px;
    font-family: var(--font-body);
    transition: background-color 0.25s, color 0.25s, border 0.25s;
    overflow-y: hidden;
    margin-left: 35px;
    max-width: 80vw;
    overflow-wrap: break-word;
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

  .content-box-container {
    display: grid;
    height: fit-content;
    grid: auto / repeat(auto-fit, minmax(300px, 1fr));
    grid-gap: 10px;
    width: calc(100% - 20px);
    margin: 0 auto;
  }

  .content-box-container + .content-box-container {
    margin-top: 15px;
  }

  .no-content-container {
    padding: 30px 0;
  }

  .hero-points {
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
  }

  .hero-points div {
    width: 45vw;
  }

  @media screen and (min-width: 769px) {
    .hero-points div:nth-child(even) {
      text-align: left;
    }

    .hero-points div:nth-child(odd):not(:last-child) {
      text-align: right;
    }
  }

  @media only screen and (max-width: 768px) {
    .hero-points div {
      width: 70vw;
    }
  }
</style>
