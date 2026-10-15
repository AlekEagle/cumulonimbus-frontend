<template>
  <h1>Setup Guides</h1>
  <h2>Let's help you get set up.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard" />
  </div>
  <Paginator
    v-model="page"
    @page-change="fetchInstructions"
    :item-count="instructions.data?.count || 0"
    :disabled="instructions.loading"
  >
    <template v-if="!instructions.loading">
      <template v-if="!instructions.errored">
        <div
          v-if="instructions.data && instructions.data.count > 0"
          class="content-box-container grow"
        >
          <ContentBox
            v-for="instruction in instructions.data.items"
            :title="instruction.name"
            :src="infoIcon"
            theme-safe
            :to="`/dashboard/setup-guide?id=${instruction.id}`"
          >
            {{ instruction.description }}
          </ContentBox>
        </div>
        <div v-else class="no-content-container">
          <h1>There isn't anything here yet...</h1>
          <h2>
            The developers are either lazy or accidentally deleted the database
          </h2>
        </div>
      </template>
      <template v-else>
        <h1>Something went wrong.</h1>
        <button @click="fetchInstructions">Try again</button>
      </template>
    </template>
    <SkeletonContentBoxes v-else />
  </Paginator>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import Paginator from '@/components/Paginator.vue';
  import SkeletonContentBoxes from '@/components/SkeletonContentBoxes.vue';

  // In-House Modules
  import infoIcon from '@/assets/images/info.svg';

  // Store Modules
  import { instructionsStore } from '@/stores/user-space/instructions.js';
  import { toastStore } from '@/stores/toast.js';

  // External Modules
  import { ref, onMounted } from 'vue';

  const instructions = instructionsStore(),
    toast = toastStore(),
    page = ref(0);

  async function fetchInstructions() {
    window.scrollTo(0, 0);
    try {
      await instructions.getInstructions(page.value);
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  onMounted(() => fetchInstructions());
</script>
