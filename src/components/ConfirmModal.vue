<template>
  <Modal :title="props.title" dismissible @close="submit(false)" ref="modal">
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
  import Modal from '@/components/Modal.vue';
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
  const modal = ref<typeof Modal>();

  function submit(choice: boolean) {
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

  defineExpose({
    show,
    hide,
  });
</script>
