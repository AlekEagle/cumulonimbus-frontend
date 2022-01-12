<template>
  <transition name="toast">
    <div class="toast-box" v-text="text" v-if="showing" />
  </transition>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';

  @Options({
    data() {
      return {
        text: '',
        showing: false,
        showTimeout: null
      };
    }
  })
  export default class Toast extends Vue {
    declare $data: {
      text: string;
      showing: boolean;
      showTimeout: number | null;
    };

    async toastTemporary(text: string, time: number = 10000) {
      this.$data.text = text;
      await this.show(time);
    }

    async toastPermanent(text: string) {
      this.$data.text = text;
      await this.show(true);
    }

    async show(time?: number | boolean) {
      if (this.$data.showing) {
        await this.hide();
      }
      this.$data.showing = true;
      if (typeof time === 'boolean') {
        if (!time) {
          this.$data.showTimeout = setTimeout(this.hide, 5000);
        }
      } else if (typeof time === 'number') {
        this.$data.showTimeout = setTimeout(this.hide, time);
      } else {
        this.$data.showTimeout = setTimeout(this.hide, 5000);
      }
    }

    hide() {
      return new Promise((resolve, reject) => {
        let shouldWait = false;
        if (this.$data.showing) {
          shouldWait = true;
          clearTimeout(this.$data.showTimeout as number);
          this.$data.showTimeout = null;
        }
        this.$data.showing = false;
        if (shouldWait) {
          setTimeout(resolve, 500);
        }
      });
    }
  }
</script>

<style>
  .toast-box {
    position: fixed;
    right: 35px;
    bottom: 35px;
    padding: 10px 15px;
    border-radius: 8px;
    box-shadow: 5px 5px 5px #000000aa, inset 0px 0px 3px #000000;
    border: 1px solid #000000;
    background-color: #f3f3f3;
    font-family: 'Ubuntu', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 20px;
    transition: background-color 0.25s, box-shadow 0.25s;
    overflow-y: hidden;
    margin-left: 35px;
    z-index: 30;
  }

  html.dark-theme .toast-box {
    background-color: #212121;
    border: 1px solid #aaaaaa;
    box-shadow: 5px 5px 5px #000000aa, inset 0px 0px 3px #aaaaaa;
  }

  .toast-enter-active,
  .toast-leave-active {
    transition: bottom 0.5s, opacity 0.5s;
  }

  .toast-enter-from,
  .toast-leave-to {
    bottom: -50px;
    opacity: 0;
  }

  .toast-enter-to,
  .toast-leave-from {
    bottom: 35px;
  }
</style>
