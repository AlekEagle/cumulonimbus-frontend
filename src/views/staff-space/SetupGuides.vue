<template>
  <h1>Setup Guides</h1>
  <h2>The available setup guides.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/staff" />
    <template v-if="!selecting">
      <button @click="selecting = true" :disabled="instructions.loading">
        Bulk Delete
      </button>
      <button
        @click="createInstructionModal!.show()"
        :disabled="instructions.loading"
      >
        Create Setup Guide
      </button>
    </template>
    <template v-else>
      <button @click="cancelSelection" :disabled="instructions.loading">
        Cancel
      </button>
      <button
        @click="bulkDeleteInstructionModal!.show()"
        :disabled="instructions.loading"
      >
        Delete Selected
      </button>
    </template>
  </div>
  <Paginator
    v-model="page"
    :item-count="instructions.data?.count || 0"
    @page-change="fetchInstructions"
    :disabled="instructions.loading || !online"
  >
    <template v-if="!instructions.loading">
      <template v-if="!instructions.errored">
        <div
          class="content-box-container"
          v-if="instructions.data && instructions.data.count > 0"
        >
          <SelectableContentBox
            v-for="instruction in instructions.data.items"
            :title="instruction.name"
            :selecting="selecting"
            :src="gearIcon"
            theme-safe
            :selected="selected.includes(instruction.name)"
            @click="onInstructionClick(instruction)"
          >
            <p>{{ instruction.description }}</p>
          </SelectableContentBox>
        </div>
        <div v-else class="no-content-container">
          <h1>There are no instructions.</h1>
          <h2>You should probably fix that.</h2>
          <button @click="createInstructionModal!.show()">Create</button>
        </div>
      </template>
      <div class="no-content-container" v-else>
        <h1>Something went wrong.</h1>
        <button @click="fetchInstructions">Retry</button>
      </div>
    </template>

    <SkeletonContentBoxes v-else />
  </Paginator>
  <ConfirmModal
    ref="bulkDeleteInstructionModal"
    @submit="bulkDeleteInstructions"
  >
    <h1>
      Are you sure you want to delete these {{ selected.length }} selected
      instructions?
    </h1>
    <p>This action cannot be undone.</p>
  </ConfirmModal>
  <ConfirmModal
    ref="manageInstructionModal"
    title="Manage Instruction"
    @submit="manageInstruction"
    deny-button="Close"
    confirm-button="Edit"
  >
    <template v-if="selectedInstruction">
      <code v-text="selectedInstruction.name" />
      <p>{{ selectedInstruction.description }}</p>
    </template>
    <LoadingMessage spinner v-else />
  </ConfirmModal>
  <FormModal
    ref="createInstructionModal"
    title="Create Instruction"
    @submit="createInstruction"
    :disabled="instructions.loading"
  >
    <input
      type="text"
      placeholder="Name"
      name="name"
      autocomplete="off"
      required
      :disabled="instructions.loading"
    />
    <textarea
      name="description"
      placeholder="Description"
      autocomplete="off"
      :disabled="instructions.loading"
      required
    />
  </FormModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import FormModal from '@/components/FormModal.vue';
  import LoadingMessage from '@/components/LoadingMessage.vue';
  import Paginator from '@/components/Paginator.vue';
  import SelectableContentBox from '@/components/SelectableContentBox.vue';
  import SkeletonContentBoxes from '@/components/SkeletonContentBoxes.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import defaultErrorHandler from '@/utils/defaultErrorHandler';
  import gearIcon from '@/assets/images/gear.svg';

  // Store Modules
  import { instructionsStore } from '@/stores/staff-space/instructions';
  import { toastStore } from '@/stores/toast';

  // External Modules
  import { ref, watch, onMounted } from 'vue';
  import { useOnline } from '@vueuse/core';
  import { useRouter } from 'vue-router';
  import loadWhenOnline from '@/utils/loadWhenOnline';

  const online = useOnline(),
    router = useRouter(),
    toast = toastStore(),
    instructions = instructionsStore(),
    selecting = ref(false),
    selected = ref<string[]>([]),
    page = ref(0),
    manageInstructionModal = ref<InstanceType<typeof ConfirmModal>>(),
    bulkDeleteInstructionModal = ref<InstanceType<typeof ConfirmModal>>(),
    createInstructionModal = ref<InstanceType<typeof FormModal>>(),
    selectedInstruction = ref<Cumulonimbus.Data.Instruction | null>(null);

  async function fetchInstructions() {
    if (!online) {
      toast.connectivityOffline();
      return;
    }
    window.scrollTo(0, 0);
    try {
      await instructions.getInstructions(page.value);
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  onMounted(async () =>
    loadWhenOnline(
      fetchInstructions,
      !instructions.data || instructions.page !== page.value,
    ),
  );

  function onInstructionClick(instruction: Cumulonimbus.Data.Instruction) {
    if (selecting.value) {
      if (selected.value.includes(instruction.name)) {
        selected.value = selected.value.filter(
          (name) => name !== instruction.name,
        );
      } else {
        selected.value.push(instruction.name);
      }
    } else {
      selectedInstruction.value = instruction;
      manageInstructionModal.value!.show();
    }
  }

  async function bulkDeleteInstructions(choice: boolean) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    if (!choice) {
      bulkDeleteInstructionModal.value!.hide();
      return;
    }
    try {
      const result = await instructions.deleteInstructions(selected.value);
      if (result) {
        toast.show(`Deleted ${result} instruction${result === 1 ? '' : 's'}.`);
        selected.value = [];
        selecting.value = false;
        fetchInstructions();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    } finally {
      bulkDeleteInstructionModal.value!.hide();
    }
  }

  async function manageInstruction(choice: boolean) {
    await manageInstructionModal.value!.hide();
    if (!choice) {
      selectedInstruction.value = null;
      return;
    }
    await router.push(`/staff/setup-guide?id=${selectedInstruction.value!.id}`);
  }

  async function createInstruction(data: {
    name: string;
    description: string;
  }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const result = await instructions.createInstruction(
        data.name,
        data.description,
      );
      if (result) {
        await fetchInstructions();
        await createInstructionModal.value!.hide();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  function cancelSelection() {
    selecting.value = false;
    selected.value = [];
  }
</script>
