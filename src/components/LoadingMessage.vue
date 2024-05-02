<template>
  <span v-if="!spinner" class="loading-message"
    >{{ message }}<AnimatedEllipsis
  /></span>
  <div class="loading-message-container" v-else>
    <h1>{{ message }}<AnimatedEllipsis /></h1>
    <LoadingSpinner />
  </div>
</template>

<script lang="ts" setup>
  // Vue Components
  import AnimatedEllipsis from './AnimatedEllipsis.vue';
  import LoadingSpinner from './LoadingSpinner.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref, onMounted } from 'vue';

  const props = defineProps<{
    spinner?: boolean;
  }>();

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
    "Solving a Rubik's Cube",
    '(Creating unresolved tension',
    'Downloading more RAM',
    'Importing data from the future',
    'Downloading Club Penguin',
    'Downloading Minecraft',
    '/gamemode creative',
    'Mining diamonds',
    'Minting NFTs',
    'Never gonna give you up, never gonna let you down',
    'Wasting your time',
    'Changing the future',
    'Writing your horoscope',
    'Doomscrolling X (formerly Twitter)',
    'Selling your soul',
    'Reading your mind',
    'Deleting your DVR',
    'L + Ratio',
    'Organizing my desktop',
    ':)',
    'Stay hydrated',
    'Brush your teeth',
    'Playing with matches',
    'Posture check',
    'ChatGPT is at capacity, please try again later',
    'Manually breathing',
    'Manually blinking',
    "I'm running out of ideas",
    'Rearranging your furniture',
    'Watching Apple reinvent the wheel (again)',
    'Watching paint dry',
    'Watching grass grow',
    'Suing open source emulators for existing',
    'Drinking water',
    'Eating a sandwich',
    'Reinventing the wheel',
    'Watching Google sunset a product just to bring it back (again)',
  ];

  const message = ref<string>();

  onMounted(() => {
    message.value = messages[Math.floor(Math.random() * messages.length)];
  });
</script>

<style>
  .loading-message-container {
    display: grid;
    grid: auto auto / auto;
    justify-content: center;
    align-content: center;
    justify-items: center;
    cursor: progress;
  }

  .loading-message {
    cursor: progress;
  }
</style>
