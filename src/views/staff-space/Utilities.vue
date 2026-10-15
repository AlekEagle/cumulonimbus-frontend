<template>
  <h1>Utilities</h1>
  <h2>Some nice utilities for staff users.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/staff" />
  </div>

  <div class="content-box-container">
    <ContentBox
      title="Log Level"
      :src="gearIcon"
      theme-safe
      @click="displayLogLevelModal"
    >
      Change the log level for the backend server.
    </ContentBox>
  </div>

  <FormModal
    ref="logLevelModal"
    title="Change Log Level"
    :disabled="utilities.loading"
    @submit="changeLogLevel"
  >
    <template v-if="!utilities.errored">
      <LoadingMessage spinner v-if="utilities.loading" />
      <div v-else>
        <p>Current Log Level: <code v-text="utilities.logLevelData!.name" /></p>
        <Select v-model="dummyLogLevel" name="logLevel">
          <option
            v-for="logLevel in Cumulonimbus.LogLevel"
            :key="logLevel"
            :value="logLevel"
            v-text="logLevel"
          />
        </Select>
        <br />
        <input
          hidden
          type="text"
          autocomplete="username"
          disabled
          :value="user.account!.user.username"
        />
        <input
          type="password"
          placeholder="Your Password"
          name="password"
          autocomplete="off"
          required
        />
      </div>
    </template>
    <template v-else>
      <p>Whoops! Something went wrong.</p>
      <button @click="utilities.getLogLevel">Retry</button>
    </template>
  </FormModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import FormModal from '@/components/FormModal.vue';
  import LoadingMessage from '@/components/LoadingMessage.vue';
  import Select from '@/components/Select.vue';

  // In-House Modules
  import gearIcon from '@/assets/images/gear.svg';
  import Cumulonimbus from 'cumulonimbus-wrapper';

  // Store Modules
  import { userStore } from '@/stores/user.js';
  import { toastStore } from '@/stores/toast.js';
  import { utilitiesStore } from '@/stores/staff-space/utilities.js';

  // External Modules
  import { ref } from 'vue';

  const user = userStore(),
    utilities = utilitiesStore(),
    toast = toastStore(),
    logLevelModal = ref<InstanceType<typeof FormModal>>(),
    dummyLogLevel = ref<Cumulonimbus.LogLevel>();

  async function displayLogLevelModal() {
    if (!utilities.logLevelData)
      utilities.getLogLevel().then(() => {
        dummyLogLevel.value = utilities.logLevelData!
          .name as Cumulonimbus.LogLevel;
      });

    await logLevelModal.value?.show();
  }

  async function changeLogLevel(res: { password: string }) {
    if (await utilities.setLogLevel(dummyLogLevel.value!, res.password)) {
      toast.show('Log level changed successfully.');
      logLevelModal.value?.hide();
    }
  }
</script>
