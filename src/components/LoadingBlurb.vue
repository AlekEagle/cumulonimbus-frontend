<template>
  <h1 class="animated-ellipsis" v-text="message" />
  <Loading />
</template>

<script lang="ts" setup>
  import Loading from './Loading.vue';
  import { ref, onMounted } from 'vue';

  const messages = [
    'Loading',
    'Counting to ten',
    'Eating your cookies',
    'Making BREW request',
    "Error 418: I'm a teapot",
    'Playing Tic-Tac-Toe',
    'Doing nothing',
    'Totally loading',
    'Baking a cake',
    'Baking cookies',
    'Attempting to care',
    'Sleeping',
    'Planting a tree',
    'Picking some flowers',
    'Finding four leaf clovers',
    'Finding a unicorn',
    'Building suspense',
    'Not not loading',
    'Deleting .minecraft',
    'Deleting system32',
    'Running rm -rf /*',
    'Guessing your password',
    'Solving the riddle',
    'Browsing r/programmerhumor',
    'Speedrunning Calculator',
    'Mining crypto',
    '(╯°□°)╯︵ ┻━┻',
    "Solving the Rubik's Cube",
    '(Creating unresolved tension',
    'Downloading more RAM',
    'Importing data from the future',
    'Downloading Club Penguin',
    'Downloading Minecraft',
    '/gamemode creative',
    'Mining diamonds',
    'Minting NFTs'
  ];

  const message = ref<string>();

  onMounted(() => {
    message.value = messages[Math.floor(Math.random() * messages.length)];
  });
</script>
