<template>
  <EmphasizedBox>
    <h2>I am a box that is emphasized with a form inside.</h2>
    <Form
      @submit="(data) => toast.show(JSON.stringify(data))"
      ref="emphasizedForm"
    >
      <input type="text" placeholder="A text box" name="text" />
      <br />
      <input type="password" placeholder="A password box" name="password" />
      <br />
      <input type="number" placeholder="A number box" name="number" />
      <br />
      <input type="email" placeholder="An email box" name="email" />
      <br />
      <Switch name="switch">A switch</Switch>
      <br />
      <button>Submit</button>
    </Form>
    <button @click="emphasizedForm!.submit()">Submit outside of form</button>
  </EmphasizedBox>
</template>

<script lang="ts" setup>
  // Vue Components
  import EmphasizedBox from '@/components/EmphasizedBox.vue';
  import Form from '@/components/Form.vue';
  import Switch from '@/components/Switch.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  import { toastStore } from '@/stores/toast';

  // External Modules
  import { ref } from 'vue';

  const toast = toastStore(),
    emphasizedForm = ref<typeof Form>();
</script>
