<template>
  <div class="paginator-container">
    <Paginator
      v-model="paginatorPage"
      :item-count="25"
      :page-override="5"
      @page-change="toast.show('User changed page')"
    />
  </div>
</template>

<script lang="ts" setup>
  // Vue Components
  import Paginator from '&/Paginator.vue';

  // In-House Modules
  import { toastStore } from '$/toast.js';

  // External Modules
  import { ref } from 'vue';

  const paginatorPage = ref<number>(0),
    toast = toastStore();
</script>
