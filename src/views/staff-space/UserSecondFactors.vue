<template>
  <h1>Second Factors</h1>
  <h2>
    {{ secondFactors.owner ? secondFactors.owner.username : 'A user' }}'s
    registered second factors.
  </h2>
  <div class="quick-action-buttons-container">
    <BackButton :fallback="`/staff/user?id=${secondFactors.owner?.id}`" />
    <template v-if="!selecting">
      <button @click="selecting = true" :disabled="secondFactors.loading">
        Select...
      </button>
      <button @click="deleteAllSecondFactorsModal!.show()">Delete All</button>
    </template>
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
            class="content-box-container grow"
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

  <ConfirmModal
    ref="manageSecondFactorModal"
    :title="secondFactors.selectedSecondFactor?.name"
    @submit="manageSecondFactor"
    deny-button="Close"
    confirm-button="Remove"
  >
    <template v-if="!!secondFactors.selectedSecondFactor">
      <span class="sb-code-label">
        <p>Type:</p>
        <code v-text="secondFactors.selectedSecondFactor.type" />
      </span>
      <span class="sb-code-label">
        <p>Registered:</p>
        <code
          v-text="
            toDateString(new Date(secondFactors.selectedSecondFactor.createdAt))
          "
        />
      </span>
      <span class="sb-code-label">
        <p>Updated:</p>
        <code
          v-text="
            toDateString(new Date(secondFactors.selectedSecondFactor.updatedAt))
          "
        />
      </span>
      <span class="sb-code-label">
        <p>Last Used:</p>
        <code v-text="secondFactors.selectedFactorFuzzyLastUsedAt" />
      </span>
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
      <code v-text="secondFactors.selectedSecondFactor?.name" />? This action
      cannot be undone.
    </p>
    <input
      hidden
      type="text"
      autocomplete="username"
      :value="user.account?.user.username"
    />
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
      hidden
      type="text"
      autocomplete="username"
      :value="user.account?.user.username"
    />
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
  import toDateString from '@/utils/toDateString.js';
  import loadWhenOnline from '@/utils/loadWhenOnline.js';
  import backWithFallback from '@/utils/routerBackWithFallback.js';
  import defaultErrorHandler from '@/utils/defaultErrorHandler.js';

  // Store Modules
  import { secondFactorsStore } from '@/stores/staff-space/secondFactors.js';
  import { toastStore } from '@/stores/toast.js';
  import { userStore } from '@/stores/user.js';

  // External Modules
  import { ref, onMounted } from 'vue';
  import { useOnline } from '@/utils/ConnectivityCheck.js';
  import { useRouter } from 'vue-router';

  const secondFactors = secondFactorsStore(),
    toast = toastStore(),
    router = useRouter(),
    user = userStore(),
    online = useOnline(),
    selecting = ref(false),
    selected = ref<string[]>([]),
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
      await secondFactors.getSecondFactor(secondFactor.id + '');
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
    secondFactors.selectedSecondFactor = null;
    selecting.value = false;
    selected.value = [];
  }

  async function manageSecondFactor(choice: boolean) {
    await manageSecondFactorModal.value!.hide();
    if (!choice) {
      cancelSelection();
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
        secondFactors.selectedSecondFactor!.id + '',
        password,
      );
      await confirmDeleteModal.value!.hide();
      secondFactors.selectedSecondFactor = null;
      await fetchSecondFactors();
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }
</script>
