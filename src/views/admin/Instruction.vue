<template>
  <h1>Manage Instruction</h1>
  <h2
    >Here is where you manage
    {{ $data.instruction ? $data.instruction.displayName : 'instruction' }}
    specifically.</h2
  >
  <div class="quick-action-buttons-container">
    <BackButton fallback="/admin/instructions" title="Back to instructions." />
    <button
      @click="$refs.confirmDeleteModal.show()"
      title="Delete this instruction."
      >Delete</button
    >
    <button @click="$refs.editMetadataModal.show()" title="Edit metadata.">
      Edit Metadata
    </button>
  </div>
  <div v-if="!$data.loading" class="content-box-group-container">
    <ContentBox
      v-for="(step, index) in $data.instruction.steps"
      :key="index"
      :title="`Step ${index + 1}`"
      @click="
        $data.selectedStepIndex = index;
        $refs.editStepModal.show();
      "
      span
    >
      <p v-text="step" />
    </ContentBox>
    <ContentBox
      title="New Step"
      src="/assets/images/plus.svg"
      theme-safe
      span
      @click="createStep"
    >
      <p>Add a new step to this instruction.</p>
    </ContentBox>
  </div>
  <Loading v-else />

  <ConfirmModal
    ref="confirmDeleteModal"
    @confirm="deleteInstruction"
    title="Delete this instruction?"
    deny-closes-modal
  >
    <p>
      Are you sure you want to delete this instruction?
      <br />
      <br />
      This action cannot be undone.
    </p>
  </ConfirmModal>

  <FormModal
    ref="editStepModal"
    @confirm="editStep"
    :title="`Edit Step ${$data.selectedStepIndex + 1}`"
    deny-closes-modal
    cancelable
  >
    <textarea
      name="value"
      :value="$data.instruction.steps[$data.selectedStepIndex]"
      placeholder="Step"
    />
    <template v-slot:ext-buttons>
      <button
        @click="
          $refs.editStepModal.hide();
          deleteStep();
        "
        >Delete</button
      >
    </template>
  </FormModal>

  <FormModal
    ref="editMetadataModal"
    @confirm="editMetadata"
    :title="`Edit Metadata`"
    deny-closes-modal
    cancelable
  >
    <p>Leave file name blank to have file content copied to clipboard.</p>
    <input
      type="text"
      name="displayName"
      placeholder="Display Name"
      :value="$data.instruction.displayName"
    />
    <textarea
      name="description"
      placeholder="Description"
      :value="$data.instruction.description"
    />
    <input
      name="filename"
      placeholder="File name"
      :value="$data.instruction.filename"
    />
    <textarea
      name="fileContent"
      placeholder="File content"
      :value="$data.instruction.fileContent"
    />
  </FormModal>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { Cumulonimbus, Client } from '../../../../cumulonimbus-wrapper';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import Loading from '@/components/Loading.vue';
  import FormModal from '@/components/FormModal.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import BackButton from '@/components/BackButton.vue';
  import App from '@/App.vue';

  @Options({
    components: {
      ConfirmModal,
      Loading,
      FormModal,
      ContentBox,
      BackButton
    },
    data() {
      return {
        instruction: null,
        loading: true,
        selectedStepIndex: -1
      };
    }
  })
  export default class Instruction extends Vue {
    declare $data: {
      instruction: Cumulonimbus.Data.Instruction;
      loading: boolean;
      selectedStepIndex: number;
    };

    declare $refs: {
      confirmDeleteModal: ConfirmModal;
      editStepModal: FormModal;
      editMetadataModal: FormModal;
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

      if (!this.$route.query.name) {
        this.$router.replace('/admin/instructions');
        return;
      }

      await this.loadInstruction();
    }

    async loadInstruction() {
      try {
        this.$data.loading = true;
        this.$data.instruction = await (
          this.$store.state.client as Client
        ).getInstructionByID(this.$route.query.name as string);
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
            case 'INVALID_INSTRUCTION_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "The instruction you're trying to access doesn't exist. It may have been deleted.",
                5000
              );
              this.$router.replace('/admin/instructions');
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
              break;
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

    async createStep() {
      this.$data.instruction = await (
        this.$store.state.client as Client
      ).editInstructionByID(this.$data.instruction.name, {
        steps: [...this.$data.instruction.steps, '']
      });
      this.$data.selectedStepIndex = this.$data.instruction.steps.length - 1;
      this.$refs.editStepModal.show();
    }

    async deleteInstruction() {
      try {
        await (this.$store.state.client as Client).deleteInstructionByID(
          this.$data.instruction.name
        );
        this.$router.replace('/admin/instructions');
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
            case 'INVALID_INSTRUCTION_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "The instruction you're trying to access doesn't exist. It may have been deleted.",
                5000
              );
              this.$router.replace('/admin/instructions');
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
              break;
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

    async deleteStep() {
      try {
        this.$data.instruction = await (
          this.$store.state.client as Client
        ).editInstructionByID(this.$data.instruction.name, {
          steps: this.$data.instruction.steps.filter(
            (_, i) => i !== this.$data.selectedStepIndex
          )
        });
        this.$data.selectedStepIndex = -1;
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
            case 'INVALID_INSTRUCTION_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "The instruction you're trying to access doesn't exist. It may have been deleted.",
                5000
              );
              this.$router.replace('/admin/instructions');
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
              break;
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

    async editStep(step: { value: string }) {
      try {
        this.$data.instruction = await (
          this.$store.state.client as Client
        ).editInstructionByID(this.$data.instruction.name, {
          steps: this.$data.instruction.steps.map((s, i) =>
            i === this.$data.selectedStepIndex ? step.value : s
          )
        });
        this.$refs.editStepModal.hide();
        this.$data.selectedStepIndex = -1;
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
            case 'INVALID_INSTRUCTION_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "The instruction you're trying to access doesn't exist. It may have been deleted.",
                5000
              );
              this.$router.replace('/admin/instructions');
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
              break;
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

    async editMetadata(data: {
      description: string;
      displayName: string;
      filename: string;
      fileContent: string;
    }) {
      try {
        this.$data.instruction = await (
          this.$store.state.client as Client
        ).editInstructionByID(this.$data.instruction.name, {
          description: data.description,
          displayName: data.displayName,
          filename: data.filename === '' ? null : data.filename,
          fileContent: data.fileContent
        });
        this.$refs.editMetadataModal.hide();
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
            case 'INVALID_INSTRUCTION_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "The instruction you're trying to access doesn't exist. It may have been deleted.",
                5000
              );
              this.$router.replace('/admin/instructions');
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
              break;
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
  }
</script>
