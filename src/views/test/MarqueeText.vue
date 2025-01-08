<template>
  <Marquee
    :speed="2"
    edge-fade
    no-left-edge-fade
    :edge-fade-width="100"
    :overlap="12"
    :interval="6000"
  />
  <Marquee
    :acceleration="0.25"
    :speed="2"
    direction="right"
    edge-fade
    :edge-fade-width="50"
  />
  <!-- <Marquee direction="up"></Marquee>
  <Marquee direction="down"></Marquee> -->
</template>

<script setup lang="ts">
  // Vue Components
  import Marquee from '@/components/Marquee.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref } from 'vue';
</script>

<style></style>
