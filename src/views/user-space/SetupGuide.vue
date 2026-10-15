<template>
  <h1>Setup Guide</h1>
  <h2>It won't take you more than a few minutes to get set up.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard/setup-guides" />
  </div>
  <div class="content-box-container grow" v-if="instruction.data">
    <template v-if="!instruction.loading">
      <template v-if="!instruction.errored">
        <template v-if="instruction.data">
          <ContentBox
            v-for="(step, index) in instruction.data.steps"
            :title="`Step ${index + 1}`"
            @click="stepClick(index)"
          >
            {{ step.content }}
          </ContentBox>
        </template>
        <LoadingMessage spinner v-else />
      </template>
      <div v-else>
        <h1>Something went wrong.</h1>
        <button @click="fetchInstruction">Retry</button>
      </div>
    </template>
    <LoadingMessage spinner v-else />
  </div>
  <FormModal
    title="Verify Your Identity"
    ref="verifyIdentityModal"
    @cancel="cancelVerify"
    @submit="verifyIdentity"
    :disabled="processing"
  >
    <p>Please login again to verify your identity.</p>
    <p>
      Name what your new
      {{ instruction.data ? instruction.data.name : 'thing' }}
      will be called.
    </p>
    <input
      type="text"
      :placeholder="`${
        instruction.data ? instruction.data.name : 'thing'
      } on ${OS}`"
      autocomplete="off"
      name="name"
      required
      :disabled="processing"
    />
    <br />
    <input
      hidden
      type="text"
      autocomplete="username"
      name="username"
      :value="user.account?.user.username"
    />
    <input
      type="password"
      placeholder="Password"
      autocomplete="current-password"
      name="password"
      required
      :disabled="processing"
    />
  </FormModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import FormModal from '@/components/FormModal.vue';
  import LoadingMessage from '@/components/LoadingMessage.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import backWithFallback from '@/utils/routerBackWithFallback.js';
  import downloadBlob from '@/utils/downloadBlob.js';

  // Store Modules
  import { instructionStore } from '@/stores/user-space/instruction.js';
  import { toastStore } from '@/stores/toast.js';
  import { sessionsStore } from '@/stores/user-space/sessions.js';
  import { userStore } from '@/stores/user.js';

  // External Modules
  import { ref, onMounted } from 'vue';
  import { useClipboard } from '@vueuse/core';
  import { useRouter } from 'vue-router';

  const instruction = instructionStore(),
    user = userStore(),
    toast = toastStore(),
    router = useRouter(),
    sessions = sessionsStore(),
    { copy } = useClipboard(),
    session = ref<string>(),
    processing = ref(false),
    verifyIdentityModal = ref<InstanceType<typeof FormModal>>(),
    OS = ref<string>(
      (navigator as any).userAgentData
        ? (navigator as any).userAgentData.platform
        : navigator.platform,
    );

  async function fetchInstruction() {
    try {
      const status = await instruction.getInstruction(
        router.currentRoute.value.query.id as string,
      );
      if (!status) {
        await backWithFallback(router, '/dashboard/setup-guides', true);
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  onMounted(() => {
    verifyIdentityModal.value!.show();

    fetchInstruction();
  });

  async function cancelVerify() {
    await verifyIdentityModal.value!.hide();
    backWithFallback(router, '/dashboard/setup-guides', true);
  }

  async function stepClick(index: number) {
    const step = instruction.data?.steps[index];

    if (!step) {
      toast.clientError();
      return;
    }

    switch (step?.action) {
      case Cumulonimbus.InstructionStepActions.COPY_TOKEN_TO_CLIPBOARD:
        copy(session.value!);
        toast.show('Copied to clipboard.');
        break;
      case Cumulonimbus.InstructionStepActions.DOWNLOAD_CONFIG_FILE:
        await getSetupFile(step);
        break;
      case Cumulonimbus.InstructionStepActions.OPEN_URL:
        window.open(step.url, '_blank');
        break;
      case Cumulonimbus.InstructionStepActions.NOOP:
      default:
        break;
    }
  }

  async function getSetupFile(step: Cumulonimbus.Data.InstructionStep) {
    if (!step.file) {
      toast.clientError();
      return;
    }

    const setupFileData = step.file.content.replace(
      '{{token}}',
      session.value!,
    );
    downloadBlob(setupFileData, step.file.name, 'text/plain');
  }

  async function verifyIdentity(data: { name: string; password: string }) {
    processing.value = true;
    try {
      const status = await sessions.createScopedSession(
        data.name,
        Cumulonimbus.PermissionFlags.UPLOAD_FILE,
        data.password,
        true,
      );
      if (status !== null) {
        session.value = status;
        await verifyIdentityModal.value!.hide();
      } else {
        toast.clientError();
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    } finally {
      processing.value = false;
    }
  }
</script>
