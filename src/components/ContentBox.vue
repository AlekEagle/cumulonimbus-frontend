<template>
  <div
    :class="`content-box${props.disabled ? ' disabled' : ''}${
      span ? ' no-select' : ''
    }`"
  >
    <h2 class="title" v-text="props.title" />
    <img
      :class="`${props.themeSafe ? 'theme-safe' : ''}`"
      v-if="props.src"
      :src="props.src"
      width="80"
      height="80"
    />
    <div class="content-box-content">
      <slot>
        <p>Imagine leaving a content box empty</p>
      </slot>
    </div>
    <span class="content-box-overlay" v-if="span" @click="spanClicked">
      <a v-if="displayLink" :href="linkToDisplay" @click.prevent="linkClicked">
        <div />
      </a>
    </span>
  </div>
</template>

<script lang="ts" setup>
  import { computed, getCurrentInstance } from 'vue';
  import { useRouter } from 'vue-router';

  const emit = defineEmits(['click']),
    router = useRouter();

  const props = defineProps({
    title: {
      type: String,
      default: 'Imagine leaving the title empty'
    },
    src: {
      type: String,
      default: undefined
    },
    disabled: Boolean,
    to: {
      type: null,
      default: undefined
    },
    themeSafe: Boolean
  });

  const displayLink = computed(() => {
    return props.to !== undefined && props.to !== null && !props.disabled;
  });

  const linkToDisplay = computed(() => {
    if (props.to === undefined || props.to === null) {
      return undefined;
    } else if (typeof props.to === 'string') {
      return props.to;
    } else {
      return router.resolve(props.to).href;
    }
  });

  const span = computed(() => {
    return (
      !!getCurrentInstance()?.vnode?.props?.onClick ||
      displayLink.value ||
      props.disabled
    );
  });

  async function linkClicked() {
    if (props.disabled) return;
    // if the link is a string
    if (typeof props.to === 'string') {
      // if it is, check if its relative or absolute
      if (props.to.startsWith('/')) {
        // if it is, use the router to navigate to it
        await router.push(props.to);
      } else {
        // if it is not, use window.open to open it in a new tab
        window.open(props.to, '_blank');
      }
    } else {
      await router.push(props.to);
    }
  }

  async function spanClicked() {
    if (props.disabled) return;
    emit('click');
  }
</script>

<style>
  .content-box {
    display: grid;
    position: relative;
    grid: auto 1fr / 80px 4fr;
    gap: 5px;
    padding: 15px;
    border-radius: 10px;
    background-color: var(--ui-background);
    border: 1px solid var(--ui-border);
    transition: background-color 0.25s, border 0.25s;
  }

  .content-box.disabled {
    background-color: var(--ui-background-disabled);
    border: 1px solid var(--ui-border-disabled);
  }

  .content-box.no-select {
    user-select: none;
  }

  .content-box:hover:not(.disabled),
  .content-box:focus:not(.disabled),
  .content-box:focus-within:not(.disabled) {
    border-color: var(--ui-border-hover);
    background-color: var(--ui-background-hover);
  }

  .content-box:focus,
  .content-box:focus-within,
  .content-box:focus-within * {
    outline: none;
  }

  .content-box .title {
    justify-self: left;
    text-align: left;
    grid-row: 1 / span 1;
    grid-column: 1 / span 2;
    margin: 0;
  }

  .content-box > img,
  .content-box > div.lds-default {
    align-self: center;
    justify-self: left;
    grid-row: 2 / span 2;
    grid-column: 1 / 2;
    user-select: none;
    transition: filter 0.25s;
    margin-bottom: 5px;
  }

  html.dark-theme .content-box > img.theme-safe {
    filter: invert(100%);
  }

  .content-box .content-box-content {
    grid-row: 2 / span 2;
    grid-column: 1 / span 3;
    text-align: left;
    justify-self: left;
    align-self: center;
    margin-bottom: 5px;
    font-family: var(--font-body);
    font-size: 18px;
  }

  .content-box .content-box-content p {
    margin: 5px 0;
  }

  .content-box > img + .content-box-content,
  .content-box > div.lds-default + .content-box-content {
    grid-column: 2 / span 3;
    margin-left: 5px;
  }

  .content-box .content-box-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    border-radius: 10px;
    transition: backdrop-filter 0.25s, background-color 0.25s;
    cursor: pointer;
    z-index: 1;
    background-image: url('@/assets/images/empty.gif');
  }

  .content-box.disabled .content-box-overlay {
    backdrop-filter: blur(2px);
    cursor: not-allowed;
  }

  .content-box .content-box-overlay a div {
    width: 100%;
    height: 100%;
  }
</style>
