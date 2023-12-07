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
    :disabled="instructions.loading || !online"
  >
    <Online>
      <template v-if="!instructions.loading">
        <template v-if="!instructions.errored">
          <div
            v-if="instructions.data && instructions.data.count > 0"
            class="content-box-container"
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
              The developers are either lazy or accidentally deleted the
              database
            </h2>
          </div>
        </template>
        <template v-else>
          <h1>Something went wrong.</h1>
          <button @click="fetchInstructions">Try again</button>
        </template>
      </template>
      <LoadingBlurb v-else />
    </Online>
  </Paginator>
</template>

<script lang="ts" setup>
  import ContentBox from '@/components/ContentBox.vue';
  import Paginator from '@/components/Paginator.vue';
  import BackButton from '@/components/BackButton.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import Online from '@/components/Online.vue';
  import { instructionsStore } from '@/stores/user-space/instructions';
  import { toastStore } from '@/stores/toast';
  import { ref, onMounted, watch } from 'vue';
  import defaultErrorHandler from '@/utils/defaultErrorHandler';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import { useRouter } from 'vue-router';
  import { useOnline } from '@vueuse/core';
  import infoIcon from '@/assets/images/info.svg';

  const instructions = instructionsStore(),
    toast = toastStore(),
    router = useRouter(),
    online = useOnline(),
    page = ref(0);

  async function fetchInstructions() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    window.scrollTo(0, 0);
    try {
      const status = await instructions.getInstructions(page.value);
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          toast.clientError();
        }
      } else if (!status) {
        toast.clientError();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  onMounted(async () => {
    if (!online.value) {
      const unwatchOnline = watch(online, () => {
        if (online.value) {
          if (!instructions.data || instructions.page !== page.value) {
            fetchInstructions();
          }
          unwatchOnline();
        }
      });
      return;
    }
    if (!instructions.data || instructions.page !== page.value) {
      fetchInstructions();
    }
  });
</script>
