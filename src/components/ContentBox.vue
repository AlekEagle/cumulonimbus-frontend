<template>
  <div :class="`content-box${props.disabled ? ' disabled' : ''}`">
    <img v-if="props.src" :src="props.src" />
    <h2 class="title" v-text="props.title" />
    <div class="content-box-content">
      <slot>
        <p>Imagine leaving a content box empty</p>
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
const props = defineProps({
  title: {
    type: String,
    default: "Content Box Title",
  },
  src: {
    type: String,
    default: undefined,
  },
  disabled: Boolean,
});
</script>

<style>
.content-box {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 10px repeat(2, 1fr);
  grid-template-areas:
    "title title title"
    "none content content"
    "none content content";
}

.content-box .title {
  grid-area: title;
  align-self: center;
  justify-self: center;
}

.content-box .content-box-content {
  grid-area: content;
}
</style>
