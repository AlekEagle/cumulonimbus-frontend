<template>
  <h1>Domains</h1>
  <h2>All of the usable domains.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/staff" />
    <template v-if="!selecting">
      <button @click="selecting = true" :disabled="domains.loading">
        Select...
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
            class="content-box-container grow"
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
      <SkeletonContentBoxes v-else />
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
    <code v-text="domains.selectedDomain!.id" />
    <p>
      Created at:
      <code
        v-text="toDateString(new Date(domains.selectedDomain!.createdAt))"
      />
    </p>
    <p>
      Last updated at:
      <code
        v-text="toDateString(new Date(domains.selectedDomain!.updatedAt))"
      />
    </p>
    <p>
      This domain currently does{{
        domains.selectedDomain!.subdomains ? ' ' : ' not '
      }}allow subdomains to be used.
    </p>
    <button
      v-if="domains.selectedDomain!.subdomains"
      @click="disableSubdomains"
    >
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
    <p
      >Are you sure you want to delete
      <code v-text="domains.selectedDomain!.id" />?</p
    >
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
  import Online from '@/components/Online.vue';
  import Paginator from '@/components/Paginator.vue';
  import SelectableContentBox from '@/components/SelectableContentBox.vue';
  import SkeletonContentBoxes from '@/components/SkeletonContentBoxes.vue';
  import Switch from '@/components/Switch.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import gearIcon from '@/assets/images/gear.svg';
  import toDateString from '@/utils/toDateString.js';
  import loadWhenOnline from '@/utils/loadWhenOnline.js';

  // Store Modules
  import { domainsStore } from '@/stores/staff-space/domains.js';
  import { toastStore } from '@/stores/toast.js';

  // External Modules
  import { ref, onMounted } from 'vue';
  import { useOnline } from '@/utils/ConnectivityCheck.js';

  const online = useOnline(),
    toast = toastStore(),
    domains = domainsStore(),
    selecting = ref(false),
    selected = ref<string[]>([]),
    page = ref(0),
    manageDomainModal = ref<InstanceType<typeof ConfirmModal>>(),
    bulkDeleteDomainModal = ref<InstanceType<typeof ConfirmModal>>(),
    deleteDomainModal = ref<InstanceType<typeof ConfirmModal>>(),
    createDomainModal = ref<InstanceType<typeof FormModal>>();

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
        if (await domains.getDomain(domain.id)) manageDomainModal.value!.show();
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
    domains.selectedDomain = null;
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
      const status = await domains.deleteDomain(domains.selectedDomain!.id);
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
      const status = await domains.enableSubdomains(domains.selectedDomain!.id);
      if (status) {
        toast.show('Domain updated.');
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
      const status = await domains.disableSubdomains(
        domains.selectedDomain!.id,
      );
      if (status) {
        toast.show('Domain updated.');
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
