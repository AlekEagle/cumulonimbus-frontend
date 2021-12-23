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
    ><button
      @click="disable = !disable"
      title="Toggle the disabled state of the content boxes below."
      >Toggle ContentBox Disabled</button
    >
  </div>
  <div class="content-box-group-container">
    <ContentBox
      title="Profile"
      src="/assets/images/profile.svg"
      :disabled="disable"
      theme-safe
    >
      <p>View and manage your profile.</p>
    </ContentBox>
    <ContentBox
      title="Files"
      src="/assets/images/file.svg"
      :disabled="disable"
      theme-safe
    >
      <p>View and manage your files.</p>
    </ContentBox>
    <ContentBox
      title="Quick Set Up"
      src="/assets/images/info.svg"
      :disabled="disable"
      @click="lol"
      theme-safe
    >
      <p
        >Instructions on how to quickly get setup with your favorite file
        sharing application!</p
      >
    </ContentBox>
    <ContentBox
      title="Upload From Browser"
      src="/assets/images/upload.svg"
      :disabled="disable"
      to="upload/"
      theme-safe
    >
      <p
        >Upload directly from your browser, no external software required!
        (installing the dashboard as an app on Android will allow you to use the
        share menu to upload files!)</p
      >
    </ContentBox>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { Cumulonimbus } from '../../../cumulonimbus-wrapper';
  import App from '@/App.vue';
  import ContentBox from '@/components/ContentBox.vue';

  @Options({
    components: { ContentBox },
    data() {
      return {
        disable: false
      };
    }
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

    lol(e: MouseEvent) {
      if ((e.target as HTMLDivElement).classList.contains('disabled')) return;
      (this.$parent?.$parent as App).temporaryToast('You smell', 15000);
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
