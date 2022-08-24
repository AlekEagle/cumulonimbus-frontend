<template>
  <div class="content-box no-select">
    <div class="content-box-inner">
      <h2 class="title" v-text="props.title" />
      <template v-if="!props.selected">
        <img
          :class="`${props.themeSafe ? 'theme-safe' : ''}`"
          v-if="props.src"
          :src="props.src"
          width="80"
          height="80"
        />
      </template>
      <img
        v-else
        class="theme-safe"
        src="@/assets/images/checkmark.svg"
        width="80"
        height="80"
      />
      <div class="content-box-content" v-if="!props.selecting">
        <slot> imagine leaving this empty </slot>
      </div>
      <div class="content-box-content" v-else>
        Click me to select or deselect this item.
      </div>
    </div>
    <span class="content-box-overlay" @click="spanClicked">
      <div />
    </span>
  </div>
</template>

<script lang="ts" setup>
  import './ContentBox.vue';

  const emit = defineEmits<{
    (event: 'click'): void;
  }>();

  const props = defineProps({
    title: {
      type: String,
      default: 'Imagine leaving the title empty'
    },
    src: {
      type: String,
      default: undefined
    },
    selecting: Boolean,
    selected: Boolean,
    themeSafe: Boolean
  });

  async function spanClicked() {
    emit('click');
  }
</script>
