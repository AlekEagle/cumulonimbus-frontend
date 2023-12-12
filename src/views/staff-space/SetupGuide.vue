<template>
  <h1>Edit Setup Guide</h1>
  <Online no-msg>
    <h2 v-if="instruction.data">
      Editing setup guide {{ instruction.data.name }}.
    </h2>
    <h2 class="animated-ellipsis" v-else>Fetching setup guide</h2>
  </Online>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/staff/setup-guides" />
    <button
      @click="setupGuideInfoModal!.show()"
      :disabled="instruction.loading || instruction.errored"
    >
      Setup Guide Info
    </button>
    <button
      @click="manageSetupGuideModal!.show()"
      :disabled="instruction.loading || instruction.errored"
    >
      Manage Setup Guide
    </button>
  </div>
  <Online>
    <div class="content-box-container">
      <template v-if="!instruction.loading">
        <template v-if="!instruction.errored">
          <template v-if="instruction.data">
            <ContentBox
              v-for="(step, index) in instruction.data.steps"
              :title="`Step ${index + 1}`"
              :src="infoIcon"
              @click="onInstructionStepClick(index)"
              theme-safe
            >
              <template v-if="index === 0">
                <strong> This step gives the setup file. </strong>
                <br />
              </template>
              {{ step }}
            </ContentBox>
            <ContentBox
              title="Add Step"
              :src="plusIcon"
              @click="onInstructionStepClick(instruction.data!.steps.length)"
              theme-safe
            >
              Add a new step
            </ContentBox>
          </template>
          <LoadingBlurb v-else />
        </template>
        <div v-else>
          <h1>Something went wrong.</h1>
          <button @click="fetchInstruction">Retry</button>
        </div>
      </template>
      <LoadingBlurb v-else />
    </div>
  </Online>
  <Modal dismissible title="Info" ref="setupGuideInfoModal">
    <template v-if="instruction.data">
      <p>
        ID:
        <code v-text="instruction.data.id" />
      </p>
      <p>
        Name:
        <code v-text="instruction.data.name" />
      </p>
      <p>
        Created at:
        <code v-text="toDateString(new Date(instruction.data.createdAt))" />
      </p>
      <p>
        Last updated at:
        <code v-text="toDateString(new Date(instruction.data.updatedAt))" />
      </p>
    </template>
    <LoadingBlurb v-else />
  </Modal>
  <Modal
    dismissible
    ref="manageSetupGuideModal"
    :title="`Manage ${instruction.data ? instruction.data.name : 'this thing'}`"
  >
    <div class="button-modal-container">
      <button @click="deleteSetupGuide">Delete</button>
      <button @click="editDisplayName">Edit Display Name</button>
      <button @click="editDescription">Edit Description</button>
      <button @click="editFile">Edit File</button>
    </div>
  </Modal>
  <FormModal
    :title="`Editing Step ${selectedStep + 1}`"
    ref="editStepModal"
    @cancel="cancelEditStep"
    @submit="editStep"
    :disabled="instruction.loading"
    deny-button="Cancel"
    confirm-button="Save"
  >
    <template v-if="instruction.data && selectedStep > -1">
      <template v-if="selectedStep === 0">
        <strong>This step gives the setup file.</strong>
        <br />
      </template>
      <textarea
        :value="instruction.data.steps[selectedStep]"
        :placeholder="`Step ${selectedStep + 1}`"
        name="stepContent"
        autocomplete="off"
        :disabled="instruction.loading"
        required
      />
    </template>
    <LoadingBlurb v-else />
    <template #additional-buttons>
      <button
        @click="deleteStep"
        :disabled="instruction.data?.steps[selectedStep] === undefined"
      >
        Delete Step
      </button>
    </template>
  </FormModal>
  <ConfirmModal
    ref="deleteSetupGuideModal"
    @submit="confirmDeleteSetupGuide"
    title="Are you sure?"
  >
    <p>Are you sure you want to delete {{ instruction.data?.name }}?</p>
  </ConfirmModal>
  <FormModal
    ref="editDisplayNameModal"
    @submit="onEditDisplayName"
    title="Edit Display Name"
    :disabled="instruction.loading"
    deny-button="Cancel"
    confirm-button="Save"
  >
    <input
      type="text"
      name="name"
      :value="instruction.data?.name"
      placeholder="Display Name"
      autocomplete="off"
      :disabled="instruction.loading"
      required
    />
  </FormModal>
  <FormModal
    ref="editDescriptionModal"
    @submit="onEditDescription"
    title="Edit Description"
    :disabled="instruction.loading"
    deny-button="Cancel"
    confirm-button="Save"
  >
    <textarea
      name="description"
      :value="instruction.data?.description"
      placeholder="Description"
      autocomplete="off"
      :disabled="instruction.loading"
      required
    />
  </FormModal>
  <FormModal
    ref="editFileModal"
    @submit="onEditFile"
    title="Edit File"
    :disabled="instruction.loading"
    deny-button="Cancel"
    confirm-button="Save"
  >
    <strong>Leave blank to specify clipboard content.</strong>
    <br />
    <input
      type="text"
      name="filename"
      :value="instruction.data?.filename"
      placeholder="Filename"
      autocomplete="off"
      :disabled="instruction.loading"
    />
    <br />
    <br />
    <strong
      v-html="'Use {{token}} to indicate where the token should be injected.'"
    />
    <br />
    <textarea
      name="content"
      :value="instruction.data?.content"
      placeholder="File Content"
      autocomplete="off"
      :disabled="instruction.loading"
      required
    />
  </FormModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import FormModal from '@/components/FormModal.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import Modal from '@/components/Modal.vue';
  import Online from '@/components/Online.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import backWithFallback from '@/utils/routerBackWithFallback';
  import defaultErrorHandler from '@/utils/defaultErrorHandler';
  import infoIcon from '@/assets/images/info.svg';
  import plusIcon from '@/assets/images/plus.svg';
  import toDateString from '@/utils/toDateString';
  import loadWhenOnline from '@/utils/loadWhenOnline';

  // Store Modules
  import { instructionStore } from '@/stores/staff-space/instruction';
  import { instructionsStore } from '@/stores/staff-space/instructions';
  import { toastStore } from '@/stores/toast';

  // External Modules
  import { ref, watch, onMounted } from 'vue';
  import { useOnline } from '@vueuse/core';
  import { useRouter } from 'vue-router';

  const online = useOnline(),
    router = useRouter(),
    toast = toastStore(),
    instruction = instructionStore(),
    instructions = instructionsStore(),
    manageSetupGuideModal = ref<typeof Modal>(),
    setupGuideInfoModal = ref<typeof Modal>(),
    editStepModal = ref<typeof FormModal>(),
    deleteSetupGuideModal = ref<typeof ConfirmModal>(),
    editDisplayNameModal = ref<typeof FormModal>(),
    editDescriptionModal = ref<typeof FormModal>(),
    editFileModal = ref<typeof FormModal>(),
    selectedStep = ref<number>(-1);

  async function fetchInstruction() {
    if (!online) {
      toast.connectivityOffline();
      return;
    }
    try {
      await instruction.getInstruction(
        router.currentRoute.value.query.id as string,
      );
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  onMounted(async () =>
    loadWhenOnline(
      fetchInstruction,
      !instruction.data ||
        instruction.data.name !== router.currentRoute.value.query.id,
    ),
  );

  function onInstructionStepClick(index: number) {
    selectedStep.value = index;
    editStepModal.value!.show();
  }

  function cancelEditStep() {
    selectedStep.value = -1;
  }

  async function editStep(data: { stepContent: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    const steps = instruction.data!.steps;
    steps[selectedStep.value] = data.stepContent;
    try {
      const status = await instruction.updateInstructionSteps(steps);
      if (status) {
        toast.show('Step updated successfully.');
        editStepModal.value!.hide();
        selectedStep.value = -1;
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function deleteStep() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    const steps = instruction.data!.steps;
    steps.splice(selectedStep.value, 1);
    try {
      const status = await instruction.updateInstructionSteps(steps);
      if (status) {
        toast.show('Step deleted successfully.');
        editStepModal.value!.hide();
        selectedStep.value = -1;
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function deleteSetupGuide() {
    await manageSetupGuideModal.value!.hide();
    await deleteSetupGuideModal.value!.show();
  }

  async function editDisplayName() {
    await manageSetupGuideModal.value!.hide();
    await editDisplayNameModal.value!.show();
  }

  async function editDescription() {
    await manageSetupGuideModal.value!.hide();
    await editDescriptionModal.value!.show();
  }

  async function editFile() {
    await manageSetupGuideModal.value!.hide();
    await editFileModal.value!.show();
  }

  async function confirmDeleteSetupGuide(choice: boolean) {
    if (!online) {
      toast.connectivityOffline();
      return;
    }
    if (!choice) {
      deleteSetupGuideModal.value!.hide();
      return;
    }
    try {
      deleteSetupGuideModal.value!.hide();
      const status = await instruction.deleteInstruction();
      if (status) {
        toast.show('Setup guide deleted successfully.');
        await instructions.getInstructions(instructions.page);
        await backWithFallback(router, '/staff/setup-guides', true);
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function onEditDisplayName(data: { name: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await instruction.updateInstructionDisplayName(data.name);
      if (status) {
        toast.show('Display name updated successfully.');
        editDisplayNameModal.value!.hide();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function onEditDescription(data: { description: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await instruction.updateInstructionDescription(
        data.description,
      );
      if (status) {
        toast.show('Description updated successfully.');
        editDescriptionModal.value!.hide();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function onEditFile(data: { filename: string; content: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await instruction.updateInstructionFile(
        data.content,
        data.filename,
      );
      if (status) {
        toast.show('File updated successfully.');
        editFileModal.value!.hide();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }
</script>

<style>
  .button-modal-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

  .button-modal-container > * {
    margin: 0.5rem;
  }
</style>
