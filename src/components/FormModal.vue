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
      <Form ref="form" @submit="formSubmit" :reset="props.reset">
        <slot name="default" />
      </Form>
    </template>
    <template #additional-buttons>
      <slot name="additional-buttons" />
    </template>
  </ConfirmModal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import Form from "@/components/Form.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";

const emit = defineEmits<{
  (
    event: "submit",
    data:
      | {
          [key: string]: string | number | boolean;
        }
      | any
  ): void;
  (event: "cancel"): void;
}>();
const props = defineProps({
  title: {
    type: String,
    default: "Imagine leaving the title empty",
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
    default: "Nevermind",
  },
});
const confirmModal = ref<typeof ConfirmModal>(),
  form = ref<typeof Form>();

function modalSubmit(choice: boolean) {
  if (!choice) {
    emit("cancel");
    confirmModal.value!.hide();
  } else form.value!.submit();
}

function formSubmit(data: any) {
  emit("submit", data);
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
