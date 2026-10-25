<script setup lang="ts">
import { ref, onMounted, Ref, watch } from "vue";

// const featured = "iu94IKgA1w.mp4"; // 404
const featured = "-r7kKbtZbD.mp4"; // funny

const sites = [
  "cumulonimbus.link",
  "obama.solutions",
  "linus-tech.tips",
  "you.are-so.gay",
  "shit.computer",
  "toilets.pics",
];

const visible = ref(false);
const theme: Ref<"system" | "light" | "dark"> = ref("system");
// const media = window.matchMedia('(prefers-color-scheme: dark)');

onMounted(() => {
  visible.value = true;

  document.addEventListener("keydown", (event) => {
    if (event.repeat || event.isComposing) return;

    switch (event.key) {
      case ".":
        theme.value = theme.value == "light" ? "dark" : "light";
        break;
    }
  });
});

watch(theme, (value) => {
  document.documentElement.classList.remove("dark-mode");
  document.documentElement.classList.remove("light-mode");
  switch (value) {
    case "dark":
      document.documentElement.classList.add("dark-mode");
      break;
    case "light":
      document.documentElement.classList.add("light-mode");
      break;
  }
});
</script>

<template>
  <div class="sky">
    <!-- container div for sky -->
    <header class="bar">
      <a class="brand" href="/about">
        <img aria-hidden="true" alt="" src="@/assets/images/Cumulonimbus.svg" />
        Cumulonimbus
      </a>

      <nav aria-label="Main">
        <a href="/about">About</a>
        <a href="/auth">Dashboard</a>
      </nav>
    </header>

    <Transition name="slide" appear>
      <section v-if="visible" class="content hero-content">
        <h1>Upload a file. Get a link like this one.</h1>

        <p class="url">
          <span class="url-part">https://</span>
          <span class="domain">
            <span class="reel-container">
              <span class="reel" aria-hidden="true">
                <span v-for="site in sites">{{ site }}</span>
                <span>{{ sites[0] }}</span>
              </span>
            </span>

            <span class="sr-only">{{ sites[0] }}</span>
          </span>
          <span class="url-part">/{{ featured }}</span>
          <!-- <span class="url-part">ÁÂgjpqy_,;</span> -->
        </p>

        <div class="drop-hint js-required">
          <img
            aria-hidden="true"
            src="@/assets/images/upload.svg"
            style="filter: brightness(0) invert(1)"
          />
          <div class="dh-text">
            <p class="dh-title">Drop some media to upload</p>
            <p class="dh-sub">
              Or paste a screenshot. You'll get a link as soon as it's up.
            </p>
          </div>
          <button class="button" type="button" data-pick>Choose a file</button>
        </div>

        <a class="button" href="/auth">Open the dashboard</a>
        <p>
          Anyone can sign up, host any file, then share it from whichever of our
          domains you like.
        </p>
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

  <div class="features">
    <main class="content features-content">
      <section aria-labelledby="domain-list-title">
        <h2 id="domain-list-title">Choose the domain on your links</h2>
        features sect
      </section>

      <section aria-labelledby="upload-tools-title">
        <h2 id="upload-tools-title">Upload from the tools you already use</h2>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nam similique
        voluptate corporis nesciunt velit, ipsa quod nemo molestiae maiores rem
        asperiores ut obcaecati assumenda tempore qui eos modi reprehenderit
        veniam.
      </section>
    </main>
  </div>

  <div class="questions">
    <div class="content questions-content">
      <section aria-labelledby="questions-ideas-title">
        <h3 id="questions-ideas-title">Questions or ideas?</h3>
        questions sect
      </section>

      <section aria-labelledby="abuse report title">
        <h3 class="abuse-report-title">See something wrong?</h3>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nostrum,
        numquam dolores, placeat omnis explicabo sunt dicta harum velit earum
        obcaecati odit aliquid error cumque. Enim maxime ut atque vero debitis?
      </section>

      <section aria-labelledby="joke-filler-title">
        <h3 class="joke-filler-title">The only file host.*</h3>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis ad
        voluptatem, eos officia commodi voluptatum tenetur veritatis. Blanditiis
        distinctio mollitia ducimus quisquam, exercitationem ea suscipit,
        aperiam pariatur quod reprehenderit dolorum!
      </section>
    </div>
  </div>

  <!-- yes i generated this element with ai -->
  <fieldset
    style="
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      z-index: 1000;
      background: Canvas;
      color: CanvasText;
    "
    @vue:mounted="
      (vnode: import('vue').VNode) => {
        const fieldset = vnode.el as HTMLFieldSetElement & {
          appearanceKeyHandler?: (event: KeyboardEvent) => void;
        };
        fieldset.appearanceKeyHandler = (event: KeyboardEvent) => {
          if (event.key === 'Enter' && !event.repeat && !event.isComposing) {
            fieldset.hidden = !fieldset.hidden;
          }
        };
        fieldset.ownerDocument.addEventListener(
          'keydown',
          fieldset.appearanceKeyHandler,
        );
      }
    "
    @vue:before-unmount="
      (vnode: import('vue').VNode) => {
        const fieldset = vnode.el as HTMLFieldSetElement & {
          appearanceKeyHandler?: (event: KeyboardEvent) => void;
        };
        if (fieldset.appearanceKeyHandler) {
          fieldset.ownerDocument.removeEventListener(
            'keydown',
            fieldset.appearanceKeyHandler,
          );
        }
      }
    "
  >
    <legend>Development Options</legend>
    <p>Toggle window with "Enter"</p>
    <label>
      Theme
      <select v-model="theme">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      (toggle with ".")
    </label>
    <div
      @input="
        ($event) => {
          const controls = $event.currentTarget as HTMLDivElement;
          const reel = controls.ownerDocument.querySelector('.reel') as
            (HTMLElement & { originalReelNodes?: Node[] }) | null;
          if (!reel) return;
          const enabled = controls.querySelector(
            'input[type=checkbox]',
          ) as HTMLInputElement;
          const text = controls.querySelector(
            'input[type=text]',
          ) as HTMLInputElement;
          if (enabled.checked) {
            if (!reel.originalReelNodes)
              reel.originalReelNodes = Array.from(reel.childNodes);
            reel.replaceChildren(
              ...Array.from({ length: 7 }, () => {
                const span = reel.ownerDocument.createElement('span');
                span.textContent = text.value;
                return span;
              }),
            );
          } else if (reel.originalReelNodes) {
            reel.replaceChildren(...reel.originalReelNodes);
            delete reel.originalReelNodes;
          }
        }
      "
    >
      <label>
        <input type="checkbox" />
        Override URL reel
      </label>
      <input type="text" :value="sites[0]" />
    </div>
  </fieldset>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
}

