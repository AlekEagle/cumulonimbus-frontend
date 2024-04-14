<template>
  <h1>Second Factors</h1>
  <h2>Your registered second factors.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard/account" />
    <button @click="selecting = true" :disabled="secondFactors.loading">
      Select...
    </button>
    <button v-if="!selecting" @click="deleteAllSecondFactorsModal.show()">
      Delete All
    </button>
    <template v-else>
      <button @click="cancelSelection" :disabled="secondFactors.loading">
        Cancel Selection
      </button>
      <button
        @click="confirmDeleteMultipleModal.show()"
        :disabled="secondFactors.loading"
      >
        Delete Selected
      </button>
    </template>
  </div>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';

  // Store Modules
  import { secondFactorsStore } from '@/stores/user-space/secondFactors';

  // External Modules
  import { ref } from 'vue';

  const secondFactors = secondFactorsStore(),
    selecting = ref(false),
    selected = ref([]),
    page = ref(0);
</script>
