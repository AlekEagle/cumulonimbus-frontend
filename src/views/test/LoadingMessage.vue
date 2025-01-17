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
  import EmphasizedBox from '@/components/EmphasizedBox.vue';
  import LoadingMessage from '@/components/LoadingMessage.vue';
  import LoadingSpinner from '@/components/LoadingSpinner.vue';
</script>
