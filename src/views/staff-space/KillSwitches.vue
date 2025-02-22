<template>
  <h1>Kill Switches</h1>
  <h2>Global feature kill switches and their current status.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/staff" />
    <button @click="restoreModal?.show()">Restore Endpoints</button>
  </div>

  <EmphasizedBox>
    <Online>
      <template v-if="killSwitches.data">
        <Switch
          v-for="sw in killSwitches.data.items"
          :title="`Endpoints guarded by ${sw.name} are ${
            sw.state ? 'not' : 'currently'
          } available.`"
          @defer="
            (event, cancelDefer) =>
              handleKillSwitchToggle(sw, event, cancelDefer)
          "
          :checked="!sw.state"
        >
          {{ sw.name }}
        </Switch>
      </template>
      <LoadingMessage spinner v-else />
    </Online>
  </EmphasizedBox>

  <FormModal
    ref="formModal"
    :title="`${selectedKillSwitch?.state ? 'Enable' : 'Disable'} ${
      selectedKillSwitch?.name
    }?`"
    :disabled="killSwitches.loading"
    @submit="commitKillSwitchToggle"
    @cancel="cancelKillSwitchToggle"
  >
    {{ selectedKillSwitch?.state ? 'Enabling' : 'Disabling' }}
    <code v-text="selectedKillSwitch?.name" /> will
    {{ selectedKillSwitch?.state ? 'ENABLE' : 'DISABLE' }} all endpoints guarded
    by it for standard users.
    <br />
    <br />
    Please enter your password to confirm this action.
    <br />
    <input
      type="password"
      placeholder="Your Password"
      name="password"
      required
      autocomplete="off"
      :disabled="killSwitches.loading"
    />
  </FormModal>
  <FormModal
    ref="restoreModal"
    title="Restore All Endpoints"
    :disabled="killSwitches.loading"
    @submit="disableAllKillSwitches"
  >
    Are you sure you want to restore all endpoints?
    <br />
    <br />
    Please enter your password to confirm this action.
    <br />
    <input
      type="password"
      placeholder="Your Password"
      name="password"
      required
      autocomplete="off"
      :disabled="killSwitches.loading"
    />
  </FormModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import FormModal from '@/components/FormModal.vue';
  import LoadingMessage from '@/components/LoadingMessage.vue';
  import Online from '@/components/Online.vue';
  import Switch from '@/components/Switch.vue';
  import EmphasizedBox from '@/components/EmphasizedBox.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import loadWhenOnline from '@/utils/loadWhenOnline';

  // Store Modules
  import { killSwitchesStore } from '@/stores/staff-space/killswitches';
  import { toastStore } from '@/stores/toast';

  // External Modules
  import { ref, onMounted } from 'vue';
  import { useOnline } from '@/utils/ConnectivityCheck';

  const killSwitches = killSwitchesStore(),
    online = useOnline(),
    toast = toastStore(),
    selectedKillSwitch = ref<Cumulonimbus.Data.KillSwitch | null>(null),
    cancelDeferFunc = ref<() => void>(),
    formModal = ref<InstanceType<typeof FormModal>>(),
    restoreModal = ref<InstanceType<typeof FormModal>>();

  async function fetchKillSwitchesState() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      await killSwitches.getKillSwitches();
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  onMounted(async () => {
    loadWhenOnline(fetchKillSwitchesState, !killSwitches.data);
  });

  async function handleKillSwitchToggle(
    killSwitch: Cumulonimbus.Data.KillSwitch,
    _: MouseEvent,
    cancelDefer: () => void,
  ) {
    selectedKillSwitch.value = killSwitch;
    cancelDeferFunc.value = cancelDefer;
    formModal.value?.show();
  }

  async function commitKillSwitchToggle({ password }: { password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      cancelKillSwitchToggle();
      return;
    }
    if (!selectedKillSwitch.value) {
      toast.clientError();
      cancelKillSwitchToggle();
      return;
    }
    try {
      if (selectedKillSwitch.value.state) {
        if (
          await killSwitches.disableKillSwitch(
            selectedKillSwitch.value.id,
            password,
          )
        ) {
          toast.show(`Enabled ${selectedKillSwitch.value.name} endpoints.`);
          formModal.value?.hide();
        }
      } else {
        if (
          await killSwitches.enableKillSwitch(
            selectedKillSwitch.value.id,
            password,
          )
        ) {
          toast.show(`Disabled ${selectedKillSwitch.value.name} endpoints.`);
          formModal.value?.hide();
        }
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
      cancelKillSwitchToggle();
    }
  }

  async function disableAllKillSwitches({ password }: { password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      if (await killSwitches.disableAllKillSwitches(password)) {
        toast.show(
          'Disabled all kill switches. All endpoints are now accessible.',
        );
        restoreModal.value?.hide();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function cancelKillSwitchToggle() {
    if (cancelDeferFunc.value) {
      cancelDeferFunc.value();
      cancelDeferFunc.value = undefined;
    }
  }
</script>

<style scoped>
  .switch-container {
    text-align: left;
    border: 1px solid var(--ui-border);
    border-width: 1px 0;
  }

  .switch-container:first-child {
    border-top-width: 0;
  }

  .switch-container:last-child {
    border-bottom-width: 0;
  }
</style>
