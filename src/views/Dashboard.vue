<template>
  <h1>Dashboard</h1>
  <h2
    >Welcome to Cumulonimbus,
    {{
      $store.state.user ? `${$store.state.user.displayName}!` : 'uhh, hang on..'
    }}</h2
  >
  <div class="quick-action-buttons-container">
    <button @click="signOut" title="This button will sign you out, who knew!?"
      >Sign Out</button
    >
  </div>
  <div class="content-box-group-container">
    <ContentBox contentTitle="joe">
      <p> loollllsdlfeoloedfldfosdyfiasdjfgsl</p>
    </ContentBox>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { Cumulonimbus } from '../../../cumulonimbus-wrapper';
  import App from '@/App.vue';
  import ContentBox from '@/components/ContentBox.vue';

  @Options({
    components: { ContentBox }
  })
  export default class Dashboard extends Vue {
    async mounted() {
      if (this.$store.state.client === null) {
        (this.$parent?.$parent as App).redirectIfNotLoggedIn(
          window.location.pathname
        );
        return;
      }
      try {
        if (!this.$store.state.user) {
          let u = await this.$store.state.client.getSelfUser();
          this.$store.commit('setUser', u);
        }
      } catch (error) {
        if (
          (error as Cumulonimbus.ResponseError).code === 'INVALID_SESSION_ERROR'
        ) {
          (this.$parent?.$parent as App).redirectIfNotLoggedIn(
            window.location.pathname
          );
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'Whoops, something went wrong! Please try again later!',
            15000
          );
          console.error(error);
        }
      }
    }

    async signOut() {
      try {
        let success = await this.$store.dispatch('logout');
        if (success === true) {
          (this.$parent?.$parent as App).temporaryToast(
            'Alright, see you later!',
            15000
          );
          (this.$parent?.$parent as App).redirectIfNotLoggedIn(
            window.location.pathname
          );
        }
      } catch (error) {
        switch ((error as Cumulonimbus.ResponseError).code) {
          case 'RATELIMITED_ERROR':
            (this.$parent?.$parent as App).ratelimitToast(
              (error as Cumulonimbus.ResponseError).ratelimit.resetsAt
            );
            break;
          case 'INVALID_SESSION_ERROR':
            (this.$parent?.$parent as App).temporaryToast(
              "That's funny, your session just expired!",
              15000
            );
            this.$store.commit('setUser', null);
            this.$store.commit('setSession', null);
            this.$store.commit('setClient', null);
            (this.$parent?.$parent as App).redirectIfNotLoggedIn(
              window.location.pathname
            );
            break;
          default:
            (this.$parent?.$parent as App).temporaryToast(
              'Whoops, something went wrong! Please try again later!',
              15000
            );
            console.log(error);
        }
      }
    }
  }
</script>

<style></style>
