<template>
  <div :class="`box${props.noPadding ? ' no-padding' : ''}`">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  noPadding: Boolean,
});
</script>

<style>
.box {
  width: fit-content;
  min-width: 5rem;
  max-width: 80vw;
  padding: 1rem 5vw;
  margin: 10vh auto 20px;
  border-radius: 1rem;
  background-color: var(--background);
  border: 1px solid var(--ui-border);
  word-wrap: break-word;
  box-shadow: 0px 0px 75px 20px var(--logo-shadow);
  transition: background-color 0.25s, border 0.25s, box-shadow 0.25s;
}

.box.no-padding {
  padding: 0;
}
</style>
