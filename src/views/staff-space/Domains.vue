<template>
  <h1>Domains</h1>
  <h2>All of the usable domains.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/staff" />
    <template v-if="!selecting">
      <button @click="selecting = true" :disabled="domains.loading">
        Bulk Delete
      </button>
      <button @click="createDomainModal!.show()" :disabled="domains.loading">
        Create Domain
      </button>
    </template>
    <template v-else>
      <button @click="cancelSelection" :disabled="domains.loading">
        Cancel
      </button>
      <button
        @click="bulkDeleteDomainModal!.show()"
        :disabled="domains.loading"
      >
        Delete Selected
      </button>
    </template>
  </div>

  <Paginator
    v-model="page"
    :item-count="domains.data?.count || 0"
    :disabled="domains.loading || !online"
    @page-change="fetchDomains"
  >
    <Online>
      <template v-if="!domains.loading">
        <template v-if="!domains.errored">
          <div
            class="content-box-container"
            v-if="domains.data && domains.data.count > 0"
          >
            <SelectableContentBox
              v-for="domain in domains.data.items"
              :title="domain.id"
              :selecting="selecting"
              :src="gearIcon"
              theme-safe
              :selected="selected.includes(domain.id)"
              @click="onDomainClick(domain)"
            >
              <p>
                Subdomains are
                <code>{{ domain.subdomains ? 'allowed' : 'not allowed' }}</code
                >.
              </p>
            </SelectableContentBox>
          </div>
          <div v-else class="no-content-container">
            <h1>There are no domains.</h1>
            <h2>You should probably fix that.</h2>
            <button @click="createDomainModal!.show()">Create</button>
          </div>
        </template>
        <div class="no-content-container" v-else>
          <h1>Something went wrong.</h1>
          <button @click="fetchDomains">Retry</button>
        </div>
      </template>
      <div v-else class="no-content-container">
        <LoadingBlurb />
      </div>
    </Online>
  </Paginator>
  <ConfirmModal
    ref="bulkDeleteDomainModal"
    title="Are you sure?"
    :disabled="domains.loading"
    @submit="deleteDomains"
  >
    <p>Are you sure you want to delete these {{ selected.length }} domains?</p>
    <p>
      All users using them will have their domain selection reset to default.
    </p>
  </ConfirmModal>
  <ConfirmModal
    ref="manageDomainModal"
    title="Manage Domain"
    :disabled="domains.loading"
    deny-button="Close"
    confirm-button="Delete"
    @submit="showDeleteModal"
  >
    <code v-text="selectedDomain!.id" />
    <p>
      Created at:
      <code v-text="toDateString(new Date(selectedDomain!.createdAt))" />
    </p>
    <p>
      Last updated at:
      <code v-text="toDateString(new Date(selectedDomain!.updatedAt))" />
    </p>
    <p>
      This domain currently does{{
        selectedDomain!.subdomains ? ' ' : ' not '
      }}allow subdomains to be used.
    </p>
    <button v-if="selectedDomain!.subdomains" @click="disableSubdomains">
      Disable Subdomains
    </button>
    <button v-else @click="enableSubdomains">Enable Subdomains</button>
  </ConfirmModal>
  <ConfirmModal
    ref="deleteDomainModal"
    title="Are you sure?"
    :disabled="domains.loading"
    @submit="deleteDomain"
  >
    <p>Are you sure you want to delete <code v-text="selectedDomain!.id" />?</p>
    <p>All users using it will have their domain selection reset to default.</p>
  </ConfirmModal>
  <FormModal
    ref="createDomainModal"
    title="Create Domain"
    :disabled="domains.loading"
    @cancel="createDomainModal!.hide()"
    @submit="createDomain"
  >
    <input
      type="text"
      name="id"
      placeholder="Domain"
      required
      :disabled="domains.loading"
    />
    <Switch name="subdomains" :disabled="domains.loading"
      >Allow Subdomains</Switch
    >
  </FormModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import FormModal from '@/components/FormModal.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import Online from '@/components/Online.vue';
  import Paginator from '@/components/Paginator.vue';
  import SelectableContentBox from '@/components/SelectableContentBox.vue';
  import Switch from '@/components/Switch.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import defaultErrorHandler from '@/utils/defaultErrorHandler';
  import gearIcon from '@/assets/images/gear.svg';
  import toDateString from '@/utils/toDateString';
  import loadWhenOnline from '@/utils/loadWhenOnline';

  // Store Modules
  import { domainsStore } from '@/stores/staff-space/domains';
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';

  // External Modules
  import { ref, onMounted } from 'vue';
  import { useOnline } from '@vueuse/core';
  import { useRouter } from 'vue-router';

  const online = useOnline(),
    router = useRouter(),
    user = userStore(),
    toast = toastStore(),
    domains = domainsStore(),
    selecting = ref(false),
    selected = ref<string[]>([]),
    page = ref(0),
    manageDomainModal = ref<typeof ConfirmModal>(),
    bulkDeleteDomainModal = ref<typeof ConfirmModal>(),
    deleteDomainModal = ref<typeof ConfirmModal>(),
    createDomainModal = ref<typeof FormModal>(),
    selectedDomain = ref<Cumulonimbus.Data.Domain | null>(null);

  async function fetchDomains(): Promise<void> {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    window.scrollTo(0, 0);
    try {
      await domains.getDomains(page.value);
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function fetchDomain(id: string): Promise<boolean> {
    if (!online.value) {
      toast.connectivityOffline();
      return false;
    }
    try {
      const status = await user.client!.getDomain(id);
      selectedDomain.value = status.result;
      return true;
    } catch (error) {
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          // Handle special cases.
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_DOMAIN_ERROR':
              toast.show("Whoops! That domain doesn't exist.");
              await fetchDomains();
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    }
  }

  async function onDomainClick(
    domain: Cumulonimbus.Data.Domain,
  ): Promise<void> {
    if (selecting.value) {
      if (selected.value.includes(domain.id)) {
        selected.value = selected.value.filter((d) => d !== domain.id);
      } else {
        selected.value.push(domain.id);
      }
    } else {
      try {
        if (await fetchDomain(domain.id)) manageDomainModal.value!.show();
      } catch (error) {
        console.error(error);
        toast.clientError();
      }
    }
  }

  async function deselectBulk() {
    bulkDeleteDomainModal.value!.hide();
    selected.value = [];
    selecting.value = false;
  }

  async function deselect() {
    await deleteDomainModal.value!.hide();
    selectedDomain.value = null;
  }

  async function deleteDomain(choice: boolean): Promise<void> {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    if (!choice) {
      await deselect();
      return;
    }
    try {
      const status = await domains.deleteDomain(selectedDomain.value!.id);
      if (status) {
        toast.show('Domain deleted.');
        await fetchDomains();
      }
      deselect();
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function deleteDomains(choice: boolean) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    if (!choice) {
      await deselectBulk();
      return;
    }
    try {
      const status = await domains.deleteDomains(selected.value);
      if (status >= 0) {
        toast.show(`Deleted ${status} domains.`);
        deselectBulk();
        await fetchDomains();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function enableSubdomains(): Promise<void> {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await domains.enableSubdomains(selectedDomain.value!.id);
      if (status) {
        toast.show('Domain updated.');
        selectedDomain.value = (
          await user.client!.getDomain(selectedDomain.value!.id)
        ).result;
        await fetchDomains();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function disableSubdomains(): Promise<void> {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await domains.disableSubdomains(selectedDomain.value!.id);
      if (status) {
        toast.show('Domain updated.');
        selectedDomain.value = (
          await user.client!.getDomain(selectedDomain.value!.id)
        ).result;
        await fetchDomains();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  onMounted(async () =>
    loadWhenOnline(fetchDomains, !domains.data || domains.page !== page.value),
  );

  async function showDeleteModal(choice: boolean) {
    await manageDomainModal.value!.hide();
    if (!choice) return;
    await deleteDomainModal.value!.show();
  }

  async function createDomain(data: { id: string; subdomains: boolean }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await domains.createDomain(data.id, data.subdomains);
      if (status) {
        toast.show('Domain created.');
        createDomainModal.value!.hide();
        await fetchDomains();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  function cancelSelection() {
    selected.value = [];
    selecting.value = false;
  }
</script>
