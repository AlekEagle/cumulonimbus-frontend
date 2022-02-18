<template>
  <h1>Domains</h1>
  <h2
    >Here you can see and manage all of the domains on Cumulonimbus. There's
    {{ $data.domainCount }} to be exact.</h2
  >
  <div class="quick-actions-buttons-container">
    <button @click="$router.back()" title="Back to cool town square."
      >Back</button
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
        Click to manage this domain.
      </ContentBox>
    </div>
    <Loading v-else />
  </Paginator>

  <ConfirmModal
    ref="confirmBulkDeleteModal"
    @confirm="bulkDelete"
    @deny="clearSelection"
    title="Delete these domains?"
    choice-closes-modal
  />
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import ContentBox from '@/components/ContentBox.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import Paginator from '@/components/Paginator.vue';
  import FormModal from '@/components/FormModal.vue';
  import Loading from '@/components/Loading.vue';
  import { Cumulonimbus, Client } from '../../../../cumulonimbus-wrapper';
  import App from '@/App.vue';

  @Options({
    components: {
      ContentBox,
      ConfirmModal,
      Paginator,
      FormModal,
      Loading
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
  }
</script>
