<template>
  <h1>Admin Dashboard</h1>
  <h2>
    Welcome to the Cool Zone,
    {{
      $store.state.user ? `${$store.state.user.displayName}!` : 'uhh, hang on..'
    }}
  </h2>
  <div class="quick-action-buttons-container">
    <button @click="$router.push('/dashboard')" title="Back to normal town.">
      Return to Dashboard
    </button>
  </div>
  <div class="content-box-group-container">
    <ContentBox
      title="Users"
      src="/assets/images/profile.svg"
      span
      to="users/"
      theme-safe
    >
      <p>View and manage users</p>
    </ContentBox>
    <ContentBox
      title="Files"
      src="/assets/images/file.svg"
      span
      to="files/"
      theme-safe
    >
      <p>View and manage all files.</p>
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
          "Looks like you're offline, I'm pretty useless offline.",
          5000
        );
        return;
      }

      if (!(await (this.$parent?.$parent as App).isStaff())) {
        this.$router.replace('/');
      }
    }
  }
</script>
