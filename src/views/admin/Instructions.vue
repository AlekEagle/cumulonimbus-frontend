<template>
  <h1>Manage Instructions</h1>
  <h2>
    Here's where you can manage your instructions. There's
    {{ $data.instructionCount }} of them, to be exact.
  </h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/admin" title="Back to cool town square." />
    <button
      v-if="!$data.bulkDeleteMode"
      @click="$refs.newInstructionModal.show()"
      title="Create a new instruction."
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

  <Paginator ref="paginator" :max="$data.maxPage" @change="getInstructions">
    <div v-if="!$data.loading" class="content-box-group-container">
      <ContentBox
        v-for="instruction in $data.instructions"
        :key="instruction.name"
        :title="instruction.displayName"
        :src="
          isSelected(instruction.name)
            ? '/assets/images/checkmark.svg'
            : '/assets/images/info.svg'
        "
        span
        :to="
          !$data.bulkDeleteMode
            ? { path: '/admin/instruction', query: { name: instruction.name } }
            : null
        "
        @click="handleClickEvent(instruction.name)"
        theme-safe
      >
        <p v-text="instruction.description" />
      </ContentBox>
    </div>
    <Loading v-else />
  </Paginator>

  <ConfirmModal
    ref="confirmBulkDeleteModal"
    @confirm="bulkDelete"
    @deny="clearSelection"
    title="Delete these instructions?"
    deny-closes-modal
    cancelable
  >
    <p>
      <code v-text="$data.selectedInstructions.length" />
      instructions will be deleted.
    </p>
  </ConfirmModal>

  <FormModal
    ref="newInstructionModal"
    @confirm="createInstruction"
    deny-closes-modal
    title="New Instruction"
    cancelable
  >
    <input type="text" name="name" placeholder="Name" />
    <textarea name="description" placeholder="Description" />
  </FormModal>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { Cumulonimbus, Client } from '../../../../cumulonimbus-wrapper';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import Loading from '@/components/Loading.vue';
  import Paginator from '@/components/Paginator.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import FormModal from '@/components/FormModal.vue';
  import BackButton from '@/components/BackButton.vue';
  import App from '@/App.vue';

  @Options({
    components: {
      ConfirmModal,
      Loading,
      Paginator,
      ContentBox,
      FormModal,
      BackButton
    },
    data() {
      return {
        bulkDeleteMode: false,
        selectedInstructions: [],
        loading: false,
        maxPage: 0,
        instructions: [],
        instructionCount: 0
      };
    }
  })
  export default class AdminInstructions extends Vue {
    declare $data: {
      instructions: Cumulonimbus.Data.Instruction[];
      instructionCount: number;
      loading: boolean;
      bulkDeleteMode: boolean;
      maxPage: number;
      selectedInstructions: string[];
    };

    declare $refs: {
      newInstructionModal: FormModal;
      confirmBulkDeleteModal: ConfirmModal;
      paginator: Paginator;
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
      await this.getInstructions();
    }

    async getInstructions() {
      try {
        this.$data.loading = true;
        const curPageInstructions = await (
          this.$store.state.client as Client
        ).getInstructions(50, 50 * this.$refs.paginator.pageZeroIndexed);
        this.$data.instructions = curPageInstructions.items;
        this.$data.instructionCount = curPageInstructions.count;
        this.$data.maxPage = Math.floor(this.$data.instructionCount / 50);
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
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(error);
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
          );
          console.error(error);
        }
      } finally {
        this.$data.loading = false;
      }
    }

    clearSelection() {
      this.$data.selectedInstructions = [];
      this.$data.bulkDeleteMode = false;
    }

    isSelected(name: string) {
      return (
        this.$data.bulkDeleteMode &&
        this.$data.selectedInstructions.includes(name)
      );
    }

    handleClickEvent(name: string) {
      if (this.$data.bulkDeleteMode) {
        if (this.$data.selectedInstructions.includes(name)) {
          this.$data.selectedInstructions =
            this.$data.selectedInstructions.filter(
              instructionName => instructionName !== name
            );
        } else {
          this.$data.selectedInstructions.push(name);
        }
      }
    }

    async createInstruction(data: { name: string; description: string }) {
      try {
        let res = await (this.$store.state.client as Client).createInstruction(
          data.name.toLowerCase().replace(' ', '-'),
          [],
          null,
          '{{token}}',
          data.description,
          data.name
        );
        this.$refs.newInstructionModal.hide();
        this.$router.push({
          path: '/admin/instruction',
          query: { name: res.name }
        });
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
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            case 'INSUFFICIENT_PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(error);
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
          );
          console.error(error);
        }
      }
    }

    async bulkDelete() {
      try {
        this.$data.loading = true;
        this.$refs.confirmBulkDeleteModal.hide();
        await (this.$store.state.client as Client).bulkDeleteInstructionsByID(
          this.$data.selectedInstructions
        );
        this.clearSelection();
        await this.getInstructions();
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INSUFFICIENT_PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(error);
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
          );
          console.error(error);
        }
      } finally {
        this.$data.loading = false;
      }
    }
  }
</script>
