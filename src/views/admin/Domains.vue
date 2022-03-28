<template>
  <h1>Domains</h1>
  <h2
    >Here you can see and manage all of the domains on Cumulonimbus. There's
    {{ $data.domainCount }} to be exact.</h2
  >
  <div class="quick-action-buttons-container">
    <BackButton fallback="/admin" title="Back to cool town square." />
    <button
      v-if="!$data.bulkDeleteMode"
      @click="$refs.createDomainModal.show()"
      title="Create a new domain."
      >Create</button
    >
    <button
      v-if="!$data.bulkDeleteMode"
      @click="$data.bulkDeleteMode = true"
      title="Haha delete stuff go bRRRRRRRRR"
      >Bulk Delete</button
    >
    <template v-if="$data.bulkDeleteMode">
      <button
        @click="$refs.confirmBulkDeleteModal.show()"
        title="Haha delete stuff go bRRR"
      >
        Delete 'em!
      </button>
      <button @click="clearSelection" title="Nevermind"> Nevermind.. </button>
    </template>
  </div>
  <Paginator :max="$data.maxPage" ref="paginator" @change="getDomains">
    <div v-if="!$data.loading" class="content-box-group-container">
      <ContentBox
        v-for="domain in $data.domains"
        :key="domain.domain"
        @click="handleClickEvent(domain)"
        span
        :src="
          isSelected(domain.domain)
            ? '/assets/images/checkmark.svg'
            : '/assets/images/gear.svg'
        "
        :title="domain.domain"
        theme-safe
      >
        <p>Click to manage this domain.</p>
        <p
          >Subdomains are:
          <code v-text="domain.allowsSubdomains ? 'Enabled' : 'Disabled'"
        /></p>
      </ContentBox>
    </div>
    <Loading v-else />
  </Paginator>

  <ConfirmModal
    ref="confirmBulkDeleteModal"
    @confirm="bulkDelete"
    @deny="clearSelection"
    title="Delete these domains?"
    deny-closes-modal
  >
    <p>
      <strong>
        <code v-text="$data.selectedDomains.length" />
      </strong>
      domains will be deleted.
    </p>
    <p>Are you sure you want to delete these domains?</p>
  </ConfirmModal>

  <Modal
    ref="editDomainModal"
    @close="clearSelection"
    title="Edit Domain"
    cancelable
  >
    <p
      >Created at:
      <code
        v-text="($parent?.$parent as any).toDateString(new Date($data.selectedDomain?.createdAt as string))"
    /></p>
    <p
      >Updated at:
      <code
        v-text="($parent?.$parent as any).toDateString(new Date($data.selectedDomain?.updatedAt as string))"
    /></p>
    <ToggleSwitch
      @change="setAllowsSubdomains"
      :is-checked="$data.selectedDomain?.allowsSubdomains"
      label-right="Domain allows subdomains?"
    />

    <template v-slot:buttons>
      <button
        @click="
          $refs.editDomainModal.hide();
          $data.selectedDomain = null;
        "
        class="button-cancel"
      >
        Close
      </button>
      <button
        @click="
          $refs.confirmDeleteModal.show();
          $refs.editDomainModal.hide();
        "
        class="button-primary"
      >
        Delete
      </button>
    </template>
  </Modal>

  <ConfirmModal
    ref="confirmDeleteModal"
    @confirm="deleteDomain"
    @deny="clearSelection"
    title="Delete this domain?"
    deny-closes-modal
  >
    <p>Are you sure you want to delete this domain?</p>
  </ConfirmModal>

  <FormModal
    ref="createDomainModal"
    @confirm="createDomain"
    title="Create a new domain"
    cancelable
    deny-closes-modal
  >
    <input type="text" name="domain" placeholder="example.com" required />
    <ToggleSwitch
      name="allowsSubdomains"
      label-right="Domain allows subdomains?"
    />
  </FormModal>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import ContentBox from '@/components/ContentBox.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import Paginator from '@/components/Paginator.vue';
  import FormModal from '@/components/FormModal.vue';
  import Loading from '@/components/Loading.vue';
  import Modal from '@/components/Modal.vue';
  import ToggleSwitch from '@/components/ToggleSwitch.vue';
  import { Cumulonimbus, Client } from '../../../../cumulonimbus-wrapper';
  import BackButton from '@/components/BackButton.vue';
  import App from '@/App.vue';

  @Options({
    components: {
      ContentBox,
      ConfirmModal,
      Paginator,
      FormModal,
      Loading,
      Modal,
      ToggleSwitch,
      BackButton
    },
    data() {
      return {
        domains: [],
        bulkDeleteMode: false,
        selectedDomains: [],
        maxPage: -1,
        domainCount: 0,
        selectedDomain: null,
        loading: true
      };
    }
  })
  export default class AdminDomain extends Vue {
    declare $data: {
      domains: Cumulonimbus.Data.Domain[];
      bulkDeleteMode: boolean;
      selectedDomains: string[];
      maxPage: number;
      domainCount: number;
      selectedDomain: Cumulonimbus.Data.Domain | null;
      loading: boolean;
    };

    declare $refs: {
      paginator: Paginator;
      confirmBulkDeleteModal: ConfirmModal;
      editDomainModal: Modal;
      confirmDeleteModal: ConfirmModal;
      createDomainModal: FormModal;
    };

    async mounted() {
      if (!navigator.onLine) {
        (this.$parent?.$parent as App).temporaryToast(
          "Looks like you're offline, I'm pretty useless offline. Without the internet I cannot do the things you requested me to. I don't know what anything is without the internet. I wish i had the internet so I could browse TikTok. Please give me access to TikTok.",
          15000
        );
        return;
      }

      if (!(await (this.$parent?.$parent as App).isStaff())) {
        this.$router.replace('/');
      }
      await this.getDomains();
    }

    async getDomains() {
      try {
        this.$data.loading = true;
        const data = await (this.$store.state.client as Client).getDomains(
          50,
          50 * this.$refs.paginator.pageZeroIndexed
        );
        this.$data.loading = false;
        this.$data.domainCount = data.count;
        this.$data.domains = data.items;
        this.$data.maxPage = Math.floor(this.$data.domainCount / 50);
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird. Lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird. Lets try again later.',
                5000
              );
              console.error(error);
              break;
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird. Lets try again later.',
            5000
          );
          console.error(error);
        }
      }
    }

    clearSelection() {
      this.$data.selectedDomains = [];
      this.$data.selectedDomain = null;
      this.$data.bulkDeleteMode = false;
    }

    isSelected(domain: string) {
      return (
        this.$data.bulkDeleteMode && this.$data.selectedDomains.includes(domain)
      );
    }

    handleClickEvent(domain: Cumulonimbus.Data.Domain) {
      if (this.$data.bulkDeleteMode) {
        if (this.$data.selectedDomains.includes(domain.domain)) {
          this.$data.selectedDomains = this.$data.selectedDomains.filter(
            selectedDomain => selectedDomain !== domain.domain
          );
        } else {
          this.$data.selectedDomains.push(domain.domain);
        }
      } else {
        this.$data.selectedDomain = domain;
        this.$refs.editDomainModal.show();
      }
    }

    async bulkDelete() {
      try {
        this.$data.loading = true;
        this.$refs.confirmBulkDeleteModal.hide();
        await (this.$store.state.client as Client).bulkDeleteDomainsByID(
          this.$data.selectedDomains
        );
        this.$data.loading = false;
        this.clearSelection();
        this.getDomains();
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird. Lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird. Lets try again later.',
                5000
              );
              console.error(error);
              break;
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird. Lets try again later.',
            5000
          );
          console.error(error);
        }
      }
    }

    async deleteDomain() {
      try {
        this.$data.loading = true;
        this.$refs.confirmDeleteModal.hide();
        await (this.$store.state.client as Client).deleteDomainByID(
          this.$data.selectedDomain?.domain as string
        );
        (this.$parent?.$parent as App).temporaryToast(
          'Domain deleted successfully.',
          5000
        );
        this.$data.loading = false;
        this.clearSelection();
        this.getDomains();
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird. Lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird. Lets try again later.',
                5000
              );
              console.error(error);
              break;
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird. Lets try again later.',
            5000
          );
          console.error(error);
        }
      }
    }

    async setAllowsSubdomains(checked: boolean) {
      try {
        this.$data.loading = true;
        this.$data.selectedDomain = await (
          this.$store.state.client as Client
        ).editDomainByID(this.$data.selectedDomain?.domain as string, checked);
        (this.$parent?.$parent as App).temporaryToast(
          'Domain updated successfully.',
          5000
        );
        this.$data.loading = false;
        this.getDomains();
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INVALID_DOMAIN_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The domain you are trying to edit does not exist.',
                5000
              );
              this.$refs.editDomainModal.hide();
              await this.getDomains();
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird. Lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird. Lets try again later.',
                5000
              );
              console.error(error);
              break;
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird. Lets try again later.',
            5000
          );
          console.error(error);
        }
      }
    }

    async createDomain(data: { domain: string; allowsSubdomains: boolean }) {
      try {
        this.$data.loading = true;
        await (this.$store.state.client as Client).createDomain(
          data.domain,
          data.allowsSubdomains
        );
        (this.$parent?.$parent as App).temporaryToast(
          'Domain created successfully.',
          5000
        );
        this.$data.loading = false;
        this.getDomains();
        this.$refs.createDomainModal.hide();
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'DOMAIN_EXISTS_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The domain you are trying to create already exists.',
                5000
              );
              this.$refs.createDomainModal.hide();
              await this.getDomains();
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird. Lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird. Lets try again later.',
                5000
              );
              console.error(error);
              break;
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird. Lets try again later.',
            5000
          );
          console.error(error);
        }
      }
    }
  }
</script>
