<template>
  <div
    :class="`content-box${props.disabled ? ' disabled' : ''}${
      isClickTarget ? ' click-target' : ''
    }${props.nowrap ? ' nowrap' : ''}${props.grow ? ' grow-content' : ''}`"
    v-if="!displayLink"
    @click="contentBoxClicked"
  >
    <div class="content-box-inner">
      <h3 class="title" v-text="props.title" />
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
    </div>
  </div>
  <a
    v-else
    :class="`content-box${props.disabled ? ' disabled' : ''}${
      isClickTarget ? ' click-target' : ''
    }${props.nowrap ? ' nowrap' : ''}${props.grow ? ' grow-content' : ''}`"
    :href="linkToDisplay"
    @click.prevent="linkClicked"
  >
    <div class="content-box-inner">
      <h3 class="title" v-text="props.title" />
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
    </div>
  </a>
</template>

<script lang="ts" setup>
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { computed, getCurrentInstance } from 'vue';
  import { useRouter } from 'vue-router';

  const emit = defineEmits(['click']),
    router = useRouter();

  const props = defineProps({
    title: {
      type: String,
      default: 'Imagine leaving the title empty',
    },
    src: {
      type: String,
      default: undefined,
    },
    disabled: Boolean,
    to: {
      type: null,
      default: undefined,
    },
    themeSafe: Boolean,
    nowrap: Boolean,
    grow: Boolean,
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

  const isClickTarget = computed(() => {
    return (
      !!getCurrentInstance()?.vnode?.props?.onClick ||
      displayLink.value ||
      props.disabled
    );
  });

  function isExternal(url: string) {
    return ( ( url.indexOf(':') > -1 || url.indexOf('//') > -1 ) );
  }

  async function linkClicked() {
    if (props.disabled) return;
    // if the link is a string
    if (typeof props.to === 'string') {
      // if it is, check if its relative or absolute
      if (!isExternal(props.to)) 
        // if it is, use the router to navigate to it
        await router.push(props.to);
       else 
        // if it is not, use window.open to open it in a new tab
        window.open(props.to, '_blank');
      
    } else {
      await router.push(props.to);
    }
  }

  async function contentBoxClicked() {
    if (props.disabled) return;
    emit('click');
  }
</script>

<style>
  .content-box {
    position: relative;
    padding: 15px;
    border-radius: 10px;
    background-color: var(--ui-background);
    border: 1px solid var(--ui-border);
    transition: background-color 0.25s, border 0.25s;
    overflow-y: hidden;
  }

  .content-box-inner {
    display: grid;
    grid: auto 1fr / 80px 4fr;
    gap: 5px;
  }

  .content-box.disabled {
    background-color: var(--ui-background-disabled);
    border: 1px solid var(--ui-border-disabled);
    cursor: not-allowed;
  }

  .content-box.click-target {
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
  }

  .content-box.click-target:not(.disabled) {
    cursor: pointer;
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

  .content-box > .content-box-inner .title {
    justify-self: left;
    text-align: left;
    grid-row: 1 / span 1;
    grid-column: 1 / span 2;
    margin: 0;
    transition: color 0.25s;
    color: var(--ui-foreground);
    padding-right: 15px;
  }

  .content-box.disabled > .content-box-inner .title {
    color: var(--ui-foreground-disabled);
  }

  .content-box > .content-box-inner > img,
  .content-box > .content-box-inner > div.lds-default {
    align-self: center;
    justify-self: left;
    grid-row: 2 / span 2;
    grid-column: 1 / 2;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    transition: filter 0.25s;
    margin-bottom: 5px;
  }

  html.dark-theme .content-box > .content-box-inner > img.theme-safe {
    filter: invert(100%);
  }

  .content-box > .content-box-inner .content-box-content {
    grid-row: 2 / span 2;
    grid-column: 1 / span 3;
    text-align: left;
    justify-self: left;
    align-self: center;
    margin-bottom: 5px;
    padding-right: 15px;
    font-family: var(--font-body);
    font-size: 18px;
    overflow: auto hidden;
    transition: color 0.25s;
    color: var(--ui-foreground);
  }

  .content-box.disabled > .content-box-inner .content-box-content {
    color: var(--ui-foreground-disabled);
  }

  .content-box > .content-box-inner .content-box-content p,
  .content-box > .content-box-inner .content-box-content code,
  .content-box > .content-box-inner .content-box-content {
    margin: 0;
    line-height: 1.5;
  }

  .content-box > .content-box-inner .content-box-content code,
  .content-box.nowrap > .content-box-inner .content-box-content {
    white-space: nowrap;
  }

  .content-box > .content-box-inner .content-box-content > code:only-child {
    width: calc(100% - 20px);
  }

  .content-box.grow-content > .content-box-inner .content-box-content {
    grid-column: 1 / span 2;
    width: 100%;
  }

  .content-box > .content-box-inner > img + .content-box-content,
  .content-box > .content-box-inner > div.lds-default + .content-box-content {
    grid-column: 2 / span 3;
    margin-left: 5px;
  }
</style>
