<template>
  <div class="loading-blurb-container">
    <h1 class="animated-ellipsis" v-text="message" />
    <Loading />
  </div>
</template>

<script lang="ts" setup>
import Loading from "./Loading.vue";
import { ref, onMounted } from "vue";

const messages = [
  "Loading",
  "Counting to ten",
  "Eating your cookies",
  "Making BREW request",
  "Error 418: I'm a teapot",
  "Playing Tic-Tac-Toe",
  "Doing nothing",
  "Totally loading",
  "Baking a cake",
  "Baking cookies",
  "Attempting to care",
  "Sleeping",
  "Planting a tree",
  "Picking some flowers",
  "Finding four leaf clovers",
  "Finding a unicorn",
  "Building suspense",
  "Not not loading",
  "Deleting .minecraft",
  "Deleting system32",
  "Running rm -rf /*",
  "Guessing your password",
  "Solving the riddle",
  "Browsing r/programmerhumor",
  "Speedrunning Calculator",
  "Mining crypto",
  "(╯°□°)╯︵ ┻━┻",
  "Solving a Rubik's Cube",
  "(Creating unresolved tension",
  "Downloading more RAM",
  "Importing data from the future",
  "Downloading Club Penguin",
  "Downloading Minecraft",
  "/gamemode creative",
  "Mining diamonds",
  "Minting NFTs",
  "Never gonna give you up, never gonna let you down",
  "Wasting your time",
  "Changing the future",
  "Writing your horoscope",
  "Doomscrolling X (formerly Twitter)",
  "Selling your soul",
  "Reading your mind",
  "Deleting your DVR",
  "L + Ratio",
  "Organizing my desktop",
  ":)",
  "Stay hydrated",
  "Brush your teeth",
  "Playing with matches",
  "Posture check",
  "ChatGPT is at capacity, please try again later",
  "Manually breathing",
  "Manually blinking",
  "I'm running out of ideas",
];

const message = ref<string>();

onMounted(() => {
  message.value = messages[Math.floor(Math.random() * messages.length)];
});
</script>

<style>
.loading-blurb-container {
  display: grid;
  grid: auto auto / auto;
  justify-content: center;
  align-content: center;
  justify-items: center;
  cursor: progress;
}
</style>