html {
  /* Wider than the viewport (cropping the tall side peaks) until 1800px (112.5rem), then 100vw */
  --bank-width: clamp(45rem, 180vw, max(2400px, 100vw));
  /* Exact rendered height of bank-1.webp */
  --bank: calc(var(--bank-width) * 426 / 2095);
  /* Percent that the bank should be shifted up */
  --bank-shift-up: 0.75;

  --cloud-cover: min(calc(var(--bank) * var(--bank-shift-up)), 18rem);

  --theme-switch-time: 0.12s;
  /*--theme-switch-time: 1s;*/
}

@property --look-page {
  syntax: "<color>";
  inherits: true;
  initial-value: #ffffff;
}

/* light mode */
html {
  --look-sky: #1877bd;
  --look-sky-text: #ffffff;
  --look-sky-text-light: #c6e0f3;

  --look-page: #ffffff;
  --look-page-text: #0a2540;

  --look-band: #e8f4fc;
  --look-band-text: #0a2540;

  --look-button: #ffffff;
  --look-button-text: #0d4f86;
  --look-button-hover: #e8f4fc;

  --hint-bg: rgba(255, 255, 255, 0.1);
  --hint-line: rgba(255, 255, 255, 0.65);

  --bank-tone: 1;
}

/* dark mode */
html.dark-mode {
  --look-sky: linear-gradient(180deg, #08162b 0%, #102847 60%, #173556 100%);
  --look-sky-text: #eef4fa;
  --look-sky-text-light: #9fbedc;

  --look-page: #0e1a2b;
  --look-page-text: #dce7f2;

  --look-band: #12233a;
  --look-band-text: #dce7f2;

  --hint-bg: rgba(143, 203, 255, 0.06);
  --hint-line: rgba(159, 190, 220, 0.55);

  --bank-tone: 0.5;
}

@media (prefers-color-scheme: dark) {
  html:not(.light-mode) {
    --look-sky: linear-gradient(180deg, #08162b 0%, #102847 60%, #173556 100%);
    --look-sky-text: #eef4fa;
    --look-sky-text-light: #9fbedc;

    --look-page: #0e1a2b;
    --look-page-text: #dce7f2;

    --look-band: #12233a;
    --look-band-text: #dce7f2;

    --hint-bg: rgba(143, 203, 255, 0.06);
    --hint-line: rgba(159, 190, 220, 0.55);

    --bank-tone: 0.5;
  }
}

/*html {
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
	}*/

body {
  margin: 0;
  /*transition:
	    background 0.25s,
	    color 0.25s;*/
  overflow-y: scroll;
  overflow-x: hidden;

  /* notice: font is currently installed in html because fuck you */
  font-family: "Bricolage Grotesque", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  font-variation-settings: "wdth" 100;

  /*font-family: "Montserrat", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;*/
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

.content {
  max-width: 77.5rem;
  margin: 0 auto;

  padding-inline: clamp(1.125rem, 4vw, 3.5rem);
}

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

.hero-content h1 {
  font-size: clamp(1.6rem, 3vw, 1.9rem);
  font-weight: 700;
  line-height: 1.15;
  max-width: 22ch;
}

.url {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: clamp(1.9rem, 7.2vw, 6.5rem);
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin: clamp(20px, 3vw, 36px) 0 28px;
}

.url > span {
  display: block;
  /*overflow: hidden;*/
  height: 1lh;
}

.url-part {
  color: var(--look-sky-text-light);
}

.domain {
  position: relative;
  /*overflow: hidden;*/
}

.reel-container {
  position: absolute;
  top: -0.1em;
  left: 0;
  bottom: -0.2em;
  /*inset-inline: 0;*/
  /*inset-block: -0.1em 0.2em;*/
  padding-block: 0.1em 0.2em;
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 4%,
    black 96%,
    transparent 100%
  );
}

.reel {
  display: block;
  animation: roll 15s cubic-bezier(0.7, 0, 0.3, 1) infinite;
}

.reel span {
  display: block;
  height: 1.3em;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 19ch;
}

.drop-hint {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 18px;
  max-width: 660px;
  margin-bottom: 24px;
  padding: 14px 14px 14px 18px;
  border: 2px dashed var(--hint-line);
  border-radius: 18px;
  background: var(--hint-bg);
}

.dh-text {
  flex: 1;
  min-width: 200px;
}

.dh-title {
  font-weight: 700;
  font-size: 1.2rem;
}

.dh-sub {
  font-size: 0.98rem;
  color: var(--look-sky-text-light);
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

.features {
  background: var(--look-page);
  color: var(--look-page-text);

  transition:
    background var(--theme-switch-time),
    color var(--theme-switch-time);
}

.features-content {
  padding-block: clamp(2rem, 5vw, 4rem) clamp(3.5rem, 8vw, 6.5rem);

  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: clamp(2.25rem, 6vw, 5.5rem);
}

.questions {
  background: var(--look-band);
  color: var(--look-band-text);

  transition:
    background var(--theme-switch-time),
    color var(--theme-switch-time);
}

.questions-content {
  padding-block: clamp(2.5rem, 6vw, 4.5rem);

  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1.5rem, 4vw, 3.5rem);
}

@keyframes roll {
  0%,     /* 0 / 15 */
  13.333% /* 2 / 15 */ {
    transform: translateY(0);
  }
  16.667%, /* 2.5 / 15 */
  30%      /* 4.5 / 15 */ {
    transform: translateY(-1.3em);
  }
  33.333%, /* 5 / 15 */
  46.667%  /* 7 / 15 */ {
    transform: translateY(-2.6em);
  }
  50%,    /* 7.5 / 15 */
  63.333% /* 9.5 / 15 */ {
    transform: translateY(-3.9em);
  }
  66.667%, /* 10 / 15 */
  80%      /* 12 / 15 */ {
    transform: translateY(-5.2em);
  }
  83.333%, /* 12.5 / 15 */
  96.667%  /* 14.5 / 15 */ {
    transform: translateY(-6.5em);
  }
  100% /* 15 / 15 */ {
    transform: translateY(-7.8em);
  }
}

@media (hover: none) and (pointer: coarse) {
  .only-fine {
    display: none;
  }
}

@media (hover: hover), (pointer: fine) {
  .only-touch {
    display: none;
  }
}

.sr-only {
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

.hero-content.slide-enter-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.hero-content.slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>
