<template>
  <h1>Admin Dashboard</h1>
  <h2>
    Welcome to the Cool Zone,
    {{
      $store.state.user ? `${$store.state.user.username}!` : 'uhh, hang on..'
    }}
  </h2>
  <div class="quick-action-buttons-container">
    <button
      @click="$router.replace('/dashboard')"
      title="Back to normal town square."
    >
      Return to Dashboard
    </button>
  </div>
  <div class="content-box-group-container">
    <ContentBox
      title="Users"
      src="/assets/images/profile.svg"
      span
      to="/admin/users"
      theme-safe
    >
      <p>View and manage users.</p>
    </ContentBox>
    <ContentBox
      title="Files"
      src="/assets/images/file.svg"
      span
      to="/admin/files"
      theme-safe
    >
      <p>View and manage all files.</p>
    </ContentBox>
    <ContentBox
      title="Domains"
      src="/assets/images/gear.svg"
      span
      to="/admin/domains"
      theme-safe
    >
      <p>View and manage domains.</p>
    </ContentBox>
    <ContentBox
      title="Instructions"
      src="/assets/images/info.svg"
      span
      to="/admin/instructions"
      theme-safe
    >
      <p>View and manage instructions.</p>
    </ContentBox>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import ContentBox from '@/components/ContentBox.vue';
  import App from '@/App.vue';

  @Options({
    components: { ContentBox },
    title: 'Admin Dashboard'
  })
  export default class AdminDashboard extends Vue {
    async mounted() {
      if (!navigator.onLine) {
        (this.$parent?.$parent as App).temporaryToast(
          "Looks like you're offline, I'm pretty useless offline. Without the internet I cannot do the things you requested me to. I don't know what anything is without the internet. I wish i had the internet so I could browse TikTok. Please give me access to TikTok.",
          15000
        );
        return;
      }

      if (!(await (this.$parent?.$parent as App).isStaff())) {
        this.$router.replace('/');
      }
    }
  }
</script>
