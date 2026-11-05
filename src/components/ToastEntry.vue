<template>
  <div :class="{ toast: true, [toast!.type]: true }" v-if="visible">
    <p v-text="displayedText" />
    <div class="dismiss-toast" @click="hideNow">
      <img src="!/images/close.svg" alt="Close" />
    </div>
  </div>
</template>

<script setup lang="ts">
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  import { addSeconds, useTimeString } from '#/time.js';
  import { whileInWindow } from '#/wait.js';

  // Store Modules
  import { toastStore, type Toast } from '$/toast.js';

  // External Modules
  import { computed, ref, onMounted } from 'vue';

  const toastS = toastStore();

  const props = defineProps<{
    toast: string;
  }>();

  const toast = ref<Toast>(),
    toastActive = whileInWindow(
      () => toast.value?.createdAt,
      () => toast.value?.duration,
      50,
    ),
    shouldHideNow = ref(false),
    destructionTimer = ref<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    ),
    displayedText = computed(() => {
      const t = toast.value;

      if ('cRE' in t! && t.cRE?.ratelimit) {
        // 1. Calculate static reset target
        const resetDate = addSeconds(new Date(), t.cRE.ratelimit.reset);
        const secondsRemaining = Math.ceil(
          (resetDate.getTime() - Date.now()) / 1000,
        );

        // 2. Safely call your composable in an active component setup context
        const toTimeString = useTimeString(
          ref(resetDate),
          1000,
          Math.min(secondsRemaining * 1000, 10000),
        );

        // 3. Evaluate the reactive string value
        return toTimeString.value === 'Now'
          ? 'Go ahead and try again now!'
          : `You are being rate limited! Please wait ${toTimeString.value} before trying again.`;
      } else if ('text' in t!) {
        return t.text;
      } else {
        throw new Error('what the fuck');
      }
    }),
    visible = computed(
      () => !!toast.value && !shouldHideNow.value && toastActive.value,
    );

  onMounted(() => {
    toast.value = toastS.toasts[props.toast];
    toast.value.createdAt = Date.now();
    // Begin our own destruction timer for this toast instance
    destructionTimer.value = setTimeout(() => {
      toastS.hide(props.toast);
    }, toast.value?.duration + 100);
  });

  function hideNow() {
    shouldHideNow.value = true;
    clearTimeout(destructionTimer.value);
    destructionTimer.value = undefined;
    setTimeout(() => toastS.hide(props.toast), 300);
  }
</script>

<style scoped>
  .toast {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 0.75rem 0.5rem 1rem;
    border-radius: 9em;
    /* Background color is determined by the toast type */
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    width: fit-content;
  }

  .toast.success {
    background-color: rgb(26, 157, 26);
  }

  .toast.warning {
    background-color: rgb(255, 194, 11);
    color: black;
  }

  .toast.error {
    background-color: red;
  }

  .toast.info {
    background-color: rgb(0, 143, 182);
  }

  .toast .dismiss-toast {
    cursor: pointer;
    width: 1rem;
    height: 1rem;
    margin-left: 1rem;
  }

  .toast .dismiss-toast img {
    width: 100%;
    height: 100%;
    display: block;
    filter: invert(1);
  }

  .toast.warning .dismiss-toast img {
    filter: invert(0);
  }

  .toast p {
  }
</style>
