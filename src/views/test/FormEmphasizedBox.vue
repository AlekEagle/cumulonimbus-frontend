<template>
  <EmphasizedBox>
    <h2>I am a box that is emphasized with a form inside.</h2>
    <Form
      @submit="(data) => toast.show(JSON.stringify(data))"
      ref="emphasizedForm"
    >
      <input type="text" name="text" placeholder="Text" />
      <br />
      <input type="number" name="number" placeholder="Number" />
      <br />
      <input type="password" name="password" placeholder="Password" />
      <br />
      <input type="email" name="email" placeholder="Email" />
      <br />
      <input type="url" name="url" placeholder="URL" />
      <br />
      <input type="tel" name="tel" placeholder="Telephone" />
      <br />
      <input type="search" name="search" placeholder="Search" />
      <br />
      <input type="date" name="date" />
      <br />
      <input type="time" name="time" />
      <br />
      <input type="datetime-local" name="datetime-local" />
      <br />
      <input type="month" name="month" />
      <br />
      <input type="week" name="week" />
      <br />
      <input type="color" name="color" />
      <br />
      <input type="range" name="range" />
      <br />
      <textarea name="textarea" placeholder="Textarea"></textarea>
      <br />
      <select name="select">
        <option value="">Select</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </select>
      <br />
      <!-- multiselect -->
      <select name="multiselect" multiple>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </select>

      <Switch name="switch">Switch</Switch>
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
  import { toastStore } from '@/stores/toast.js';

  // External Modules
  import { ref } from 'vue';

  const toast = toastStore(),
    emphasizedForm = ref<InstanceType<typeof Form>>();
</script>
