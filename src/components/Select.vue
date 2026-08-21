<template>
  <div class="select-wrapper">
    <select v-model="internalValue" v-bind="$attrs">
      <slot />
    </select>
  </div>
</template>

<script lang="ts" setup>
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { computed } from 'vue';

  defineOptions({
    inheritAttrs: false,
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void;
    (e: 'change', value: any): void;
  }>();

  const props = defineProps({
    modelValue: {
      type: null,
      default: '',
    },
  });

  const internalValue = computed({
    get: () => props.modelValue,
    set: (value) => {
      emit('update:modelValue', value);
      emit('change', value);
    },
  });
</script>

<style>
  select:not([multiple]) {
    padding-right: 40px;
  }

  .select-wrapper {
    position: relative;
    display: inline-block;
  }

  .select-wrapper::after {
    content: '';
    position: absolute;
    display: inline;
    top: 25%;
    right: 10px;
    background: url('@/assets/images/caret-up.svg') no-repeat center center;
    background-size: contain;
    width: 24px;
    height: 24px;
    pointer-events: none;
    rotate: 180deg;
  }

  html.dark-theme .select-wrapper::after {
    filter: invert(1);
  }

  .select-wrapper:has(select[multiple])::after {
    content: none;
  }
</style>
