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
  import Paginator from '@/components/Paginator.vue';

  // In-House Modules
  import { toastStore } from '@/stores/toast';

  // External Modules
  import { ref } from 'vue';

  const paginatorPage = ref<number>(0),
    toast = toastStore();
</script>
