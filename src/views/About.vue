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
  </div>
  <div class="content-box-container">
    <ContentBox title="Version">
      Frontend: <code v-text="$version" />
      <br />
      Backend: <code v-text="backendVersion" />
      <br />
      Thumbnailer: <code v-text="thumbnailVersion" />
    </ContentBox>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted } from "vue";
import ContentBox from "@/components/ContentBox.vue";
import Cumulonimbus from "cumulonimbus-wrapper";

const backendVersion: Ref<string> = ref("Loading...");
const thumbnailVersion: Ref<string> = ref("Loading...");

onMounted(async () => {
  backendVersion.value = (await Cumulonimbus.apiSanity()).version;
  thumbnailVersion.value = (await Cumulonimbus.thumbnailSanity()).version;
});
</script>
