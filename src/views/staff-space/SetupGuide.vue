<template>
  <h1>Edit Setup Guide</h1>
  <Online no-msg>
    <h2 v-if="instruction.data">
      Editing setup guide {{ instruction.data.name }}.
    </h2>
    <h2 v-else>Fetching setup guide<AnimatedEllipsis /></h2>
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
    <div class="content-box-container grow">
      <template v-if="!instruction.loading">
        <template v-if="!instruction.errored">
          <template v-if="instruction.data">
            <ContentBox
              v-for="(step, index) in instruction.data.steps"
              :title="`Step ${index + 1}`"
              @click="onInstructionStepClick(index)"
              theme-safe
            >
              <template
                v-if="
                  step.action ===
                  Cumulonimbus.InstructionStepActions.DOWNLOAD_CONFIG_FILE
                "
              >
                <strong> This step downloads a setup file. </strong>
                <br />
              </template>
              <template
                v-if="
                  step.action === Cumulonimbus.InstructionStepActions.OPEN_URL
                "
              >
                <strong> This step opens a URL. </strong>
                <br />
              </template>
              <template
                v-if="
                  step.action ===
                  Cumulonimbus.InstructionStepActions.COPY_TOKEN_TO_CLIPBOARD
                "
              >
                <strong> This step copies the token to the clipboard. </strong>
                <br />
              </template>
              {{ step.content }}
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
          <SkeletonContentBoxes v-else />
        </template>
        <div v-else>
          <h1>Something went wrong.</h1>
          <button @click="fetchInstruction">Retry</button>
        </div>
      </template>
      <LoadingMessage spinner v-else />
    </div>
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
    <LoadingMessage spinner v-else />
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
      <Select
        v-model="selectedStepAction"
        name="action"
        :disabled="instruction.loading"
        required
      >
        <option
          v-for="option in Object.values(Cumulonimbus.InstructionStepActions)"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </Select>
      <textarea
        :value="instruction.data.steps[selectedStep]?.content ?? ''"
        placeholder="All you have to do is..."
        name="content"
        autocomplete="off"
        :disabled="instruction.loading"
        required
      />
      <template
        v-if="
          selectedStepAction ===
          Cumulonimbus.InstructionStepActions.DOWNLOAD_CONFIG_FILE
        "
      >
        <button @click="editFile" type="button">Edit Config File</button>
      </template>
      <template
        v-else-if="
          selectedStepAction === Cumulonimbus.InstructionStepActions.OPEN_URL
        "
      >
        <input
          name="url"
          type="url"
          required
          :value="instruction.data.steps[selectedStep]?.url ?? ''"
          placeholder="URL to Open"
        />
      </template>
    </template>
    <LoadingMessage spinner v-else />
    <template #additional-buttons>
      <button
        @click="deleteStep"
        :disabled="
          instruction.data?.steps[selectedStep] === undefined ||
          instruction.loading
        "
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
    <input
      type="text"
      name="name"
      :value="selectedStepFileData?.name ?? ''"
      placeholder="Filename"
      autocomplete="off"
      :disabled="instruction.loading"
      required
    />
    <br />
    <br />
    <strong
      v-html="'Use {{token}} to indicate where the token should be injected.'"
    />
    <br />
    <textarea
      name="content"
      :value="selectedStepFileData?.content ?? ''"
      placeholder="File Content"
      autocomplete="off"
      :disabled="instruction.loading"
      required
    />
  </FormModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import AnimatedEllipsis from '@/components/AnimatedEllipsis.vue';
  import BackButton from '@/components/BackButton.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import FormModal from '@/components/FormModal.vue';
  import LoadingMessage from '@/components/LoadingMessage.vue';
  import Modal from '@/components/Modal.vue';
  import Select from '@/components/Select.vue';
  import SkeletonContentBoxes from '@/components/SkeletonContentBoxes.vue';

  // In-House Modules
  import backWithFallback from '@/utils/routerBackWithFallback.js';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import plusIcon from '@/assets/images/plus.svg';
  import toDateString from '@/utils/toDateString.js';

  // Store Modules
  import { instructionStore } from '@/stores/staff-space/instruction.js';
  import { instructionsStore } from '@/stores/staff-space/instructions.js';
  import { toastStore } from '@/stores/toast.js';

  // External Modules
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter(),
    toast = toastStore(),
    instruction = instructionStore(),
    instructions = instructionsStore(),
    manageSetupGuideModal = ref<InstanceType<typeof Modal>>(),
    setupGuideInfoModal = ref<InstanceType<typeof Modal>>(),
    editStepModal = ref<InstanceType<typeof FormModal>>(),
    deleteSetupGuideModal = ref<InstanceType<typeof ConfirmModal>>(),
    editDisplayNameModal = ref<InstanceType<typeof FormModal>>(),
    editDescriptionModal = ref<InstanceType<typeof FormModal>>(),
    editFileModal = ref<InstanceType<typeof FormModal>>(),
    selectedStep = ref<number>(-1),
    selectedStepAction = ref<Cumulonimbus.InstructionStepActions>(
      Cumulonimbus.InstructionStepActions.NOOP,
    ),
    selectedStepFileData = ref<Cumulonimbus.Data.InstructionFile | null>(null);

  async function fetchInstruction() {
    try {
      await instruction.getInstruction(
        router.currentRoute.value.query.id as string,
      );
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  onMounted(fetchInstruction);

  function onInstructionStepClick(index: number) {
    selectedStep.value = index;
    selectedStepAction.value =
      instruction.data!.steps[index]?.action ??
      Cumulonimbus.InstructionStepActions.NOOP;
    selectedStepFileData.value = instruction.data!.steps[index]?.file ?? null;
    editStepModal.value!.show();
  }

  function cancelEditStep() {
    selectedStep.value = -1;
    selectedStepAction.value = Cumulonimbus.InstructionStepActions.NOOP;
    selectedStepFileData.value = null;
  }

  async function editStep(data: {
    content: string;
    action: Cumulonimbus.InstructionStepActions;
    url?: string;
  }) {
    const steps = instruction.data!.steps;
    steps[selectedStep.value] = {
      content: data.content,
      action: selectedStepAction.value,
      file: selectedStepFileData.value ?? undefined,
      url: data.url,
    };
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
    await editStepModal.value!.hide();
    await editFileModal.value!.show();
  }

  async function confirmDeleteSetupGuide(choice: boolean) {
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

  async function onEditFile(data: { name: string; content: string }) {
    try {
      selectedStepFileData.value = data;
      toast.show(
        'Step file saved to memory, changes will be submitted when you save the step.',
      );
      await editFileModal.value!.hide();
      await editStepModal.value!.show();
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
