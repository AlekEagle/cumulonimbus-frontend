<template>
  <template v-if="online">
    <slot name="default" />
  </template>
  <template v-else-if="!noMsg">
    <slot name="err-msg">
      <h2>You're offline, please connect to the internet to continue.</h2>
    </slot>
  </template>
</template>

<script lang="ts" setup>
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { useOnline } from '@/utils/ConnectivityCheck.js';

  const { noMsg } = defineProps<{
    noMsg?: boolean;
  }>();

  const online = useOnline();
</script>
