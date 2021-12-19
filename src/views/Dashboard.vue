<template>
  <h1>Dashboard</h1>
  <h2
    >Welcome to Cumulonimbus,
    {{
      $data.self.displayName ? `${$data.self.displayName}!` : 'uhh, hang on..'
    }}</h2
  >
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { Cumulonimbus } from '../../../cumulonimbus-wrapper';

  @Options({
    components: {},
    data() {
      return {
        self: {}
      };
    }
  })
  export default class Dashboard extends Vue {
    declare $data: {
      self: Cumulonimbus.Data.User;
    };
    async mounted() {
      this.$data.self = await this.$store.state.client.getSelfUser();
    }
  }
</script>

<style></style>
