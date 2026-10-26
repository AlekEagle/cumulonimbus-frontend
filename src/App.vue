<template>
  <div class="sky">
    <header class="bar">
      <RouterLink class="brand" to="/">
        <img aria-hidden="true" alt="" src="@/assets/images/Cumulonimbus.svg" />
        Cumulonimbus
      </RouterLink>

      <nav aria-label="Main">
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/auth">Dashboard</RouterLink>
      </nav>
    </header>

    <Transition name="slide" appear>
      <section
        v-if="visible"
        class="content hero-content"
        :style="{ maxWidth: pageSize }"
      >
        <RouterView name="hero" />
      </section>
    </Transition>

    <img
      class="bank"
      aria-hidden="true"
      src="@/assets/images/bank.webp"
      alt=""
      decoding="async"
    />
    <div class="bank-fade" aria-hidden="true"></div>
  </div>

  <!-- DO NOT DELETE THIS CODE OR THE COMMENTS I DON'T KNOW WHAT IT DOES BUT REMOVING IT BREAKS LITERALLY EVRYTHING -->
  <!-- The real deal content -->
  <RouterView />
  <!-- The end of the real deal content -->

  <div class="footer">
    <footer class="footer-content">
      <span>Cumulonimbus, the funny cloud platform.</span>
      <nav aria-label="Footer">
        <a href="https://alekeagle.com/d">Discord</a>
        <a
          href="mailto:abuse@alekeagle.me?subject=Report%20Abuse&body=URL%2FLink%20to%20offending%20content%3A%20%5BReplace%20me%20with%20the%20link%20to%20the%20offending%20content%5D%0A%0AUse%20the%20space%20below%20to%20explain%20how%20the%20content%20above%20is%20potentially%20abusing%20the%20service%3A%0A%5BYour%20reasoning%20here%5D"
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
    <label v-for="option in debugSettings">
      {{ option.description }}
      <select v-if="option.type == 'select'" v-model="option.value">
        <option v-for="value in option.states" :value="value">{{
          value
        }}</option>
      </select>
      <span v-if="option.toggle != null">
        (toggle with "{{ option.toggle }}")</span
      >
    </label>
  </fieldset>
</template>

<script setup lang="ts">
  import { ref, onMounted, Ref, watch, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { debugSettings, debugRef } from '@/debug';

  const route = useRoute();
  const pageSize = computed(() => route.meta.pageSize as string);
  const visible = ref(false);
  const theme = debugRef<'system' | 'light' | 'dark'>('system', {
    type: 'select',
    description: 'Theme',
    states: ['system', 'light', 'dark'],
    toggleStates: ['light', 'dark'],
    toggle: '.',
  });

  watch(theme, (value) => {
    document.documentElement.classList.remove('dark-mode');
    document.documentElement.classList.remove('light-mode');
    switch (value) {
      case 'dark':
        document.documentElement.classList.add('dark-mode');
        break;
      case 'light':
        document.documentElement.classList.add('light-mode');
        break;
    }
  });

  const debugVisible = ref(true);

  console.log(debugSettings);
  watch(debugSettings, (options) => {
    console.log(options);
  });

  onMounted(() => {
    visible.value = true;

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

  .hero-content {
    padding-block: clamp(2rem, 6vw, 5.5rem) 0;
  }

  .bar,
  .hero-content {
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

  .bar nav a {
    text-decoration: none;
  }

  .bar nav a:hover {
    text-decoration: underline;
  }

  .hero-content.slide-enter-active {
    transition:
      opacity 0.3s,
      transform 0.3s;
  }

  .hero-content.slide-enter-from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
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

    transition: filter var(--theme-switch-time);
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
    right: 1rem;
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
  }

  /* Light Mode */
  html {
    --look-sky: #1877bd;
    --look-sky-text: #ffffff;
    --look-sky-text-light: #c6e0f3;

    --look-page: #ffffff;
    --look-page-text: #0a2540;

    --look-band: #e8f4fc;
    --look-band-text: #0a2540;

    --look-footer: #0a2540;
    --look-footer-text: #c4d6e6;

    --look-button: #ffffff;
    --look-button-text: #0d4f86;
    --look-button-hover: #e8f4fc;

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
    --look-footer-text: #93a9bf;

    --hint-bg: rgba(143, 203, 255, 0.06);
    --hint-line: rgba(159, 190, 220, 0.55);

    --bank-tone: 0.5;
  }

  /* Dark Mode Media Query */
  @media (prefers-color-scheme: dark) {
    html:not(.light-mode) {
      --look-sky: linear-gradient(
        180deg,
        #08162b 0%,
        #102847 60%,
        #173556 100%
      );
      --look-sky-text: #eef4fa;
      --look-sky-text-light: #9fbedc;

      --look-page: #0e1a2b;
      --look-page-text: #dce7f2;

      --look-band: #12233a;
      --look-band-text: #dce7f2;

      --look-footer: #09131f;
      --look-footer-text: #93a9bf;

      --hint-bg: rgba(143, 203, 255, 0.06);
      --hint-line: rgba(159, 190, 220, 0.55);

      --bank-tone: 0.5;
    }
  }

  /* Body Styling */
  body {
    display: flex;
    flex-direction: column;

    margin: 0;
    overflow-y: scroll;
    overflow-x: hidden;

    line-height: 1.55;
    min-height: 100vh;

    /* notice: font is currently installed in html because fuck you */
    font-family: 'Bricolage Grotesque', sans-serif;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
    font-variation-settings: 'wdth' 100;

    /*font-family: "Montserrat", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;*/
  }

  /* Universal Base Styles */
  * {
    box-sizing: border-box;
    margin: 0;
  }

  a {
    color: inherit;
    text-underline-offset: 3px;
  }

  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
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

  .button {
    display: inline-block;
    text-decoration: none;
    font-weight: 700;
    border-radius: 9em;
    padding: 0.8125rem 1.5rem;
    border: 2px solid var(--look-button);
    background: transparent;

    /* solid */
    background: var(--look-button);
    color: var(--look-button-text);
  }

  .button:hover {
    background: var(--look-button-hover);
    border-color: var(--look-button-hover);
  }

  .content {
    max-width: 77.5rem;
    margin: 0 auto;

    padding-inline: clamp(1.125rem, 4vw, 3.5rem);
  }
</style>
