<template>
  <EmphasizedBox>
    <h3>With Spinner.</h3>
    <LoadingMessage spinner />
  </EmphasizedBox>

  <EmphasizedBox>
    <h3>Without Spinner.</h3>
    <h1><LoadingMessage /></h1>
  </EmphasizedBox>

  <EmphasizedBox>
    <h3>Only Spinner.</h3>
    <LoadingSpinner />
  </EmphasizedBox>
</template>

<script lang="ts" setup>
  // Vue Components
  import EmphasizedBox from '&/EmphasizedBox.vue';
  import LoadingMessage from '&/LoadingMessage.vue';
  import LoadingSpinner from '&/LoadingSpinner.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  // No Store Modules to import here.

  // External Modules
  // No External Modules to import here.
</script>
