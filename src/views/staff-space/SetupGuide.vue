<template>
  <h1>Edit Setup Guide</h1>
  <template v-if="online || instruction.data">
    <h2 v-if="instruction.data">
      Editing setup guide {{ instruction.data.displayName }}.
    </h2>
    <h2 class="animated-ellipsis" v-else>Alek is reading the setup guide</h2>
  </template>
  <h2 v-else>Alek can't read the setup guide because you are offline :(</h2>
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
  <div class="content-box-container" v-if="online || instruction.data">
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
  <div v-else>
    <h1>Offline</h1>
    <h2
      >You are currently offline. Please connect to the internet to
      continue.</h2
    >
  </div>
  <Modal dismissible title="Info" ref="setupGuideInfoModal">
    <template v-if="instruction.data">
      <p
        >Name:
        <code v-text="instruction.data.name" />
      </p>
      <p
        >Display Name:
        <code v-text="instruction.data.displayName" />
      </p>
      <p
        >Description:
        <br />
        <code v-text="instruction.data.description" />
        <br />
      </p>
      <p
        >Steps:
        <code v-text="instruction.data.steps.length" />
      </p>
      <p
        >Has setup file:
        <code v-text="instruction.data.filename === null ? 'No' : 'Yes'" />
      </p>
      <p v-if="instruction.data.filename !== null">
        Setup file:
        <code v-text="instruction.data.filename" />
      </p>
      <p>
        {{ instruction.data.filename === null ? 'Clipboard' : 'File' }} content:
        <br />
        <code v-text="instruction.data.fileContent" />
        <br />
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
    :title="`Manage ${
      instruction.data ? instruction.data.displayName : 'this thing'
    }`"
  >
    <button @click="deleteSetupGuide">Delete</button>
    <button @click="editDisplayName">Edit Display Name</button>
    <button @click="editDescription">Edit Description</button>
    <button @click="editFilename">Edit Filename</button>
    <button @click="editFileContent">Edit File Content</button>
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
        <strong> This step gives the setup file. </strong>
        <br />
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
    <template v-slot:additional-buttons>
      <button
        @click="deleteStep"
        :disabled="instruction.data?.steps[selectedStep] === undefined"
        >Delete Step</button
      >
    </template>
  </FormModal>
  <ConfirmModal
    ref="deleteSetupGuideModal"
    @submit="confirmDeleteSetupGuide"
    title="Are you sure?"
  >
    <p>Are you sure you want to delete this setup guide?</p>
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
      name="displayName"
      :value="instruction.data?.displayName"
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
    ref="editFilenameModal"
    @submit="onEditFilename"
    title="Edit Filename"
    :disabled="instruction.loading"
    deny-button="Cancel"
    confirm-button="Save"
  >
    <input
      type="text"
      name="filename"
      :value="instruction.data?.filename"
      placeholder="Filename"
      autocomplete="off"
      :disabled="instruction.loading"
      required
    />
    <template v-slot:additional-buttons>
      <button @click="onNoFilename" :disabled="instruction.loading"
        >No File</button
      >
    </template>
  </FormModal>
  <FormModal
    ref="editFileContentModal"
    @submit="onEditFileContent"
    title="Edit File Content"
    :disabled="instruction.loading"
    deny-button="Cancel"
    confirm-button="Save"
  >
    <strong
      v-html="'Use {{token}} to indicate where the token should be injected.'"
    />
    <br />
    <br />
    <textarea
      name="content"
      :value="instruction.data?.fileContent"
      placeholder="File Content"
      autocomplete="off"
      :disabled="instruction.loading"
      required
    />
  </FormModal>
</template>

<script lang="ts" setup>
  import ContentBox from '@/components/ContentBox.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import FormModal from '@/components/FormModal.vue';
  import BackButton from '@/components/BackButton.vue';
  import Modal from '@/components/Modal.vue';
  import { userStore } from '@/stores/user';
  import { toastStore } from '@/stores/toast';
  import { instructionStore } from '@/stores/staff-space/instruction';
  import { instructionsStore } from '@/stores/staff-space/instructions';
  import { useOnline } from '@vueuse/core';
  import { ref, watch, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import infoIcon from '@/assets/images/info.svg';
  import plusIcon from '@/assets/images/plus.svg';
  import toDateString from '@/utils/dateString';
  import backWithFallback from '@/utils/routerBackWithFallback';
  import toLogin from '@/utils/toLogin';

  const online = useOnline(),
    router = useRouter(),
    user = userStore(),
    toast = toastStore(),
    instruction = instructionStore(),
    instructions = instructionsStore(),
    manageSetupGuideModal = ref<typeof Modal>(),
    setupGuideInfoModal = ref<typeof Modal>(),
    editStepModal = ref<typeof FormModal>(),
    deleteSetupGuideModal = ref<typeof ConfirmModal>(),
    editDisplayNameModal = ref<typeof FormModal>(),
    editDescriptionModal = ref<typeof FormModal>(),
    editFilenameModal = ref<typeof FormModal>(),
    editFileContentModal = ref<typeof FormModal>(),
    selectedStep = ref<number>(-1);

  async function fetchInstruction() {
    if (!online) {
      toast.connectivity();
      return;
    }
    try {
      const status = await instruction.getInstruction(
        router.currentRoute.value.query.id as string
      );
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout();
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INVALID_INSTRUCTION_ERROR':
            toast.show('This setup guide does not exist.');
            await instructions.getInstructions(instructions.page);
            await backWithFallback(router, '/staff/setup-guides');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      }
    } catch (e) {
      console.error(e);
      toast.serverError();
    }
  }

  onMounted(async () => {
    if (!online.value) {
      const unwatchOnline = watch(online, () => {
        if (online.value) {
          if (
            !instruction.data ||
            instruction.data.name !== router.currentRoute.value.query.id
          ) {
            fetchInstruction();
          }
          unwatchOnline();
        }
      });
      return;
    }
    if (
      !instruction.data ||
      instruction.data.name !== router.currentRoute.value.query.id
    ) {
      fetchInstruction();
    }
  });

  function onInstructionStepClick(index: number) {
    selectedStep.value = index;
    editStepModal.value!.show();
  }

  function cancelEditStep() {
    selectedStep.value = -1;
  }

  async function editStep(data: { stepContent: string }) {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    const steps = instruction.data!.steps;
    steps[selectedStep.value] = data.stepContent;
    try {
      const status = instruction.updateInstructionSteps(steps);
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout();
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INVALID_INSTRUCTION_ERROR':
            toast.show('This setup guide does not exist.');
            await instructions.getInstructions(instructions.page);
            await backWithFallback(router, '/staff/setup-guides');
            break;
          case 'INSUFFICIENT_PERMISSIONS_ERROR':
            await user.refetch();
            router.replace('/');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Step updated successfully.');
        editStepModal.value!.hide();
        selectedStep.value = -1;
      }
    } catch (e) {
      console.error(e);
      toast.serverError();
    }
  }

  async function deleteStep() {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    const steps = instruction.data!.steps;
    steps.splice(selectedStep.value, 1);
    try {
      const status = instruction.updateInstructionSteps(steps);
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout();
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INSUFFICIENT_PERMISSIONS_ERROR':
            await user.refetch();
            router.replace('/');
            break;
          case 'INVALID_INSTRUCTION_ERROR':
            toast.show('This setup guide does not exist.');
            await instructions.getInstructions(instructions.page);
            await backWithFallback(router, '/staff/setup-guides');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Step deleted successfully.');
        editStepModal.value!.hide();
        selectedStep.value = -1;
      }
    } catch (e) {
      console.error(e);
      toast.serverError();
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

  async function editFilename() {
    await manageSetupGuideModal.value!.hide();
    await editFilenameModal.value!.show();
  }

  async function editFileContent() {
    await manageSetupGuideModal.value!.hide();
    await editFileContentModal.value!.show();
  }

  async function confirmDeleteSetupGuide(choice: boolean) {
    if (!online) {
      toast.connectivity();
      return;
    }
    if (!choice) {
      deleteSetupGuideModal.value!.hide();
      return;
    }
    try {
      const status = await instruction.deleteInstruction();
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout();
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INVALID_INSTRUCTION_ERROR':
            toast.show('This setup guide does not exist.');
            await instructions.getInstructions(instructions.page);
            await backWithFallback(router, '/staff/setup-guides');
            break;
          case 'INSUFFICIENT_PERMISSIONS_ERROR':
            await user.refetch();
            router.replace('/');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Setup guide deleted successfully.');
        await instructions.getInstructions(instructions.page);
        await backWithFallback(router, '/staff/setup-guides');
      }
    } catch (e) {
      console.error(e);
      toast.serverError();
    }
  }

  async function onEditDisplayName(data: { displayName: string }) {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const status = await instruction.updateInstructionDisplayName(
        data.displayName
      );
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout();
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INVALID_INSTRUCTION_ERROR':
            toast.show('This setup guide does not exist.');
            await instructions.getInstructions(instructions.page);
            await backWithFallback(router, '/staff/setup-guides');
            break;
          case 'INSUFFICIENT_PERMISSIONS_ERROR':
            await user.refetch();
            router.replace('/');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Display name updated successfully.');
        editDisplayNameModal.value!.hide();
      }
    } catch (e) {
      console.error(e);
      toast.serverError();
    }
  }

  async function onEditDescription(data: { description: string }) {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const status = await instruction.updateInstructionDescription(
        data.description
      );
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout();
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INVALID_INSTRUCTION_ERROR':
            toast.show('This setup guide does not exist.');
            await instructions.getInstructions(instructions.page);
            await backWithFallback(router, '/staff/setup-guides');
            break;
          case 'INSUFFICIENT_PERMISSIONS_ERROR':
            await user.refetch();
            router.replace('/');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Description updated successfully.');
        editDescriptionModal.value!.hide();
      }
    } catch (e) {
      console.error(e);
      toast.serverError();
    }
  }

  async function onEditFilename(data: { filename: string }) {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const status = await instruction.updateInstructionFilename(data.filename);
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout();
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INVALID_INSTRUCTION_ERROR':
            toast.show('This setup guide does not exist.');
            await instructions.getInstructions(instructions.page);
            await backWithFallback(router, '/staff/setup-guides');
            break;
          case 'INSUFFICIENT_PERMISSIONS_ERROR':
            await user.refetch();
            router.replace('/');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Filename updated successfully.');
        editFilenameModal.value!.hide();
      }
    } catch (e) {
      console.error(e);
      toast.serverError();
    }
  }

  async function onNoFilename() {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const status = await instruction.updateInstructionFilename('');
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout();
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INVALID_INSTRUCTION_ERROR':
            toast.show('This setup guide does not exist.');
            await instructions.getInstructions(instructions.page);
            await backWithFallback(router, '/staff/setup-guides');
            break;
          case 'INSUFFICIENT_PERMISSIONS_ERROR':
            await user.refetch();
            router.replace('/');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Filename updated successfully.');
        editFilenameModal.value!.hide();
      }
    } catch (e) {
      console.error(e);
      toast.serverError();
    }
  }

  async function onEditFileContent(data: { content: string }) {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const status = await instruction.updateInstructionFileContent(
        data.content
      );
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout();
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INVALID_INSTRUCTION_ERROR':
            toast.show('This setup guide does not exist.');
            await instructions.getInstructions(instructions.page);
            await backWithFallback(router, '/staff/setup-guides');
            break;
          case 'INSUFFICIENT_PERMISSIONS_ERROR':
            await user.refetch();
            router.replace('/');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('File content updated successfully.');
        editFileContentModal.value!.hide();
      }
    } catch (e) {
      console.error(e);
      toast.serverError();
    }
  }
</script>
