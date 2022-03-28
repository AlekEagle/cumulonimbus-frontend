<template>
  <a :href="$data.displayLink" @click.prevent="navigate">
    <button :title="$props.title">
      <slot>Back</slot>
    </button>
  </a>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';

  @Options({
    inheritAttrs: false,
    props: {
      title: {
        type: String,
        default: 'Back'
      },
      fallback: {
        type: String,
        default: '/'
      }
    },
    data() {
      return {
        displayLink: ''
      };
    }
  })
  export default class BackButton extends Vue {
    declare $props: {
      title: string;
      fallback: string;
    };
    declare $data: {
      displayLink: string;
    };

    mounted() {
      this.$data.displayLink =
        window.history.state.back || this.$props.fallback;
    }

    async navigate(e: MouseEvent) {
      if (window.history.state.back !== null) {
        this.$router.back();
      } else {
        let current = window.location.pathname;
        window.history.replaceState({}, '', this.$props.fallback);
        window.history.pushState({}, '', current);
        this.$router.back();
      }
    }
  }
</script>
