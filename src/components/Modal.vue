<template>
  <transition name="modal">
    <div
      v-if="__show"
      :class="`modal-container${__cancelable ? '' : ' no-close'}`"
      @click.self="
        () => {
          if (!__cancelable) return;
          hideModal();
        }
      "
    >
      <div class="modal">
        <div class="modal-header">
          <h1 class="modal-title" v-text="__title" /><img
            v-if="__cancelable"
            class="modal-close"
            src="/assets/images/close.svg"
            alt="Close Modal"
            @click.self="hideModal"
        /></div>
        <div class="modal-content">
          <slot name="default">
            <p>Default Modal Content</p>
          </slot>
        </div>
        <div class="modal-buttons">
          <slot name="buttons">
            <button @click="hideModal" v-if="__cancelable">Close</button>
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';

  @Options({
    components: {},
    props: {
      title: String,
      cancelable: Boolean,
      show: Boolean
    },
    computed: {
      __title() {
        return this.title || 'Modal Title';
      },
      __cancelable() {
        return this.cancelable;
      }
    },
    data() {
      return {
        __show: false
      };
    }
  })
  export default class VueComponent extends Vue {
    declare $data: {
      __show: boolean;
    };
    declare show: boolean;
    hideModal() {
      this.$data.__show = false;
    }
    showModal() {
      this.$data.__show = true;
    }
    mounted() {
      if (this.show) setTimeout(() => (this.$data.__show = this.show), 500);
    }
  }
</script>

<style>
  .modal-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    z-index: 15;
    background-color: #000000aa;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(3px);
  }

  .modal {
    background-color: #fff;
    width: fit-content;
    padding: 25px;
    margin: 25px;
    cursor: default;
    border-radius: 20px;
  }

  html.dark-theme .modal {
    background-color: #212121;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
  }

  .modal-title {
    margin: auto;
  }

  .modal-close {
    display: inline;
    margin-left: 15px;
    cursor: pointer;
  }

  html.dark-theme .modal-close {
    filter: invert(1);
  }

  .modal-content p {
    margin: 0;
  }

  .modal-content {
    margin: 15px 0 10px;
  }

  .modal-buttons button {
    margin: 0 5px;
  }

  .modal-container.no-close {
    cursor: not-allowed;
  }

  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.4s, backdrop-filter 0.4s;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
    backdrop-filter: none;
  }

  .modal-enter-to,
  .modal-leave-from {
    opacity: 1;
    backdrop-filter: blur(3px);
  }
</style>
