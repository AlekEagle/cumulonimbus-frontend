<template>
  <Modal ref="modal" :title="title" :cancelable="cancelable" @closed="decline">
    <template v-slot:default>
      <slot>
        <p>A modal for user confirmation.</p>
      </slot>
    </template>
    <template v-slot:buttons>
      <button @click="decline" title="That's what I thought.">Nevermind</button>
      <button @click="accept" title="Yes do thing">I'm sure</button>
    </template>
  </Modal>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import Modal from '@/components/Modal.vue';

  @Options({
    emits: ['accept', 'decline'],
    props: {
      cancelable: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: 'Are you sure?'
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
    declare cancelable: boolean;
    declare title: string;

    show() {
      this.$refs.modal.show();
    }

    hide() {
      this.$refs.modal.hide();
    }

    accept() {
      this.$emit('accept');
      this.hide();
    }

    decline() {
      this.$emit('decline');
      this.hide();
    }
  }
</script>
