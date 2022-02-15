<template>
  <transition name="fullscreen-loading-animation-container">
    <div v-if="$data.__show" class="fullscreen-loading-animation-container">
      <Loading />
    </div>
  </transition>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import Loading from './Loading.vue';

  @Options({
    components: { Loading },
    data() {
      return {
        __show: false
      };
    }
  })
  export default class FullscreenLoading extends Vue {
    declare $data: {
      __show: boolean;
    };
    declare $refs: {
      loading: Loading;
    };

    show() {
      this.$data.__show = true;
    }

    hide() {
      this.$data.__show = false;
    }
  }
</script>

<style>
  .fullscreen-loading-animation-container {
    z-index: 15;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #000000aa;
    backdrop-filter: blur(3px);
    cursor: wait;
  }

  .fullscreen-loading-animation-container-enter-active,
  .fullscreen-loading-animation-container-leave-active {
    transition: opacity 0.4s, backdrop-filter 0.4s;
  }

  .fullscreen-loading-animation-container-enter-from,
  .fullscreen-loading-animation-container-leave-to {
    opacity: 0;
    backdrop-filter: blur(0px);
  }

  .fullscreen-loading-animation-container-enter-to,
  .fullscreen-loading-animation-container-leave-from {
    opacity: 1;
    backdrop-filter: blur(3px);
  }
</style>
