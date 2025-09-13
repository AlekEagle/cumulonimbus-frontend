<template>
  <EmphasizedBox>
    <Switch>Literally just a switch.</Switch>
    <Switch disabled>A switch but disabled.</Switch>
    <Switch disabled checked>A switch but disabled and also checked.</Switch>
    <Separator />
    <Switch @defer="lolFn" :checked="lolChecked">
      A switch that defers the click event.
    </Switch>
    <Switch @defer="lolTheSecondFn" :checked="lolTheSecondChecked">
      A switch that defers the click event but "fails" the backend call.
    </Switch>
  </EmphasizedBox>
</template>

<script lang="ts" setup>
  // Vue Components
  import EmphasizedBox from '@/components/EmphasizedBox.vue';
  import Separator from '@/components/Separator.vue';
  import Switch from '@/components/Switch.vue';

  // In-House Modules
  import { wait } from '@/utils/wait.js';

  // Store Modules
  import { toastStore } from '@/stores/toast.js';

  // External Modules
  import { ref, onMounted } from 'vue';

  const toast = toastStore(),
    lolTheSecondChecked = ref(false),
    lolChecked = ref(false);

  async function lolFn() {
    await toast.show('switch state change deferred, waiting 2 seconds');
    await wait(2000);
    lolChecked.value = !lolChecked.value;
    await toast.show('switch state change deferred, done');
  }

  async function lolTheSecondFn(_: Event, cancelDefer: () => void) {
    await toast.show('switch state change deferred, waiting 2 seconds');
    await wait(2000);
    cancelDefer();
    toast.show('switch state change deferred, "failed"');
  }
</script>
