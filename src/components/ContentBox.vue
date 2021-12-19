<template>
  <div class="content-box">
    <h2 class="content-box-title" v-text="contentTitle" />
    <div class="content-box-contents">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';

  @Options({
    props: {
      contentTitle: String
    }
  })
  export default class ContentBox extends Vue {}
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
  .content-box-contents * {
    margin: 0;
    float: left;
  }

  .content-box-contents {
    margin: 10px 0;
  }

  .content-box {
    text-align: center;
    position: relative;
    border: 1px solid #0d0d0d;
    border-radius: 25px;
    padding: 15px 25px;
    transition: border 0.25s, background-color 0.25s;
    margin: 10px 20px;
  }

  html.dark-theme .content-box {
    border: 1px solid #dedede;
  }
</style>
