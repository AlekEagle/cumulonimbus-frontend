<template>
  <h1>Second Factors</h1>
  <h2>
    {{ secondFactors.owner ? secondFactors.owner.username : 'A user' }}'s
    registered second factors.
  </h2>
  <div class="quick-action-buttons-container">
    <BackButton :fallback="`/staff/user?id=${secondFactors.owner?.id}`" />
    <button
      v-if="!selecting"
      @click="selecting = true"
      :disabled="secondFactors.loading"
    >
      Select...
    </button>
    <button v-if="!selecting" @click="deleteAllSecondFactorsModal!.show()">
      Delete All
    </button>
    <template v-else>
      <button @click="cancelSelection" :disabled="secondFactors.loading">
        Cancel Selection
      </button>
      <button
        @click="confirmDeleteMultipleModal!.show()"
        :disabled="secondFactors.loading"
      >
        Delete Selected
      </button>
    </template>
  </div>

  <Paginator
    v-model="page"
    @page-change="fetchSecondFactors"
    :item-count="secondFactors.data?.count || 0"
    :disabled="secondFactors.loading || !online"
  >
    <Online>
      <template v-if="!secondFactors.loading">
        <template v-if="!secondFactors.errored">
          <div
            v-if="secondFactors.data && secondFactors.data.count > 0"
            class="content-box-container"
          >
            <SelectableContentBox
              v-for="secondFactor in secondFactors.data.items"
              :title="secondFactor.name"
              :selecting="selecting"
              :src="infoIcon"
              theme-safe
              :selected="selected.includes(secondFactor.id + '')"
              @click="onSecondFactorClick(secondFactor)"
            >
              Click me to manage this second factor.
            </SelectableContentBox>
          </div>
          <div v-else class="no-content-container">
            <h1>
              {{
                secondFactors.owner ? secondFactors.owner.username : 'A user'
              }}
              has no registered second factors.
            </h1>
          </div>
        </template>
        <div class="no-content-container" v-else>
          <h1>Something went wrong.</h1>
          <button @click="fetchSecondFactors">Retry</button>
        </div>
      </template>
      <SkeletonContentBoxes v-else />
    </Online>
  </Paginator>

  <!-- TODO: Add a rename option and endpoint -->
  <ConfirmModal
    ref="manageSecondFactorModal"
    :title="selectedFactor?.name || 'Loading...'"
    @submit="manageSecondFactor"
    deny-button="Close"
    confirm-button="Remove"
  >
    <template v-if="!!selectedFactor">
      <h2 v-text="selectedFactor.name" />
      <p>
        Type:
        <code v-text="selectedFactor.type" />
      </p>
      <p>
        Registered:
        <code v-text="toDateString(new Date(selectedFactor.createdAt))" />
      </p>
      <p>
        Last updated at:
        <code v-text="toDateString(new Date(selectedFactor.updatedAt))" />
      </p>
      <!-- TODO: Add a last used at field -->
    </template>
    <LoadingMessage spinner v-else />
  </ConfirmModal>

  <FormModal
    ref="confirmDeleteModal"
    title="Are you sure?"
    @submit="onDeleteSecondFactor"
    @cancel="cancelSelection"
    :disabled="secondFactors.loading"
  >
    <p>
      Are you sure you want to delete the second factor
      <code v-text="selectedFactor?.name" />? This action cannot be undone.
    </p>
    <input
      type="password"
      autocomplete="current-password"
      placeholder="Password"
      name="password"
      :disabled="secondFactors.loading"
    />
  </FormModal>

  <FormModal
    ref="confirmDeleteMultipleModal"
    title="Are you sure?"
    @submit="onDeleteSecondFactors"
    @cancel="cancelSelection"
    :disabled="secondFactors.loading"
  >
    <p>
      Are you sure you want to delete the {{ selected.length }} selected second
      factors? This action cannot be undone.
    </p>
    <input
      type="password"
      autocomplete="current-password"
      placeholder="Password"
      name="password"
      :disabled="secondFactors.loading"
    />
  </FormModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import FormModal from '@/components/FormModal.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import Online from '@/components/Online.vue';
  import Paginator from '@/components/Paginator.vue';
  import SelectableContentBox from '@/components/SelectableContentBox.vue';
  import SkeletonContentBoxes from '@/components/SkeletonContentBoxes.vue';
  import LoadingMessage from '@/components/LoadingMessage.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import infoIcon from '@/assets/images/info.svg';
  import toDateString from '@/utils/toDateString';
  import loadWhenOnline from '@/utils/loadWhenOnline';
  import backWithFallback from '@/utils/routerBackWithFallback';
  import defaultErrorHandler from '@/utils/defaultErrorHandler';

  // Store Modules
  import { secondFactorsStore } from '@/stores/staff-space/secondFactors';
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';

  // External Modules
  import { ref, onMounted } from 'vue';
  import { useOnline } from '@vueuse/core';
  import { useRouter } from 'vue-router';

  const secondFactors = secondFactorsStore(),
    toast = toastStore(),
    router = useRouter(),
    user = userStore(),
    online = useOnline(),
    selecting = ref(false),
    selected = ref<string[]>([]),
    selectedFactor = ref<Cumulonimbus.Data.SecondFactor | null>(null),
    page = ref(0),
    confirmDeleteModal = ref<InstanceType<typeof FormModal>>(),
    confirmDeleteMultipleModal = ref<InstanceType<typeof FormModal>>(),
    manageSecondFactorModal = ref<InstanceType<typeof ConfirmModal>>(),
    deleteAllSecondFactorsModal = ref<InstanceType<typeof FormModal>>();

  async function fetchSecondFactors() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    window.scrollTo(0, 0);
    try {
      await secondFactors.getSecondFactors(page.value);
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function onSecondFactorClick(
    secondFactor: Cumulonimbus.Data.SecondFactor,
  ) {
    if (selecting.value) {
      if (selected.value.includes(secondFactor.id + '')) {
        selected.value = selected.value.filter(
          (id) => id !== secondFactor.id + '',
        );
      } else {
        selected.value.push(secondFactor.id + '');
      }
    } else {
      manageSecondFactorModal.value!.show();
      selectedFactor.value = (
        await user.client!.getUserSecondFactor(
          secondFactors.owner!.id,
          secondFactor.id + '',
        )
      ).result;
    }
  }

  onMounted(async () => {
    loadWhenOnline(
      initPage,
      !secondFactors.data ||
        secondFactors.page !== page.value ||
        secondFactors.owner?.id !==
          (router.currentRoute.value.query.id as string),
    );
  });

  async function initPage() {
    try {
      secondFactors.owner = (
        await user.client!.getUser(router.currentRoute.value.query.id as string)
      ).result;
    } catch (e) {
      if (e instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(e, router);
        if (!handled) {
          switch (e.code) {
            case 'INVALID_USER_ERROR':
              toast.show('This user does not exist.');
              backWithFallback(router, '/staff/users', true);
          }
        }
      } else {
        console.error(e);
        toast.genericError();
      }
    }
    fetchSecondFactors();
  }

  async function onDeleteSecondFactors({ password }: { password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      await secondFactors.deleteSecondFactors(selected.value, password);
      selected.value = [];
      selecting.value = false;
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  function cancelSelection() {
    selectedFactor.value = null;
    selecting.value = false;
    selected.value = [];
  }

  async function manageSecondFactor(choice: boolean) {
    await manageSecondFactorModal.value!.hide();
    if (!choice) {
      selectedFactor.value = null;
      return;
    } else await confirmDeleteModal.value!.show();
  }

  async function onDeleteSecondFactor({ password }: { password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      await secondFactors.deleteSecondFactor(
        selectedFactor.value!.id + '',
        password,
      );
      await confirmDeleteModal.value!.hide();
      selectedFactor.value = null;
      await fetchSecondFactors();
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }
</script>
