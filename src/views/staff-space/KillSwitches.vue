<template>
  <h1>Kill Switches</h1>
  <h2>
    Global feature kill switches and their current status.
    <br />
    (Ctrl+click to toggle without confirmation.)
  </h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/staff" />
    <button @click="disableAllKillSwitches">Restore Endpoints</button>
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

  <ConfirmModal
    ref="confirmModal"
    :title="`${selectedKillSwitch?.state ? 'Enable' : 'Disable'} ${
      selectedKillSwitch?.name
    }?`"
  >
    <template #default>
      <h4>
        {{ selectedKillSwitch?.state ? 'Enabling' : 'Disabling' }}
        <code v-text="selectedKillSwitch?.name" /> will
        {{ selectedKillSwitch?.state ? 'ENABLE' : 'DISABLE' }} all endpoints
        guarded by it for standard users.
        <br />
        <br />
        Are you sure you want to proceed?
      </h4>
    </template>
  </ConfirmModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
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
  import { useOnline } from '@vueuse/core';
  import LoadingMessage from '@/components/LoadingMessage.vue';

  const killSwitches = killSwitchesStore(),
    online = useOnline(),
    toast = toastStore(),
    selectedKillSwitch = ref<Cumulonimbus.Data.KillSwitch | null>(null),
    confirmModal = ref<InstanceType<typeof ConfirmModal>>();

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
    event: MouseEvent,
    cancelDefer: () => void,
  ) {
    if (!online.value) {
      toast.connectivityOffline();
      cancelDefer();
      return;
    }
    selectedKillSwitch.value = killSwitch;
    if (!event.ctrlKey && !(await confirmModal.value?.confirm())) {
      cancelDefer();
      return;
    }
    try {
      if (killSwitch.state) {
        await killSwitches.disableKillSwitch(killSwitch.id);
        toast.show(`Enabled ${killSwitch.name} endpoints.`);
      } else {
        await killSwitches.enableKillSwitch(killSwitch.id);
        toast.show(`Disabled ${killSwitch.name} endpoints.`);
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
      cancelDefer();
    }
  }

  async function disableAllKillSwitches() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      await killSwitches.disableAllKillSwitches();
      toast.show(
        'Disabled all kill switches. All endpoints are now accessible.',
      );
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }
</script>

<style scoped>
  .switch-container {
    text-align: left;
  }
</style>
