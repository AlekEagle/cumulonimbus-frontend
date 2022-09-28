<template>
  <h1>Setup Guides</h1>
  <template v-if="online || instructions.data">
    <template v-if="instructions.data">
      <h2>
        Showing page {{ page + 1 }} of
        {{
          (instructions.data ? Math.floor(instructions.data?.count / 50) : 0) +
          1
        }}
        <br />
        {{ instructions.data?.count || 'some number of' }} setup guides in
        total.
      </h2>
    </template>
    <h2 class="animated-ellipsis" v-else
      >Alek is individually reading the setup guides</h2
    >
  </template>
  <template v-else>
    <h2>Alek can't read the setup guides because you are offline :(</h2>
  </template>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard" />
  </div>
  <Paginator
    v-model="page"
    @page-change="fetchInstructions"
    :max="instructions.data ? Math.floor(instructions.data?.count / 50) : 0"
    :disabled="instructions.loading || !online"
  >
    <template v-if="online || instructions.data">
      <template v-if="!instructions.loading">
        <template v-if="!instructions.errored">
          <div
            v-if="instructions.data && instructions.data.count > 0"
            class="content-box-container"
          >
            <ContentBox
              v-for="instruction in instructions.data.items"
              :title="instruction.displayName"
              :src="infoIcon"
              theme-safe
              :to="`/dashboard/setup-guide?id=${instruction.name}`"
            >
              {{ instruction.description }}
            </ContentBox>
          </div>
          <div v-else class="no-content-container">
            <h1>There isn't anything here yet...</h1>
            <h2
              >The developers are either lazy or accidentally deleted the
              database</h2
            >
          </div>
        </template>
        <template v-else>
          <h1>Something went wrong.</h1>
          <button @click="fetchInstructions">Try again</button>
        </template>
      </template>
      <LoadingBlurb v-else />
    </template>
    <template v-else>
      <h1>Offline</h1>
      <h2
        >You are currently offline. Please connect to the internet to
        continue.</h2
      >
    </template>
  </Paginator>
</template>

<script lang="ts" setup>
  import ContentBox from '@/components/ContentBox.vue';
  import Paginator from '@/components/Paginator.vue';
  import BackButton from '@/components/BackButton.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import { userStore } from '@/stores/user';
  import { instructionsStore } from '@/stores/user-space/instructions';
  import { toastStore } from '@/stores/toast';
  import { ref, onMounted, watch } from 'vue';
  import toLogin from '@/utils/toLogin';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import { useRouter } from 'vue-router';
  import { useOnline } from '@vueuse/core';
  import infoIcon from '@/assets/images/info.svg';

  const user = userStore(),
    instructions = instructionsStore(),
    toast = toastStore(),
    router = useRouter(),
    online = useOnline(),
    page = ref(0);

  async function fetchInstructions() {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    window.scrollTo(0, 0);
    try {
      const status = await instructions.getInstructions(page.value);
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout();
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
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
