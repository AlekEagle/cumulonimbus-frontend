<template>
  <h1>About Cumulonimbus</h1>

  <div class="hero-points">
    <div>
      <h2>What is Cumulonimbus?</h2>
      <p>
        Back before it was called Cumulonimbus, before it really had any
        "official" name, it was a solution to a problem I was having with
        school. I used to use Canvas to upload my homework, but more often than
        not, Canvas would take my files I uploaded, tell me it was successful,
        but then when I went to check my grades, it would say I didn't turn in
        my homework. My solution was to create a website where I could upload my
        homework, and then share the link to the file with my teacher. It also
        gave me an excuse to indulge in my love of web development. Primarily
        developed by me, Alek Evans, Cumulonimbus is a file hosting platform
        that is free to use, and will always be free to use.
      </p>
    </div>
    <div>
      <h2>Why Cumulonimbus?</h2>
      <p>
        Unlike other file hosting platforms, Cumulonimbus is designed to be
        simple, and easy to use. With PWA (Progressive Web App) support, you can
        use Cumulonimbus on your phone, tablet, or computer, and it will always
        be up to date. Cumulonimbus is also designed to be secure, and
        privacy-focused. Cumulonimbus does not track you, and does not store any
        extraneous data about you, other than your username, email, and your
        files. If you have any doubts about this, you can check out the source
        code yourself, and see that Cumulonimbus is completely open source.
        Cumulonimbus accounts can be deleted at any time, and all of your files
        will be deleted as well. Cumulonimbus is also designed to be fast, and
        efficient.
      </p>
    </div>
    <div>
      <h2>How can I help?</h2>
      <p>
        Cumulonimbus is a free, open source project, and is always looking for
        help. If you would like to help, you can contribute to the project on
        GitHub, or you can donate to the project. Cumulonimbus is completely
        free to use, and will always be free to use, but if you would like to
        donate to the project, you can do so on my
        <a
          rel="noopener"
          target="_blank"
          href="https://www.patreon.com/alekeagle"
          >Patreon</a
        >,
        <a
          rel="noopener"
          target="_blank"
          href="https://www.paypal.com/paypalme/snavEkelA"
          >PayPal</a
        >, or
        <a
          rel="noopener"
          target="_blank"
          href="https://github.com/sponsors/alekeagle"
          >GitHub Sponsors</a
        >.
      </p>
    </div>
  </div>
  <div class="content-box-container">
    <ContentBox
      title="Frontend"
      to="https://github.com/AlekEagle/cumulonimbus-frontend"
    >
      <p>
        The frontend of Cumulonimbus (this webpage you're looking at right now)
        is written in Vue 3 and TypeScript. Click me to check it out on GitHub!
      </p>
    </ContentBox>
    <ContentBox
      title="Backend"
      to="https://github.com/AlekEagle/cumulonimbus-api"
    >
      <p>
        The backend of Cumulonimbus written in Node.js and TypeScript. Click me
        to check it out on GitHub!
      </p>
    </ContentBox>
    <ContentBox
      title="Thumbnailer"
      to="https://github.com/AlekEagle/cumulonimbus-thumbnailer"
    >
      <p>
        The thumbnail generation backend for Cumulonimbus written in Node.js and
        TypeScript. Click me to check it out on GitHub!
      </p>
    </ContentBox>
    <ContentBox
      title="Wrapper"
      to="https://github.com/AlekEagle/cumulonimbus-wrapper"
    >
      <p>
        The Cumulonimbus Wrapper is a wrapper for the Cumulonimbus API written
        in TypeScript, compatible with Node.js and the browser. Click me to
        check it out on GitHub!
      </p>
    </ContentBox>
    <ContentBox
      title="Documentation"
      to="https://github.com/AlekEagle/cumulonimbus-docs"
    >
      <p>
        The Cumulonimbus Documentation is a documentation website for the
        Cumulonimbus API, written using VuePress. Click me to check it out on
        GitHub!
      </p>
    </ContentBox>
  </div>
  <div class="content-box-container">
    <ContentBox title="Info">
      <template v-if="asOf">
        Updated: <code v-text="asOfTime" />
        <br />
        Frontend Version:
        <code v-text="`v${$version}`" />
        <br />
        Backend Version: <code v-text="`v${backendVersion}`" />
        <br />
        Thumbnailer Version: <code v-text="`v${thumbnailVersion}`" />
      </template>
      <p class="animated-ellipsis" v-else>Loading</p>
    </ContentBox>
    <ContentBox title="Dependencies" grow>
      <code v-html="dependencies" />
    </ContentBox>
    <ContentBox title="Development Dependencies" grow>
      <code v-html="devDependencies" />
    </ContentBox>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, computed, getCurrentInstance } from "vue";
import { useFuzzyTimeString } from "@/utils/time";
import ContentBox from "@/components/ContentBox.vue";
import Cumulonimbus from "cumulonimbus-wrapper";

const global = getCurrentInstance()?.appContext.config.globalProperties;
const backendVersion: Ref<string> = ref("Loading...");
const thumbnailVersion: Ref<string> = ref("Loading...");
const asOf = ref<Date | null | undefined>();
const asOfTime = useFuzzyTimeString(asOf, 30e3);
const dependencies = computed(() => {
  return Object.keys(global!.$dependencies)
    .map((key: string) => {
      return `${key}: ${global?.$dependencies[key]}`;
    })
    .join("<br />");
});
const devDependencies = computed(() => {
  return Object.keys(global!.$devDependencies)
    .map((key: string) => {
      return `${key}: ${global?.$devDependencies[key]}`;
    })
    .join("<br />");
});

async function update() {
  asOf.value = null;

  await Promise.all([
    (async () => {
      backendVersion.value = (await Cumulonimbus.apiSanity()).version;
    })(),
    (async () => {
      thumbnailVersion.value = (await Cumulonimbus.thumbnailSanity()).version;
    })(),
  ]);

  asOf.value = new Date();
}

onMounted(async () => {
  await update();
});
</script>
