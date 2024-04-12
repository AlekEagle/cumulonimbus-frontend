<template>
  <ConfirmModal ref="confirmModal" title="Verify Your Identity">
    <p>You're gonna need to prove your identity bub.</p>
  </ConfirmModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import ConfirmModal from './ConfirmModal.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { startAuthentication } from '@simplewebauthn/browser';
  import { ref } from 'vue';

  const confirmModal = ref<InstanceType<typeof ConfirmModal>>(),
    currentFactor = ref<'totp' | 'webauthn' | 'backup'>('totp');

  async function show() {
    await confirmModal.value!.show();
  }

  async function hide() {
    await confirmModal.value!.hide();
  }

  // Export the functions and variables to be used in the template.
  defineExpose({
    show,
    hide,
  });
</script>
