<template>
  <Modal
    :title="props.title"
    :dismissible="!props.disabled"
    @close="submit(false)"
    ref="modal"
  >
    <template #default>
      <slot name="default" />
    </template>
    <template #footer>
      <button
        @click="submit(false)"
        v-text="props.denyButton"
        :disabled="props.disabled"
      />
      <button
        @click="submit(true)"
        v-text="props.confirmButton"
        :disabled="props.disabled"
      />
      <slot name="additional-buttons" />
    </template>
  </Modal>
</template>

<script lang="ts" setup>
  // Vue Components
  import Modal from '@/components/Modal.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref } from 'vue';

  const emit = defineEmits<{
    (event: 'submit', choice: boolean): void;
  }>();
  const props = defineProps({
    title: {
      type: String,
      default: 'Imagine leaving the title empty',
    },
    confirmButton: {
      type: String,
      default: "I'm sure",
    },
    denyButton: {
      type: String,
      default: 'Nevermind',
    },
    closeOnSubmit: Boolean,
    disabled: Boolean,
  });
  const modal = ref<InstanceType<typeof Modal>>(),
    confirmCallback = ref<(choice: boolean) => void>();

  function submit(choice: boolean) {
    if (confirmCallback.value) {
      confirmCallback.value(choice);
      return;
    }
    emit('submit', choice);
    if (props.closeOnSubmit) {
      modal.value!.hide();
    }
  }

  async function show() {
    await modal.value!.show();
  }

  async function hide() {
    await modal.value!.hide();
  }

  async function confirm() {
    await modal.value!.show();
    return new Promise<boolean>((resolve) => {
      function hideAndResolve(choice: boolean) {
        hide();
        resolve(choice);
        confirmCallback.value = undefined;
      }
      confirmCallback.value = hideAndResolve;
    });
  }

  defineExpose({
    show,
    hide,
    confirm,
  });
</script>
