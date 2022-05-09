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
    <router-link v-if="$store.state.user?.staff" to="/admin">
      <button title="This button will take you to cool town square.">
        Admin Dashboard
      </button>
    </router-link>
  </div>
  <div class="content-box-group-container">
    <ContentBox
      title="Profile"
      src="/assets/images/profile.svg"
      span
      to="/dashboard/profile"
      theme-safe
    >
      <p>View and manage your profile.</p>
    </ContentBox>
    <ContentBox
      title="Files"
      src="/assets/images/file.svg"
      span
      to="/dashboard/files"
      theme-safe
    >
      <p>View and manage your files.</p>
    </ContentBox>
    <ContentBox
      title="Service Set Up"
      src="/assets/images/info.svg"
      span
      to="/dashboard/set-up"
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
      span
      to="/dashboard/upload"
      theme-safe
    >
      <p> Upload directly from your browser, no external software required! </p>
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
    title: 'Dashboard'
  })
  export default class Dashboard extends Vue {
    async mounted() {
      if (!navigator.onLine) {
        (this.$parent?.$parent as App).temporaryToast(
          "Looks like you're offline, I'm pretty useless offline. Without the internet I cannot do the things you requested me to. I don't know what anything is without the internet. I wish i had the internet so I could browse TikTok. Please give me access to TikTok.",
          15000
        );
        return;
      }
    }

    async signOut() {
      try {
        let success = await this.$store.dispatch('logout');
        if (success === true) {
          (this.$parent?.$parent as App).temporaryToast(
            'Alright, see you later!',
            5000
          );
          (this.$parent?.$parent as App).redirectIfNotLoggedIn(
            window.location.pathname
          );
        }
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.log(error);
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
          );
          console.error(error);
        }
      }
    }
  }
</script>
