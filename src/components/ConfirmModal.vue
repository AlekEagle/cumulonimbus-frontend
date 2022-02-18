<template>
  <Modal
    ref="modal"
    :title="$props.title"
    :cancelable="$props.cancelable"
    @closed="decline"
  >
    <template v-slot:default>
      <slot>
        <p>A modal for user confirmation.</p>
      </slot>
    </template>
    <template v-slot:buttons>
      <button @click="decline" title="That's what I thought.">Nevermind</button>
      <button @click="accept" title="Yes do thing">I'm sure</button>
      <slot name="ext-buttons" />
    </template>
  </Modal>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import Modal from '@/components/Modal.vue';

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
      }
    },
    components: {
      Modal
    }
  })
  export default class ConfirmModal extends Vue {
    declare $refs: {
      modal: Modal;
    };
    declare $props: {
      cancelable: boolean;
      title: string;
      confirmClosesModal: boolean;
      denyClosesModal: boolean;
    };

    show() {
      this.$refs.modal.show();
    }

    hide() {
      this.$refs.modal.hide();
    }

    accept() {
      this.$emit('confirm');
      if (this.$props.confirmClosesModal) this.hide();
    }

    decline() {
      this.$emit('deny');
      if (this.$props.denyClosesModal) this.hide();
    }
  }
</script>
