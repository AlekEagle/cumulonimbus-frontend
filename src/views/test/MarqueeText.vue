<template>
  <Marquee>
    <p>This is a standard marquee.</p>
  </Marquee>
  <Marquee direction="reverse">
    <p>This is a reversed marquee.</p>
  </Marquee>

  <Separator />

  <Marquee clone>
    <p>This is a standard cloned marquee.</p>
  </Marquee>
  <Marquee clone direction="reverse">
    <p>This is a reversed cloned marquee.</p>
  </Marquee>

  <Separator />

  <div class="vertical-marquee-container">
    <Marquee vertical>
      <p>This is a vertical marquee.</p>
    </Marquee>
  </div>
  <div class="vertical-marquee-container">
    <Marquee vertical direction="reverse">
      <p>This is a reversed vertical marquee.</p>
    </Marquee>
  </div>

  <Separator />

  <div class="vertical-marquee-container">
    <Marquee vertical clone>
      <p>This is a vertical cloned marquee.</p>
    </Marquee>
  </div>
  <div class="vertical-marquee-container">
    <Marquee vertical clone direction="reverse">
      <p>This is a reversed vertical cloned marquee.</p>
    </Marquee>
  </div>

  <Separator />

  <Marquee gradient>
    <p>This is a gradient marquee.</p>
  </Marquee>
  <Marquee gradient direction="reverse">
    <p>This is a reversed gradient marquee.</p>
  </Marquee>

  <Separator />

  <Marquee gradient clone>
    <p>This is a gradient cloned marquee.</p>
  </Marquee>
  <Marquee gradient clone direction="reverse">
    <p>This is a reversed gradient cloned marquee.</p>
  </Marquee>

  <Separator />

  <div class="vertical-marquee-container">
    <Marquee gradient vertical>
      <p>This is a vertical gradient marquee.</p>
    </Marquee>
  </div>
  <div class="vertical-marquee-container">
    <Marquee gradient vertical direction="reverse">
      <p>This is a reversed vertical gradient marquee.</p>
    </Marquee>
  </div>

  <Separator />

  <div class="vertical-marquee-container">
    <Marquee gradient clone vertical>
      <p>This is a vertical gradient cloned marquee.</p>
    </Marquee>
  </div>
  <div class="vertical-marquee-container">
    <Marquee gradient clone vertical direction="reverse">
      <p>This is a reversed vertical gradient cloned marquee.</p>
    </Marquee>
  </div>
</template>

<script setup lang="ts">
  // Vue Components
  import Marquee from '@/components/Marquee.vue';
  import Separator from '@/components/Separator.vue';

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

  .vertical-marquee-container {
    height: 100px;
  }
</style>
