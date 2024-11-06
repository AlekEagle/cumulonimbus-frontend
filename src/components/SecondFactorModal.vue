<template>
  <FormModal
    ref="confirmModal"
    title="Verify Your Identity"
    @submit="
      secondFactorChallenger.selectedMethod === 'webauthn'
        ? startWebAuthn()
        : secondFactorChallenger.completeChallenge($event.code)
    "
    @cancel="secondFactorChallenger.cancelChallenge"
    confirm-button="It's Me!"
  >
    <template v-if="secondFactorChallenger.selectedMethod === 'totp'">
      <p>Please enter the code from your authenticator app.</p>
      <input
        type="text"
        placeholder="6-Digit Code"
        name="code"
        autocomplete="off"
        maxlength="6"
        required
      />
    </template>
    <template v-else-if="secondFactorChallenger.selectedMethod === 'webauthn'">
      <p>When you're ready, click "It's Me!" and touch your security key.</p>
    </template>
    <template v-else-if="secondFactorChallenger.selectedMethod === 'backup'">
      <p>Please enter one of your backup codes.</p>
      <input
        type="text"
        placeholder="Backup Code"
        name="code"
        autocomplete="off"
        required
      />
    </template>
    <template v-else>
      <p>I am broken.</p>
    </template>
    <template #after-form>
      <div class="factor-switcher">
        <button
          v-if="
            secondFactorChallenger.selectedMethod !== 'totp' &&
            secondFactorChallenger.availableMethods.includes('totp')
          "
          @click="secondFactorChallenger.selectedMethod = 'totp'"
        >
          Use Authenticator App
        </button>
        <button
          v-if="
            secondFactorChallenger.selectedMethod !== 'webauthn' &&
            secondFactorChallenger.availableMethods.includes('webauthn')
          "
          @click="secondFactorChallenger.selectedMethod = 'webauthn'"
        >
          Use Security Key
        </button>
        <button
          v-if="
            secondFactorChallenger.selectedMethod !== 'backup' &&
            secondFactorChallenger.availableMethods.includes('backup')
          "
          @click="secondFactorChallenger.selectedMethod = 'backup'"
        >
          Use Backup Code
        </button>
      </div>
    </template>
  </FormModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import FormModal from './FormModal.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  import { toastStore } from '@/stores/toast';
  import { secondFactorChallengerStore } from '@/stores/secondFactorChallenger';

  // External Modules
  import { startAuthentication } from '@simplewebauthn/browser';
  import { ref, watch } from 'vue';

  const confirmModal = ref<InstanceType<typeof FormModal>>(),
    toast = toastStore(),
    secondFactorChallenger = secondFactorChallengerStore();

  watch(secondFactorChallenger, (value) => {
    if (value.isChallenging) {
      confirmModal.value!.show();
    } else {
      confirmModal.value!.hide();
    }
  });

  async function startWebAuthn() {
    if (!secondFactorChallenger.webauthnChallenge) {
      throw new Error('No webauthn challenge available.');
    }
    try {
      const credential = await startAuthentication({
        optionsJSON: secondFactorChallenger.webauthnChallenge,
      });
      secondFactorChallenger.completeChallenge(credential);
    } catch (error) {
      console.error(error);
      toast.show(
        'Whoops! Something went wrong while trying to authenticate with your security key.',
      );
    }
  }
</script>

<style scoped>
  .factor-switcher {
    grid-row: 3 / span 1;
    grid-column: 1 / span 2;
    align-self: stretch;
    justify-self: stretch;
    display: grid;
    grid: auto / repeat(auto-fit, minmax(100px, 1fr));
    gap: 0 10px;
  }
</style>
