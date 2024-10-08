<template>
  <form @submit.prevent="submit" ref="form">
    <slot />
    <input type="submit" />
  </form>
</template>

<script lang="ts" setup>
  // Vue Components
  // No Vue Components to import here.

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
  }>();

  const form = ref<HTMLFormElement>();

  const props = defineProps({
    reset: {
      type: Boolean,
      default: false,
    },
  });
  function submit() {
    if (!form.value!.reportValidity()) return;
    const formElements = form.value!.elements as HTMLFormControlsCollection;
    const data: {
      [key: string]: string | number | boolean | undefined;
    } = {};
    for (let i = 0; i < formElements.length; i++) {
      const element = formElements[i];
      if (element instanceof HTMLInputElement) {
        switch (element.type) {
          case 'checkbox':
            data[element.name] = element.checked;
            break;
          case 'number':
            if (element.value === '') data[element.name] = undefined;
            else data[element.name] = Number(element.value);
            break;
          case 'text':
          case 'password':
          case 'email':
          case 'url':
          case 'tel':
          case 'search':
          case 'date':
          case 'time':
          case 'datetime-local':
          case 'month':
          case 'week':
          case 'color':
          case 'range':
          case 'textarea':
          default:
            data[element.name] =
              element.value === '' ? undefined : element.value;
            break;
          case 'submit':
            break;
        }
      } else if (element instanceof HTMLSelectElement) {
        data[element.name] = element.value === '' ? undefined : element.value;
      } else if (element instanceof HTMLTextAreaElement) {
        data[element.name] = element.value === '' ? undefined : element.value;
      }
    }
    if (props.reset) {
      form.value!.reset();
    }
    emit('submit', data);
  }

  defineExpose({
    form,
    submit,
  });
</script>
