<template>
  <div
    :class="`content-box${contentDisabled ? ' disabled' : ''}${
      contentSelectable ? '' : ' no-select'
    }`"
  >
    <template v-if="iconSrc !== undefined">
      <img
        :class="`content-box-icon${iconThemeSafe ? ' theme-safe' : ''}`"
        v-if="!shouldLazyLoad"
        :src="iconSrc"
        alt="Content icon"
      />
      <LazyImage v-else :src="iconSrc" class="content-box-icon" />
    </template>
    <div class="content-box-text-content">
      <h2 class="content-box-title" v-text="contentTitle" />
      <div class="content-box-content">
        <slot>
          <p>Content of the box with content.</p>
        </slot>
      </div>
    </div>
    <span
      :class="`content-box-overlay${contentDisabled ? ' disabled' : ''}`"
      v-if="contentSpan"
      @click.self="handleContentTo"
    />
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import LazyImage from '@/components/LazyImage.vue';

  @Options({
    components: { LazyImage },
    props: {
      title: String,
      span: Boolean,
      src: String,
      to: String,
      disabled: Boolean,
      selectable: Boolean,
      themeSafe: Boolean,
      lazyLoad: Boolean
    },
    computed: {
      contentTitle() {
        return this.title || 'Content Box Title';
      },
      contentSpan() {
        return this.span;
      },
      iconSrc() {
        return this.src || undefined;
      },
      contentTo() {
        return this.to || undefined;
      },
      contentDisabled() {
        return this.disabled;
      },
      contentSelectable() {
        return this.selectable;
      },
      iconThemeSafe() {
        return this.themeSafe;
      },
      shouldLazyLoad() {
        return this.lazyLoad;
      }
    }
  })
  export default class ContentBox extends Vue {
    declare contentTitle: string;
    declare contentSpan: boolean;
    declare iconSrc?: string;
    declare contentTo?: string;
    declare contentDisabled: boolean;
    declare iconThemeSafe: boolean | null;
    handleContentTo() {
      if (this.contentTo !== undefined && !this.contentDisabled) {
        this.$router.push(this.contentTo);
      }
    }
  }
</script>

<style>
  .content-box-group-container {
    width: 100%;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
  }

  .content-box-title,
  .content-box-content * {
    margin: 0;
    float: left;
    height: fit-content;
  }

  .content-box-content {
    width: 100%;
  }

  .content-box-text-content {
    display: flex;
    flex-wrap: wrap;
    align-content: space-around;
  }

  .content-box-icon ~ .content-box-text-content {
    margin-left: 14px;
  }

  .content-box-icon {
    min-width: 85px;
    width: 85px;
    max-height: 85px;
  }

  .content-box-icon.theme-safe {
    transition: filter 0.25s;
  }

  html.dark-theme .content-box-icon.theme-safe {
    filter: invert(1);
  }

  .content-box {
    text-align: center;
    position: relative;
    display: flex;
    border: 1px solid #0d0d0d;
    border-radius: 25px;
    padding: 15px 20px;
    transition: border 0.25s, background-color 0.25s, box-shadow 0.25s;
    margin: 10px 20px;
    flex-wrap: nowrap;
  }

  .content-box.no-select {
    user-select: none;
  }

  .content-box.disabled {
    border: 1px solid #5f5f5f;
  }

  .content-box:hover:not(.disabled) {
    box-shadow: 0px 0px 8px 0px inset #0d0d0d, 0px 0px 8px 0px #0d0d0d;
  }

  html.dark-theme .content-box.disabled {
    border: 1px solid #353535;
  }

  html.dark-theme .content-box:hover:not(.disabled) {
    border: 1px solid #dedede;
    box-shadow: 0px 0px 8px 0px inset #dedede, 0px 0px 8px 0px #dedede;
  }

  .content-box-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    border-radius: 23px;
    transition: backdrop-filter 0.25s, background-color 0.25s;

    cursor: pointer;
    z-index: 1;

    background-image: url('/assets/images/empty.gif');
  }

  .content-box-overlay.disabled {
    background-color: #0d0d0d91;
    backdrop-filter: blur(5px);
    cursor: not-allowed;
  }
</style>
