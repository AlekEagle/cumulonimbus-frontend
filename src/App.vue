<template>
  <div ref="sky" :class="{ 'sky': true, 'no-clouds': noClouds }">
    <header class="bar">
      <RouterLink class="brand" to="/">
        <img aria-hidden="true" alt="" src="!/images/Cumulonimbus.svg" />
        Cumulonimbus
      </RouterLink>

      <nav aria-label="Navigation">
        <div
          class="theme-switch"
          :title="`${themeTitleDescription}. Click to cycle through themes.`"
          @click="doThemeToggle"
        >
          <div class="theme-switch-container">
            <span :id="displayPref.theme" />
          </div>
        </div>
        <RouterLink to="/auth/switcher" v-if="!user.loggedIn">
          Log In
        </RouterLink>
        <div
          v-else
          class="profile-button"
          title="Your Profile"
          @click="showProfile = !showProfile"
        >
          <span />
        </div>
      </nav>
    </header>

    <!-- v-if="visible" -->
    <RouterView name="header" v-slot="{ Component, route }">
      <Transition :css="false" @enter="onEnter" @leave="onLeave">
        <div :key="route.path">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>

    <Transition name="bank">
      <img
        v-if="!noClouds"
        class="bank"
        aria-hidden="true"
        src="!/images/bank.webp"
        alt=""
        decoding="async"
      />
    </Transition>
    <Transition name="bank-fade">
      <div v-if="!noClouds" class="bank-fade" aria-hidden="true"></div>
    </Transition>
  </div>

  <template v-if="showProfile">
    <div
      class="profile-clickoff-target"
      @click.prevent="showProfile = !showProfile"
    />
    <div class="profile">
      <ul>
        <li>Hello, {{ user.account?.user.username }}</li>
        <RouterLink @click="showProfile = !showProfile" to="/dashboard">
          <li>Your Dashboard</li>
        </RouterLink>
        <RouterLink
          to="/staff"
          v-if="user.account?.user.staff"
          @click="showProfile = !showProfile"
        >
          <li>Staff Dashboard</li>
        </RouterLink>
        <RouterLink to="/auth/switcher" @click="showProfile = !showProfile">
          <li>Switch Accounts</li>
        </RouterLink>
        <li @click="doLogout">Log Out</li>
      </ul>
    </div>
  </template>

  <!-- DO NOT DELETE THIS CODE OR THE COMMENTS I DON'T KNOW WHAT IT DOES BUT REMOVING IT BREAKS LITERALLY EVRYTHING -->
  <main>
    <!-- The real deal content -->
    <RouterView />
    <!-- The end of the real deal content -->
  </main>
  <!-- DO NOT DELETE THE CODE OR THE COMMENTS ABOVE ME APPARENTLY THEY'RE STRUCTURALLY INTEGRAL TO THIS WHOLE THING -->

  <div class="footer">
    <footer class="footer-content">
      <span>Cumulonimbus, the funny cloud platform.</span>
      <nav aria-label="Footer">
        <RouterLink to="/about">About</RouterLink>
        <a href="https://alekeagle.com/d">Discord</a>
        <a
          href="mailto:abuse@cumulonimbus.link?subject=Report%20Abuse&body=URL%2FLink%20to%20offending%20content%3A%20%5BReplace%20me%20with%20the%20link%20to%20the%20offending%20content%5D%0A%0AUse%20the%20space%20below%20to%20explain%20how%20the%20content%20above%20is%20potentially%20abusing%20the%20service%3A%0A%5BYour%20reasoning%20here%5D"
          >Report abuse</a
        >
        <RouterLink to="/privacy">Privacy</RouterLink>
        <RouterLink to="/tos">Terms</RouterLink>
      </nav>
    </footer>
  </div>

  <fieldset v-if="debugVisible" class="debug-settings">
    <legend>Development Options</legend>
    <p>Toggle window with "F3"</p>
    <label v-for="option in debugSettings" :style="{ display: 'block' }">
      <button
        v-if="option.value == null"
        @click="assignSettingDefault(option)"
        v-text="option.description"
      />
      <template v-else>
        {{ option.description }}
        <select v-if="option.type == 'select'" v-model="option.value">
          <option
            v-for="value in option.states"
            :value="value"
            v-text="value"
          />
        </select>
        <input
          v-if="option.type == 'text'"
          type="text"
          v-model="option.value"
        />
      </template>
      <span v-if="'toggle' in option && option.toggle != null">
        (toggle with "{{ option.toggle }}")</span
      >
    </label>
  </fieldset>
  <SecondFactorModal />
  <ToastRenderer />
</template>

