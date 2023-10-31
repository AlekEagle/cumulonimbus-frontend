<template>
  <template v-if="online">
    <slot name="default" />
  </template>
  <template v-else-if="!props.noMsg">
    <slot name="err-msg">
      <h2>You're offline, please connect to the internet to continue.</h2>
    </slot>
  </template>
</template>

<script lang="ts" setup>
  import { useOnline } from '@vueuse/core';

  const props = defineProps({
    noMsg: {
      type: Boolean,
      default: false,
    },
  });

  const online = useOnline();
</script>
