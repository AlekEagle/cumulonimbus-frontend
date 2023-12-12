<template>
  <div class="switch-container">
    <label>
      <input
        class="toggle-state"
        type="checkbox"
        v-model="checked"
        :disabled="props.disabled"
        :name="props.name"
        @click="($event.target as HTMLInputElement).blur()"
      />
      <div class="toggle">
        <div class="indicator" />
      </div>
      <div class="label">
        <slot />
      </div>
    </label>
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
  import { ref, watch } from 'vue';

  // Props
  const props = defineProps({
    name: String,
    disabled: Boolean,
    checked: Boolean,
  });

  // Emit
  const emit = defineEmits(['update:checked']);

  // Data
  const checked = ref(props.checked);

  // Watchers
  watch(
    () => props.checked,
    (value) => {
      checked.value = value;
    },
  );

  watch(
    () => checked.value,
    (value) => {
      emit('update:checked', value);
    },
  );
</script>

<style>
  html {
    --switch-knob: #808080;
    --switch-track: #bfbfbf;
    --switch-shadow: #404040;
    --switch-knob-disabled: #404040;
    --switch-track-disabled: #808080;
  }

  html.dark-theme {
    --switch-knob: #343434;
    --switch-track: #545454;
    --switch-shadow: #000000;
  }

  .switch-container {
    display: block;
    position: relative;
  }

  .switch-container label {
    display: inline-flex;
    align-items: center;
    border-radius: 20px;
    margin: 0.5rem 0;
  }

  .switch-container label .label {
    font-family: var(--font-heading);
    font-weight: 600;
    color: var(--foreground);
    margin-left: 0.5rem;
    font-size: 20px;
    transition: color 0.25s;
  }

  .switch-container label .toggle {
    isolation: isolate;
    position: relative;
    height: 30px;
    width: 60px;
    border-radius: 15px;
    overflow: hidden;
    cursor: pointer;
    background-color: var(--switch-track);
    transition: background-color 0.25s;
  }

  .switch-container label .toggle-state {
    opacity: 0;
    position: absolute;
  }

  .switch-container label .toggle-state + .toggle .indicator {
    height: 100%;
    width: 200%;
    background-color: var(--switch-knob);
    border-radius: 15px;
    transform: translate3d(-75%, 0, 0);
    box-shadow: 0px 0px 10px 0px var(--switch-shadow);
    transition: transform 0.4s cubic-bezier(0.85, 0.05, 0.18, 1.35),
      background-color 0.25s, box-shadow 0.25s;
  }

  .switch-container label .toggle-state:disabled + .toggle {
    background-color: var(--switch-track-disabled);
    cursor: not-allowed;
  }

  .switch-container label .toggle-state:disabled + .toggle .indicator {
    background-color: var(--switch-knob-disabled);
    box-shadow: none;
  }

  .switch-container label:active:hover .toggle-state + .toggle .indicator,
  .switch-container label:focus-within .toggle-state + .toggle .indicator {
    transform: translate3d(-65%, 0, 0);
  }

  .switch-container
    label:active:hover
    .toggle-state:checked
    + .toggle
    .indicator,
  .switch-container
    label:focus-within
    .toggle-state:checked
    + .toggle
    .indicator {
    transform: translate3d(15%, 0, 0);
  }

  .switch-container label .toggle-state:checked + .toggle .indicator {
    transform: translate3d(25%, 0, 0);
  }
</style>
