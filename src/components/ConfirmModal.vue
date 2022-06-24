<template>
  <Modal :title="props.title" dismissible @close="submit(false)" ref="modal">
    <template v-slot:default>
      <slot name="default" />
    </template>
    <template v-slot:footer>
      <button @click="submit(false)">Nevermind</button>
      <button @click="submit(true)">I'm sure</button>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import Modal from "@/components/Modal.vue";
import { ref } from "vue";

const emit = defineEmits<{
    (event: "submit", choice: boolean): void;
  }>(),
  props = defineProps({
    title: {
      type: String,
      default: "Imagine leaving the title empty",
    },
    closeOnSubmit: Boolean,
  }),
  modal = ref<typeof Modal>();

function submit(choice: boolean) {
  emit("submit", choice);
  if (props.closeOnSubmit) {
    modal.value!.hide();
  }
}

function show() {
  modal.value!.show();
}

function hide() {
  modal.value!.hide();
}

defineExpose({
  show,
  hide,
});
</script>
