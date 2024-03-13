<template>
  <h1>Kill Switches</h1>
  <h2>Global feature kill switches and their current status.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/staff" />
    <button @click="disableAllKillSwitches">Disable All</button>
  </div>

  <EmphasizedBox>
    <Online>
      <template v-if="killSwitches.data">
        <Switch
          v-for="sw in killSwitches.data.items"
          @change="handleKillSwitchToggle(sw.id)"
          :checked="!sw.state"
        >
          {{ sw.name }}
        </Switch>
      </template>
      <LoadingMessage spinner v-else />
    </Online>
  </EmphasizedBox>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import Online from '@/components/Online.vue';
  import Switch from '@/components/Switch.vue';
  import EmphasizedBox from '@/components/EmphasizedBox.vue';

  // In-House Modules
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
    toast = toastStore();

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

  async function handleKillSwitchToggle(id: number) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      let killSwitch = killSwitches.data?.items.find((sw) => sw.id === id);
      if (killSwitch)
        if (!killSwitch?.state) {
          await killSwitches.disableKillSwitch(id);
          toast.show(`Disabled ${killSwitch.name}.`);
        } else {
          await killSwitches.enableKillSwitch(id);
          toast.show(`Enabled ${killSwitch.name}.`);
        }
      else {
        toast.clientError();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function disableAllKillSwitches() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      await killSwitches.disableAllKillSwitches();
      toast.show('Disabled all kill switches.');
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }
</script>