<script setup lang="ts">
  // Vue Components
  import SecondFactorModal from '&/SecondFactorModal.vue';
  import ToastRenderer from '&/ToastRenderer.vue';

  // In-House Modules
  import { debugSettings, debugRef } from '#/debug';

  // Store Modules
  import { displayPrefStore, Theme } from '$/displayPref';
  import { userStore } from '$/user.js';
  import { toastStore, ToastType } from '$/toast.js';

  // External Modules
  import { ref, onMounted, computed, useTemplateRef, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  // import { visible } from '@/router';

  const route = useRoute();
  const router = useRouter();
  const toast = toastStore();
  const displayPref = displayPrefStore();
  const user = userStore();
  const noClouds = computed(() => (route.meta.noClouds ?? false) as boolean);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const showProfile = ref(false);

  //// Logout

  async function doLogout() {
    if (await user.logout()) {
      router.replace({
        path: '/',
      });
    } else {
      toast.show(
        "I couldn't log out for some reason. Try again later.",
        ToastType.ERROR,
      );
    }
    showProfile.value = false;
  }

  //// Theme Stuff

  const theme = debugRef<'system' | 'light' | 'dark'>('system', {
    type: 'select',
    description: 'Theme',
    states: ['system', 'light', 'dark'],
    toggleStates: ['system', 'light', 'dark'],
    toggle: '.',
  });

  watch(theme, (value) => {
    displayPref.theme = value as Theme;
  });

  const themeTitleDescription = computed(() => {
    switch (displayPref.theme) {
      case 'system':
        return 'System Default';
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
    }
  });

  function doThemeToggle() {
    switch (displayPref.theme) {
      case 'system':
        displayPref.theme = Theme.LIGHT;
        break;
      case 'light':
        displayPref.theme = Theme.DARK;
        break;
      case 'dark':
        displayPref.theme = Theme.SYSTEM;
        break;
    }
  }

  //// Animation

  const sky = useTemplateRef('sky');

  let data: any = {};

  watch(
    () => route.path,
    () => {
      if (!sky.value) return;
      data.height = sky.value.getClientRects()[0].height;
      data.padding = getComputedStyle(sky.value).paddingBottom;
    },
    { flush: 'pre' },
  );

  function onLeave(element: Element, done: () => void) {
    data.element = element;
    data.done = done;
  }

  function onEnter(element: Element, done: () => void) {
    if (data.element == undefined) return done();

    if (reducedMotion.matches) {
      done();
      data.done();
      return;
    }

    const placeholder = document.createComment('');
    data.element.replaceWith(placeholder);
    const targetHeight = sky.value!.getClientRects()[0].height;
    const targetPadding = getComputedStyle(sky.value!).paddingBottom;
    placeholder.replaceWith(data.element);

    const outh = data.element.getClientRects()[0].height;
    const inh = element.getBoundingClientRect().height;

    data.element.animate(
      [
        {
          offset: 0,
          easing: 'ease-in-out',

          position: 'absolute',
          width: '100%',
          opacity: '1',
        },
        {
          offset: 0.5,

          position: 'absolute',
          width: '100%',
          opacity: '0',
          transform: `translateY(${-outh / 8}px) scale(0.95)`,
        },
        {
          offset: 1,

          position: 'absolute',
          width: '100%',
          opacity: '0',
        },
      ],
      300,
    );

    element.animate(
      [
        {
          offset: 0,

          opacity: '0',
        },
        {
          offset: 0.5,
          easing: 'ease-in-out',

          opacity: '0',
          transform: `translateY(${-inh / 8}px) scale(0.95)`,
        },
        {
          offset: 1,

          opacity: '1',
        },
      ],
      300,
    );

    sky.value!.animate(
      [
        {
          easing: 'ease-in-out',

          height: `${data.height}px`,
          paddingBottom: data.padding,
        },
        {
          height: `${targetHeight}px`,
          paddingBottom: targetPadding,
        },
      ],
      300,
    );
    // console.log("onEnter", arguments);
    setTimeout(() => {
      done();
      data.done();
    }, 290);
  }

  //// Development Options

  const debugVisible = ref(route.query.debug === 'true');

  function assignSettingDefault(setting: any) {
    if ('default' in setting) setting.value = setting.default;
    else
      switch (setting.type) {
        case 'checkbox':
          setting.value = false;
          break;
        case 'select':
          setting.value = setting.states[0];
          break;
        case 'text':
          setting.value = '';
          break;
      }
  }

  onMounted(() => {
    document.addEventListener('keydown', (event) => {
      if (event.repeat || event.isComposing) return;
      if (event.key == 'F3') debugVisible.value = !debugVisible.value;

      // man vue's types sure are correct
      debugSettings.value.forEach((setting: any) => {
        if (setting.toggle != event.key) return;

        switch (setting.type) {
          case 'checkbox':
            setting.value = !setting.value;
            break;
          case 'select':
            const states = setting.toggleStates ?? setting.states;
            const index =
              states.findIndex((value: number) => value == setting.value) ?? -1;
            setting.value = states?.[index + 1] ?? states[0];
            break;
        }
      });
    });
  });
</script>

<style scoped>
  /* hero */

  .sky {
    background: linear-gradient(
      180deg,
      var(--look-sky-top) 0%,
      var(--look-sky-middle) 60%,
      var(--look-sky-bottom) 100%
    );
    color: var(--look-sky-text);
    position: relative;
    overflow: clip;
    padding-bottom: calc(var(--cloud-cover) + 0.75rem);
  }

  .sky.no-clouds {
    padding-bottom: 0px;
  }

  .bar {
    position: relative;
    z-index: 2;
  }

  .bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1rem clamp(1.125rem, 4vw, 3.5rem);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    font-weight: 800;
    font-size: 1.35rem;
    text-shadow: 0 0 2px rgba(0, 0, 0, 1);
  }

  .brand img {
    width: 2.625rem;
    height: 2.625rem;
    border-radius: 9rem;
  }

  .bar nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    font-weight: 600;
    text-shadow: 0 0 2px rgba(0, 0, 0, 1);
    white-space: nowrap;
  }

  .bar nav .theme-switch {
    cursor: pointer;
    display: inline-block;
    width: 24px;
    height: 24px;
    align-items: center;
  }

  .bar nav .theme-switch .theme-switch-container {
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 1));
  }

  .bar nav .theme-switch .theme-switch-container span {
    display: inline-block;
    width: 24px;
    height: 24px;
    background-color: var(--look-sky-text);
    transition: background-color var(--theme-switch-time) ease;
  }

  .bar nav .theme-switch .theme-switch-container span#system {
    mask: url('!/images/computer.svg') center / contain no-repeat;
  }

  .bar nav .theme-switch .theme-switch-container span#light {
    mask: url('!/images/sun.svg') center / contain no-repeat;
  }

  .bar nav .theme-switch .theme-switch-container span#dark {
    mask: url('!/images/moon.svg') center / contain no-repeat;
  }

  .bar nav a {
    text-decoration: none;
  }

  .bar nav a:hover,
  .bar nav a.router-link-exact-active {
    text-decoration: underline;
  }

  .bar nav div.profile-button {
    display: flex;
    width: 36px;
    height: 36px;

    border: 2px solid var(--look-sky-text);
    border-radius: 36px;
    cursor: pointer;

    overflow: hidden;

    align-items: end;
    justify-content: center;

    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 1));
  }

  .bar nav div.profile-button span {
    display: inline-block;
    width: 28px;
    height: 28px;
    background-color: var(--look-sky-text);
    mask: url('!/images/profile.svg') center / contain no-repeat;
    transition: background-color var(--theme-switch-time) ease;
  }

  div.profile {
    position: absolute;
    top: 60px;
    right: 54px;
    background: var(--look-footer);
    border: 1px solid var(--look-sky-text);
    border-radius: 10px;
    color: var(--look-sky-text);
    z-index: 3;
  }

  div.profile ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  div.profile ul a {
    text-decoration: none;
  }

  div.profile ul li,
  div.profile ul a li {
    padding: 0.5em 1em;
    transition: background 0.25s;
    user-select: none;
    border-top: 0.5px solid var(--look-sky-text);
    border-bottom: 0.5px solid var(--look-sky-text);
  }

  div.profile ul > li:first-child {
    border-top: none;
  }

  div.profile ul > li:last-child {
    border-bottom: none;
  }

  div.profile ul li:hover:not(:first-child),
  div.profile ul a:hover:not(:first-child) li {
    background: rgba(255, 255, 255, 0.15);
  }

  div.profile ul > li:last-child {
    color: var(--look-dangerous-text);
    cursor: pointer;
  }

  div.profile-clickoff-target {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    z-index: 2;
  }

  .bank {
    position: absolute;
    left: calc((100% - var(--bank-width)) / 2);
    bottom: calc(var(--cloud-cover) - var(--bank) * var(--bank-shift-up) - 1px);
    z-index: 1;
    width: var(--bank-width);
    height: auto;
    object-fit: cover;
    object-position: center top;
    filter: brightness(var(--bank-tone));
    mix-blend-mode: screen;
    pointer-events: none;

    transition: filter var(--theme-switch-time) ease;
  }

  .bank-enter-active,
  .bank-leave-active {
    transition: transform 0.3s ease-in-out;
  }

  .bank-enter-from,
  .bank-leave-to {
    transform: translateY(400px);
  }

  @media (prefers-reduced-motion: reduce) {
    .bank-enter-active,
    .bank-leave-active {
      transition: none;
    }
  }

  .bank-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    z-index: 1;
    height: calc(var(--cloud-cover) * 0.35);
    background: linear-gradient(transparent, var(--look-page));

    transition: --look-page var(--theme-switch-time);
  }

  .bank-fade-enter-active {
    transition: height 0.1s ease-in 0.2s;
  }

  .bank-fade-leave-active {
    transition: height 0.1s ease-out;
  }

  .bank-fade-enter-from,
  .bank-fade-leave-to {
    height: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .bank-fade-enter-active,
    .bank-fade-leave-active {
      transition: none;
    }
  }

  .footer {
    background: var(--look-footer);
    color: var(--look-footer-text);
    flex-grow: 1;

    transition:
      background var(--theme-switch-time),
      color var(--theme-switch-time);
  }

  .footer-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 16px;
    max-width: 77.5rem;
    margin: 0 auto;
    padding: 28px clamp(18px, 4vw, 56px);
    font-size: 0.98rem;
  }

  .footer-content nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.375rem;
  }

  .debug-settings {
    position: fixed;
    left: 1rem;
    bottom: 1rem;
    z-index: 1000;
    background: Canvas;
    color: CanvasText;
  }
</style>
