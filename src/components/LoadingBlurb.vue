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
    'Not not loading'
  ];

  const message = ref<string>();

  onMounted(() => {
    message.value = messages[Math.floor(Math.random() * messages.length)];
  });
</script>
