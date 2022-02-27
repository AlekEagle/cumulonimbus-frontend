<template>
  <ConfirmModal
    :cancelable="$props.cancelable"
    :title="$props.title"
    @confirm="accept"
    @deny="decline"
    ref="modal"
  >
    <form ref="form" @submit.prevent="accept">
      <slot />
      <input type="submit" />
    </form>
    <template v-slot:ext-buttons>
      <slot name="ext-buttons" />
    </template>
  </ConfirmModal>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import ConfirmModal from '@/components/ConfirmModal.vue';

  @Options({
    emits: ['confirm', 'deny'],
    props: {
      cancelable: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: 'Are you sure?'
      },
      confirmClosesModal: {
        type: Boolean,
        default: false
      },
      denyClosesModal: {
        type: Boolean,
        default: false
      },
      confirmResetsForm: {
        type: Boolean,
        default: false
      },
      denyResetsForm: {
        type: Boolean,
        default: false
      }
    },
    components: {
      ConfirmModal
    }
  })
  export default class FormModal extends Vue {
    declare $refs: {
      modal: ConfirmModal;
      form: HTMLFormElement;
    };
    declare $props: {
      cancelable: boolean;
      title: string;
      confirmClosesModal: boolean;
      denyClosesModal: boolean;
      confirmResetsForm: boolean;
      denyResetsForm: boolean;
    };

    show() {
      this.$refs.modal.show();
    }

    hide() {
      this.$refs.modal.hide();
    }

    accept() {
      const inputs = this.$refs.form.querySelectorAll('input:not([type="submit"]),textarea'),
        dataAsJSON: { [key: string]: string | boolean } = {};

      inputs.forEach(el => {
        if ((el as HTMLInputElement).type === 'checkbox') dataAsJSON[(el as HTMLInputElement).name] = (el as HTMLInputElement).checked;
        else dataAsJSON[(el as HTMLInputElement).name] = (el as HTMLInputElement).value;
      });

      this.$emit('confirm', dataAsJSON);
      if (this.$props.confirmClosesModal) this.hide();
      if (this.$props.confirmResetsForm) this.$refs.form.reset();
    }

    decline() {
      this.$emit('deny');
      if (this.$props.denyClosesModal) this.hide();
      if (this.$props.denyResetsForm) this.$refs.form.reset();
    }
  }
</script>
