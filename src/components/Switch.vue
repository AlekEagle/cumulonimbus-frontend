<template>
  <div class="switch-container">
    <label>
      <input
        :class="{
          'toggle-state': true,
          'during-defer': duringDefer,
        }"
        type="checkbox"
        v-model="checked"
        :disabled="props.disabled || duringDefer"
        :name="props.name"
        @click="handleClick"
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
  import { ref, watch, computed, getCurrentInstance } from 'vue';

  // Props
  const props = defineProps({
    name: String,
    disabled: Boolean,
    checked: Boolean,
  });

  // Emit
  const emit = defineEmits<{
    (e: 'update:checked', value: boolean): void;
    (e: 'defer', event: MouseEvent, cancelDefer: () => void): void;
  }>();

  // Data
  const currentInstance = getCurrentInstance(),
    checked = ref(props.checked),
    duringDefer = ref(false),
    defer = computed(() => {
      if (!currentInstance) return false;
      return !!currentInstance.vnode.props?.onDefer;
    });

  // Watchers
  watch(
    () => props.checked,
    (value) => {
      checked.value = value;
      // If the switch is in a deferred state, we need to reset it.
      if (duringDefer.value) {
        duringDefer.value = false;
      }
    },
  );

  watch(
    () => checked.value,
    (value) => {
      emit('update:checked', value);
    },
  );

  // In case the parent component wants to cancel the defer.
  function cancelDefer() {
    duringDefer.value = false;
  }

  function handleClick(event: MouseEvent) {
    const input = event.target as HTMLInputElement;
    if (input.disabled) return;
    if (defer.value) {
      duringDefer.value = true;
      event.preventDefault();
      emit('defer', event, cancelDefer);
    } else input.blur();
  }
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
    --switch-knob-disabled: #141414;
    --switch-track-disabled: #343434;
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
    background: linear-gradient(
      to right,
      var(--logo-color-top) 7%,
      var(--logo-color-bottom) 50%,
      var(--switch-track) 50%,
      var(--switch-track) 100%
    );
    background-size: 150% 100%;
    background-repeat: no-repeat;
    background-position: 100%;
    transition: background-position 0.25s;
  }

  .switch-container label .toggle-state {
    opacity: 0;
    position: absolute;
  }

  .switch-container label .toggle-state ~ .toggle .indicator {
    height: 100%;
    width: 50%;
    background-color: var(--switch-knob);
    border-radius: 15px;
    transform: translate(0, 0);
    box-shadow: 0px 0px 10px 0px var(--switch-shadow);
    transition: transform 0.25s, background-color 0.25s;
  }

  .switch-container label .toggle-state:checked ~ .toggle {
    background-position: 0%;
  }

  .switch-container label .toggle-state:disabled ~ .toggle {
    background-image: linear-gradient(
      to right,
      var(--logo-color-top) 7%,
      var(--logo-color-bottom) 50%,
      var(--switch-track-disabled) 50%,
      var(--switch-track-disabled) 100%
    );
    cursor: not-allowed;
  }

  .switch-container label .toggle-state:disabled ~ .toggle .indicator {
    background-color: var(--switch-knob-disabled);
    box-shadow: none;
  }

  .switch-container label:active:hover .toggle-state ~ .toggle,
  .switch-container label:focus-within .toggle-state ~ .toggle,
  .switch-container label .toggle-state.during-defer ~ .toggle {
    background-position: 87%;
  }

  .switch-container label:active:hover .toggle-state ~ .toggle .indicator,
  .switch-container label:focus-within .toggle-state ~ .toggle .indicator,
  .switch-container label .toggle-state.during-defer ~ .toggle .indicator {
    transform: translate(12%, 0);
  }

  .switch-container label:active:hover .toggle-state:checked ~ .toggle,
  .switch-container label:focus-within .toggle-state:checked ~ .toggle,
  .switch-container label .toggle-state.during-defer:checked ~ .toggle {
    background-position: 12%;
  }

  .switch-container
    label:active:hover
    .toggle-state:checked
    ~ .toggle
    .indicator,
  .switch-container
    label:focus-within
    .toggle-state:checked
    ~ .toggle
    .indicator,
  .switch-container
    label
    .toggle-state.during-defer:checked
    ~ .toggle
    .indicator {
    transform: translate(87%, 0);
  }

  .switch-container label .toggle-state:checked ~ .toggle .indicator {
    transform: translate(100%, 0);
  }
</style>
