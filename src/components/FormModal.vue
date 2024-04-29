<template>
  <ConfirmModal
    ref="confirmModal"
    @submit="modalSubmit"
    :title="props.title"
    :disabled="props.disabled"
    :confirm-button="props.confirmButton"
    :deny-button="props.denyButton"
  >
    <template #default>
      <slot name="before-form" />
      <Form ref="form" @submit="formSubmit" :reset="props.reset">
        <slot name="default" />
      </Form>
      <slot name="after-form" />
    </template>
    <template #additional-buttons>
      <slot name="additional-buttons" />
    </template>
  </ConfirmModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import Form from '@/components/Form.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  import { ref } from 'vue';

  const emit = defineEmits<{
    (
      event: 'submit',
      data:
        | {
            [key: string]: string | number | boolean;
          }
        | any,
    ): void;
    (event: 'cancel'): void;
  }>();
  const props = defineProps({
    title: {
      type: String,
      default: 'Imagine leaving the title empty',
    },
    reset: {
      type: Boolean,
      default: false,
    },
    closeOnSubmit: Boolean,
    disabled: Boolean,
    confirmButton: {
      type: String,
      default: "I'm sure",
    },
    denyButton: {
      type: String,
      default: 'Nevermind',
    },
  });
  const confirmModal = ref<InstanceType<typeof ConfirmModal>>(),
    form = ref<InstanceType<typeof Form>>();

  function modalSubmit(choice: boolean) {
    if (!choice) {
      emit('cancel');
      confirmModal.value!.hide();
    } else form.value!.submit();
  }

  function formSubmit(data: any) {
    emit('submit', data);
    if (props.closeOnSubmit) confirmModal.value!.hide();
  }

  async function show() {
    await confirmModal.value!.show();
  }

  async function hide() {
    await confirmModal.value!.hide();
  }

  defineExpose({
    form,
    show,
    hide,
  });
</script>
