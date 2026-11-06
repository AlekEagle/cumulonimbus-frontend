<template>
  <div ref="sky" class="sky">
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
          <span v-if="displayPref.theme === 'system'" id="system" />
          <span v-else-if="displayPref.theme === 'light'" id="light" />
          <span v-else-if="displayPref.theme === 'dark'" id="dark" />
        </div>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/auth">Dashboard</RouterLink>
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
    <p>Toggle window with "Enter"</p>
    <label v-for="option in debugSettings" :style="{ display: 'block' }">
      <button
        v-if="option.value == null"
        @click="assignSettingDefault(option)"
        >{{ option.description }}</button
      >
      <template v-else>
        {{ option.description }}
        <select v-if="option.type == 'select'" v-model="option.value">
          <option v-for="value in option.states" :value="value">{{
            value
          }}</option>
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
  <ToastRenderer />
</template>

<script setup lang="ts">
  // Vue Components
  import ToastRenderer from '&/ToastRenderer.vue';

  // In-House Modules
  import { debugSettings, debugRef } from '#/debug';

  // Store Modules
  import { displayPrefStore, Theme } from '$/displayPref';

  // External Modules
  import { ref, onMounted, computed, useTemplateRef, watch } from 'vue';
  import { useRoute } from 'vue-router';
  // import { visible } from '@/router';

  const route = useRoute();
  const displayPref = displayPrefStore();
  const noClouds = computed(() => (route.meta.noClouds ?? false) as boolean);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
  function onLeave(element: Element, done: () => void) {
    data.height = sky.value!.getClientRects()[0].height;
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
        },
        {
          height: `${targetHeight}px`,
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

  const debugVisible = ref(true);

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
      if (event.key == 'Enter') debugVisible.value = !debugVisible.value;

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
    background: var(--look-sky);
    color: var(--look-sky-text);
    position: relative;
    overflow: clip;
    padding-bottom: calc(var(--cloud-cover) + 0.75rem);
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
  }

  .bar nav .theme-switch {
    cursor: pointer;
    display: inline-block;
    width: 24px;
    height: 24px;
    align-items: center;
  }

  .bar nav .theme-switch span {
    display: inline-block;
    width: 24px;
    height: 24px;
    background-color: var(--look-sky-text);
    transition: background-color var(--theme-switch-time) ease;
  }

  .bar nav .theme-switch span#system {
    mask: url('!/images/computer.svg') center / contain no-repeat;
  }

  .bar nav .theme-switch span#light {
    mask: url('!/images/sun.svg') center / contain no-repeat;
  }

  .bar nav .theme-switch span#dark {
    mask: url('!/images/moon.svg') center / contain no-repeat;
  }

  .bar nav a {
    text-decoration: none;
  }

  .bar nav a:hover,
  .bar nav a.router-link-exact-active {
    text-decoration: underline;
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

<style>
  /*** Global CSS ***/

  /* Properties */
  @property --look-page {
    syntax: '<color>';
    inherits: true;
    initial-value: #ffffff;
  }

  /* Common Values */
  html {
    /* Wider than the viewport (cropping the tall side peaks) until 1800px (112.5rem), then 100vw */
    --bank-width: clamp(45rem, 180vw, max(2400px, 100vw));
    /* Exact rendered height of bank-1.webp */
    --bank: calc(var(--bank-width) * 426 / 2095);
    /* Percent that the bank should be shifted up */
    --bank-shift-up: 0.4;

    --cloud-cover: min(calc(var(--bank) * var(--bank-shift-up)), 18rem);

    --theme-switch-time: 0.12s;
    /*--theme-switch-time: 1s;*/

    --font-standard: 'Bricolage Grotesque', sans-serif;
    --font-heading: 'Bricolage Grotesque', sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, monospace;

    /* Logo gradient colors */
    --logo-color-top: rgb(112, 132, 230);
    --logo-color-bottom: rgb(0, 250, 255);
  }

  /* Light Mode */
  html.light-mode {
    --look-sky: #1877bd;
    --look-sky-text: #ffffff;
    --look-sky-text-light: #c6e0f3;

    --look-page: #ffffff;
    --look-page-text: #0a2540;

    --look-band: #e8f4fc;
    --look-band-text: #0a2540;

    --look-footer: #0a2540;
    --look-footer-text: #c4d6e6;

    --look-button: #0d4f86;
    --look-button-disabled: #d1d1d1;
    --look-button-text: #ffffff;
    --look-button-hover: #1271be;

    --hint-bg: rgba(255, 255, 255, 0.1);
    --hint-line: rgba(255, 255, 255, 0.65);

    --bank-tone: 1;
  }

  /* Dark Mode */
  html.dark-mode {
    --look-sky: linear-gradient(180deg, #08162b 0%, #102847 60%, #173556 100%);
    --look-sky-text: #eef4fa;
    --look-sky-text-light: #9fbedc;

    --look-page: #0e1a2b;
    --look-page-text: #dce7f2;

    --look-band: #12233a;
    --look-band-text: #dce7f2;

    --look-footer: #09131f;
    --look-footer-disabled: #09131f;
    --look-footer-text: #93a9bf;

    --look-button: #ffffff;
    --look-button-disabled: #d1d1d1;
    --look-button-text: #0d4f86;
    --look-button-hover: #e8f4fc;

    --hint-bg: rgba(143, 203, 255, 0.06);
    --hint-line: rgba(159, 190, 220, 0.55);

    --bank-tone: 0.5;
  }

  /* Body Styling */
  body {
    background: var(--look-footer);
    display: flex;
    flex-direction: column;

    margin: 0;
    overflow-y: scroll;
    overflow-x: hidden;

    line-height: 1.55;
    min-height: 100vh;

    font-family: var(--font-standard);
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
    font-variation-settings: 'wdth' 100;
    transition:
      background var(--theme-switch-time) ease,
      color var(--theme-switch-time) ease;
  }

  /* Universal Base Styles */

  * {
    box-sizing: border-box;
    margin: 0;
  }

  main {
    background: var(--look-page);
    transition: background var(--theme-switch-time) ease;
  }

  a {
    color: inherit;
    text-underline-offset: 3px;
  }

  button,
  select,
  input[type='color'] {
    cursor: pointer;
  }

  form input[type='submit'] {
    display: none;
  }

  button,
  input[type='text'],
  input[type='number'],
  input[type='password'],
  input[type='email'],
  input[type='url'],
  input[type='tel'],
  input[type='search'],
  input[type='date'],
  input[type='time'],
  input[type='datetime-local'],
  input[type='month'],
  input[type='week'],
  input[type='color'],
  textarea,
  select {
    text-decoration: none;
    font-size: 1rem;
    font-weight: 700;
    padding: 0.8125rem 1.5rem;
    border: 2px solid var(--look-button);
    border-radius: 1.5rem;
    background: var(--look-button);
    color: var(--look-button-text);
    /* Hide default appearance for form elements */
    -webkit-appearance: none;
    appearance: none;
    transition:
      background var(--theme-switch-time) ease,
      border-color var(--theme-switch-time) ease,
      color var(--theme-switch-time) ease;
  }

  input[type='color'] {
    display: inline-block;
    width: 50px;
    height: 24px;
    box-sizing: border-box;
    block-size: 24px;
    padding: 0;
  }

  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  input[type='color']::-webkit-color-swatch,
  input[type='color']::-moz-color-swatch {
    border: none;
    border-radius: 0.25rem;
  }

  input[type='color']::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  button:hover:enabled,
  input[type='text']:hover:enabled,
  input[type='number']:hover:enabled,
  input[type='password']:hover:enabled,
  input[type='email']:hover:enabled,
  input[type='url']:hover:enabled,
  input[type='tel']:hover:enabled,
  input[type='search']:hover:enabled,
  input[type='date']:hover:enabled,
  input[type='time']:hover:enabled,
  input[type='datetime-local']:hover:enabled,
  input[type='month']:hover:enabled,
  input[type='week']:hover:enabled,
  input[type='color']:hover:enabled,
  textarea:hover:enabled,
  select:hover:enabled {
    background: var(--look-button-hover);
    border-color: var(--look-button-hover);
  }

  button:disabled,
  input:disabled,
  textarea:disabled,
  select:disabled {
    background: var(--look-button-disabled);
    border-color: var(--look-button-disabled);
    cursor: not-allowed;
  }

  /* Universal Opt-In Styles */
  @media (hover: none) and (pointer: coarse) {
    .fine-only {
      display: none;
    }
  }

  @media (hover: hover), (pointer: fine) {
    .touch-only {
      display: none;
    }
  }

  .screen-reader-only {
    position: absolute;
    clip-path: rect(0 0 0 0);
    left: 1000em;
    width: 1px;
    height: 1px;
    white-space: nowrap;
    overflow: hidden;
  }

  .content {
    max-width: 77.5rem;
    margin: 0 auto;

    padding-inline: clamp(1.125rem, 4vw, 3.5rem);
  }
</style>
