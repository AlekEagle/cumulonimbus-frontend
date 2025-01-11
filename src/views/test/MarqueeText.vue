<template>
  <Marquee gradient :duration="3">
    <p>this is a marquee</p>
  </Marquee>
  <Marquee gradient direction="reverse" :duration="5">
    <p>this is a marquee</p>
  </Marquee>
  <Marquee gradient vertical :duration="5">
    <p>this is a marquee</p>
  </Marquee>
  <Marquee gradient direction="reverse" vertical :duration="5">
    <p>this is a marquee</p>
  </Marquee>
</template>

<script setup lang="ts">
  // Vue Components
  import Marquee from '@/components/Marquee.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  // No External Modules to import here.
</script>

<style>
  .marquee p {
    white-space: nowrap;
    margin: 0 1rem;
  }
</style>
