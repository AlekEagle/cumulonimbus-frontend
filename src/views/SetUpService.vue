<template>
  <h1>Set Up</h1>
  <h2>Trust me, you'll be done in a couple minutes.</h2>
  <div class="content-box-group-container"> </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import ContentBox from '@/components/ContentBox.vue';
  import Modal from '@/components/Modal.vue';

  @Options({
    components: { ContentBox, Modal }
  })
  export default class SetUpService extends Vue {}
</script>

<style></style>
