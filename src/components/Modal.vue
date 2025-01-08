<template>
  <transition name="modal">
    <div
      :class="{ 'modal-container': true, 'dismissible': dismissible }"
      v-if="visible"
      @click.self="__hide"
    >
      <div class="modal">
        <h1 class="modal-title" v-text="title" />
        <img
          class="modal-close"
          src="@/assets/images/close.svg"
          alt="Close Modal"
          v-if="dismissible"
          @click="__hide"
        />
        <div class="modal-content">
          <slot name="default"> Imagine leaving a modal empty </slot>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <button v-if="dismissible" @click="__hide" v-text="closeButton" />
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  import { wait } from '@/utils/wait';

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref, onBeforeUnmount } from 'vue';

  const emit = defineEmits(['close']);

  const {
    title = 'Modal Title',
    dismissible,
    closeButton = 'Close',
  } = defineProps<{
    title?: string;
    dismissible?: boolean;
    closeButton?: string;
  }>();

  const visible = ref(false);

  // Internal hide function, not to be used externally, use hide() instead
  function __hide() {
    if (!dismissible || !visible.value) return;
    visible.value = false;
    emit('close');
    wait(400);
  }

  // A hide function exposed that doesn't emit the closed event.
  async function hide() {
    visible.value = false;
    await wait(400);
    return;
  }

  async function show() {
    visible.value = true;
    await wait(400);
    return;
  }

  onBeforeUnmount(__hide);

  defineExpose({
    hide,
    show,
  });
</script>

<style>
  .modal-container {
    background-color: var(--ui-fs-overlay-background);
    transition: background-color 0.25s;
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 15;
    display: grid;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    cursor: not-allowed;
    overflow: auto;
    overscroll-behavior: contain;
  }

  .modal-container.dismissible {
    cursor: initial;
  }

  .modal {
    background-color: var(--ui-background);
    border: 1px solid var(--ui-border);
    transition: border 0.25s, background-color 0.25s;
    border-radius: 10px;
    display: grid;
    width: fit-content;
    height: fit-content;
    max-width: 80vw;
    padding: 25px 25px 25px;
    grid: auto 1fr auto / 1fr 40px;
    cursor: initial;
    margin: 50px 0;
    gap: 10px 5px;
  }

  .modal h1.modal-title {
    margin: 0;
    grid-row: 1 / span 1;
    grid-column: 1 / span 2;
    align-self: center;
    justify-self: center;
    user-select: none;
  }

  .modal-container.dismissible .modal h1.modal-title {
    grid-column: 1 / span 1;
  }

  .modal img.modal-close {
    grid-row: 1 / span 1;
    grid-column: 2 / span 2;
    width: 40px;
    height: 40px;
    align-self: stretch;
    justify-self: stretch;
    cursor: pointer;
    transition: filter 0.25s;
    user-select: none;
  }

  html.dark-theme .modal img.modal-close {
    filter: invert(100%);
  }

  .modal .modal-content {
    grid-row: 2 / span 1;
    grid-column: 1 / span 2;
    align-self: stretch;
    justify-self: stretch;
    text-align: center;
    font-family: var(--font-body);
    font-size: 18px;
    padding: 0 5px;
  }

  .modal .modal-content p,
  .modal .modal-content code {
    margin: 0;
    line-height: 1.5;
  }

  .modal .modal-footer {
    grid-row: 3 / span 1;
    grid-column: 1 / span 2;
    align-self: stretch;
    justify-self: stretch;
    display: grid;
    grid: auto / repeat(auto-fit, minmax(100px, 1fr));
    gap: 0 10px;
  }

  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.4s, backdrop-filter 0.4s, -webkit-backdrop-filter 0.4s;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .modal-enter-to,
  .modal-leave-from {
    opacity: 1;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }
</style>
