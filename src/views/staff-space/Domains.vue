<template>
  <h1>Domains</h1>
  <template v-if="online || domains.data">
    <template v-if="domains.data">
      <h2>
        Showing page {{ page + 1 }} of
        {{ (domains.data ? Math.floor(domains.data?.count / 51) : 0) + 1 }}
        <br />
        {{ domains.data?.count || 'some number of' }} domains in total.
      </h2>
    </template>
    <h2 v-else class="animated-ellipsis"
      >Alek is remembering what domains there are</h2
    >
  </template>
  <h2 v-else
    >Alek can't remember what domains there are because you're offline :(</h2
  >
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
    :max="domains.data ? Math.floor(domains.data.count / 51) : 0"
    :disabled="domains.loading || !online"
    @page-change="fetchDomains"
  >
    <template v-if="!domains.loading">
      <template v-if="!domains.errored">
        <div
          class="content-box-container"
          v-if="domains.data && domains.data.count > 0"
        >
          <SelectableContentBox
            v-for="domain in domains.data.items"
            :title="domain.domain"
            :selecting="selecting"
            :src="gearIcon"
            theme-safe
            :selected="selected.includes(domain.domain)"
            @click="onDomainClick(domain)"
          >
            Subdomains are
            <code>{{
              domain.allowsSubdomains ? 'allowed' : 'not allowed'
            }}</code
            >.
          </SelectableContentBox>
        </div>
        <div v-else class="no-content-container">
          <h1>There are no domains.</h1>
          <h2>You should probably fix that.</h2>
          <button>Create</button>
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
  </Paginator>
  <ConfirmModal
    ref="bulkDeleteDomainModal"
    title="Are you sure?"
    :disabled="domains.loading"
    @submit="deleteDomains"
  >
    <p>Are you sure you want to delete these {{ selected.length }} domains?</p>
    <p
      >All users using them will have their domain selection reset to
      default.</p
    >
  </ConfirmModal>
  <ConfirmModal
    ref="manageDomainModal"
    title="Manage Domain"
    :disabled="domains.loading"
    deny-button="Close"
    confirm-button="Delete"
    @submit="showDeleteModal"
  >
    <template v-if="selectedDomain">
      <code v-text="selectedDomain.domain" />
      <p
        >Created at:
        <code v-text="toDateString(new Date(selectedDomain.createdAt))" />
      </p>
      <p
        >Last updated at:
        <code v-text="toDateString(new Date(selectedDomain.updatedAt))" />
      </p>
      <Switch
        @change="onAllowSubdomainsChange"
        :checked="selectedDomain.allowsSubdomains"
      >
        Allow Subdomains
      </Switch>
    </template>
  </ConfirmModal>
  <ConfirmModal
    ref="deleteDomainModal"
    title="Are you sure?"
    :disabled="domains.loading"
    @submit="deleteDomain"
  >
    <p
      >Are you sure you want to delete
      <code v-text="selectedDomain!.domain" />?</p
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
      name="domain"
      placeholder="Domain"
      required
      :disabled="domains.loading"
    />
    <Switch name="allowsSubdomains" :disabled="domains.loading"
      >Allow Subdomains</Switch
    >
  </FormModal>
</template>

<script lang="ts" setup>
  import SelectableContentBox from '@/components/SelectableContentBox.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import Paginator from '@/components/Paginator.vue';
  import BackButton from '@/components/BackButton.vue';
  import Switch from '@/components/Switch.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import FormModal from '@/components/FormModal.vue';
  import { domainsStore } from '@/stores/staff-space/domains';
  import { userStore } from '@/stores/user';
  import { toastStore } from '@/stores/toast';
  import defaultErrorHandler from '@/utils/defaultErrorHandler';
  import { useOnline } from '@vueuse/core';
  import { ref, watch, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import gearIcon from '@/assets/images/gear.svg';
  import toDateString from '@/utils/toDateString';

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

  async function fetchDomains() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    window.scrollTo(0, 0);
    try {
      const status = await domains.getDomains(page.value);
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

  async function onDomainClick(domain: Cumulonimbus.Data.Domain) {
    if (selecting.value) {
      if (selected.value.includes(domain.domain)) {
        selected.value = selected.value.filter(d => d !== domain.domain);
      } else {
        selected.value.push(domain.domain);
      }
    } else {
      selectedDomain.value = domain;
      manageDomainModal.value!.show();
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

  async function deleteDomain(choice: boolean) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    if (!choice) {
      await deselect();
      return;
    }
    try {
      const status = await domains.deleteDomain(selectedDomain.value!.domain);
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          switch (status.code) {
            case 'INVALID_DOMAIN_ERROR':
              toast.show('That domain does not exist.');
              deselect();
              await fetchDomains();
              break;
          }
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Domain deleted.');
        deselect();
        await fetchDomains();
      }
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
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          toast.clientError();
        }
      } else {
        toast.show(`Deleted ${status} domains.`);
        deselectBulk();
        await fetchDomains();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function onAllowSubdomainsChange(allowSubdomains: boolean) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await domains.updateDomain(
        selectedDomain.value!.domain,
        allowSubdomains
      );
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          switch (status.code) {
            case 'INVALID_DOMAIN_ERROR':
              toast.show('That domain does not exist.');
              deselect();
              await fetchDomains();
              break;
          }
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Domain updated.');
        selectedDomain.value = (
          await user.client!.getDomain(selectedDomain.value!.domain)
        ).result;
        await fetchDomains();
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
          if (!domains.data || domains.page !== page.value) {
            fetchDomains();
          }
          unwatchOnline();
        }
      });
      return;
    }
    if (!domains.data || domains.page !== page.value) {
      fetchDomains();
    }
  });

  async function showDeleteModal(choice: boolean) {
    await manageDomainModal.value!.hide();
    if (!choice) return;
    await deleteDomainModal.value!.show();
  }

  async function createDomain(data: {
    domain: string;
    allowsSubdomains: boolean;
  }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await domains.createDomain(
        data.domain,
        data.allowsSubdomains
      );
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          switch (status.code) {
            case 'DOMAIN_EXISTS_ERROR':
              toast.show('That domain already exists.');
              break;
          }
        }
      } else if (!status) {
        toast.clientError();
      } else {
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
