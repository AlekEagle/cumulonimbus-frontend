<template>
  <span class="checkmark-container">
    <label class="checkmark-box" :class="{ checked }">
      <input
        ref="checkbox"
        type="checkbox"
        :name="name"
        v-model="checked"
        @change="emit('change')"
      />
      <svg class="checkmark" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12.5 L10 17.5 L19 7" />
      </svg>
    </label>
    <p
      v-if="$slots.default"
      class="checkmark-label"
      @click.self="checked = !checked"
    >
      <slot />
    </p>
  </span>
</template>

<script setup lang="ts">
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref, watch } from 'vue';

  const checked = ref(false);

  const props = defineProps<{
    checked?: boolean;
    name?: string;
  }>();

  watch(
    () => props.checked,
    (newVal) => {
      if (newVal !== undefined) {
        checked.value = newVal;
      }
    },
    { immediate: true },
  );

  const emit = defineEmits<{
    (e: 'change'): void;
  }>();
</script>

<style>
  .checkmark-container {
    display: inline-flex;
    align-items: center;
    margin: 0.5rem 0;
    cursor: pointer;
  }
  .checkmark-box {
    display: inline-flex;
    position: relative;
    justify-content: center;
    font-size: 22px;
    top: 0;
    left: -5px;
    height: 25px;
    width: 25px;
    align-items: center;
    background-color: var(--ui-background);
    border: 1px solid var(--ui-border);
    border-radius: 10px;
    overflow: hidden;
    transition: border 0.25s;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
  }

  .checkmark-box:hover {
    border: 1px solid var(--ui-border-hover);
  }

  .checkmark-box input {
    position: absolute;
    opacity: 0;
    z-index: 1;
    height: 0;
    width: 0;
  }

  .checkmark-box::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(
      to top,
      var(--logo-color-bottom),
      var(--logo-color-top)
    );
    opacity: 0;
    transition: opacity 0.4s cubic-bezier(0.78, 0, 0.22, 1);
  }

  .checkmark-box.checked::before {
    opacity: 1;
  }

  .checkmark {
    position: relative;
    width: 20px;
    height: 20px;
    fill: none;
    stroke: var(--ui-foreground);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 25;
    stroke-dashoffset: 25;
    transition: stroke-dashoffset 0.4s cubic-bezier(0.78, 0, 0.22, 1);
    pointer-events: none;
  }

  .checkmark-box.checked .checkmark {
    stroke-dashoffset: 0;
  }

  .checkmark-label {
    display: inline;
    margin: 0 0 0 0.25rem;
    font-weight: 600;
    font-size: 20px;
    font-family: var(--font-heading);
    color: var(--ui-foreground);
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
  }
</style>
