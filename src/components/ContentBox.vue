<template>
  <div
    :class="`content-box${$props.disabled ? ' disabled' : ''}${
      $props.selectable ? '' : ' no-select'
    }`"
  >
    <template v-if="$props.src !== undefined">
      <img
        :class="`content-box-icon${$props.themeSafe ? ' theme-safe' : ''}`"
        v-if="!$props.lazyLoad"
        :src="$props.src"
        alt="Content icon"
      />
      <LazyImage
        v-else
        :src="$props.src"
        failed-src="/assets/images/exclamation-mark.svg"
        :class="`content-box-icon${$props.themeSafe ? ' theme-safe' : ''}`"
        :error-handler="$props.thumbnailErrorHandler"
      />
    </template>
    <div class="content-box-text-content">
      <h2 class="content-box-title" v-text="$props.title" />
      <div class="content-box-content">
        <slot>
          <p>Da box with da content in it!</p>
        </slot>
      </div>
    </div>
    <span
      :class="`content-box-overlay${$props.disabled ? ' disabled' : ''}`"
      v-if="$props.span"
      @click.self="handleContentTo"
    />
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import LazyImage from '@/components/LazyImage.vue';
  import {
    LocationAsPath,
    RouteLocationOptions,
    RouteQueryAndHash
  } from 'vue-router';

  type RouteLocationRaw = RouteQueryAndHash &
    LocationAsPath &
    RouteLocationOptions;

  @Options({
    components: { LazyImage },
    props: {
      title: {
        type: String,
        default: 'Content Box Title'
      },
      span: Boolean,
      src: {
        type: String,
        default: undefined
      },
      to: {
        type: null,
        default: undefined
      },
      disabled: Boolean,
      selectable: Boolean,
      themeSafe: Boolean,
      lazyLoad: Boolean,
      newTab: Boolean,
      thumbnailErrorHandler: {
        type: Function,
        default: (
          res: Response | Error,
          cb: (data?: string | boolean) => Promise<void>
        ) => {
          cb(true);
        }
      }
    }
  })
  export default class ContentBox extends Vue {
    declare $props: {
      title: string;
      span: boolean;
      src?: string;
      to?: RouteLocationRaw;
      disabled: boolean;
      selectable: boolean;
      themeSafe: boolean;
      lazyLoad: boolean;
      newTab: boolean;
      thumbnailErrorHandler: (
        res: Response | Error,
        cb: (data?: string | boolean) => void
      ) => void;
    };
    handleContentTo() {
      if (this.$props.to !== undefined && !this.$props.disabled) {
        if (this.$props.newTab)
          window.open(
            typeof this.$props.to === 'string'
              ? this.$props.to
              : this.$props.to.path,
            '_blank'
          );
        else this.$router.push(this.$props.to);
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

  .content-box-content * {
    margin: 0;
    height: fit-content;
  }

  .content h2.content-box-title {
    overflow-wrap: anywhere;
    margin: 0;
  }

  .content-box-content {
    width: 100%;
  }

  .content-box-text-content {
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    text-align: left;
    flex-direction: column;
  }

  .content-box-text-content p {
    margin: 5px 0;
  }

  .content-box-icon ~ .content-box-text-content {
    margin-left: 14px;
  }
  .content-box-icon {
    min-width: 65px;
    width: 65px;
    max-height: 65px;
  }

  .content-box-icon.lds-default {
    top: -7.5px;
    left: -8.75px;
  }

  .content-box-icon.theme-safe {
    transition: filter 0.25s;
  }

  html.dark-theme .content-box-icon.theme-safe {
    filter: invert(1);
  }

  @media screen and (max-width: 789px) {
    :root {
      --content-boxes-per-row: 1;
    }
  }

  @media screen and (min-width: 790px) and (max-width: 1149px) {
    :root {
      --content-boxes-per-row: 2;
    }
  }

  @media screen and (min-width: 1150px) and (max-width: 1509px) {
    :root {
      --content-boxes-per-row: 3;
    }
  }

  @media screen and (min-width: 1510px) and (max-width: 1869px) {
    :root {
      --content-boxes-per-row: 4;
    }
  }

  @media screen and (min-width: 1870px) and (max-width: 2229px) {
    :root {
      --content-boxes-per-row: 5;
    }
  }

  @media screen and (min-width: 2230px) {
    :root {
      --content-boxes-per-row: 6;
    }
  }

  .content-box {
    text-align: center;
    position: relative;
    display: flex;
    border: 1px solid #0d0d0d;
    border-radius: 25px;
    padding: 15px 20px;
    transition: border 0.25s, background-color 0.25s, box-shadow 0.25s;
    margin: 15px 25px;
    flex-wrap: nowrap;
    width: calc(
      (100% - (25px * 2 + 20px * 2 + 1px * 2) * var(--content-boxes-per-row, 1)) /
        var(--content-boxes-per-row, 1)
    );
    align-items: center;
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
