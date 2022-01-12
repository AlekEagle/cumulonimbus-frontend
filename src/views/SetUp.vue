<template>
  <h1>Officially Supported Services</h1>
  <h2>
    Get your favorite file sharing application or platform set up and ready to
    use with only a few simple steps!
  </h2>
  <div class="content-box-group-container">
    <ContentBox
      v-for="service in services"
      :key="service.name"
      :title="service.displayName"
      :to="`/dashboard/set-up/service/?name=${service.name}`"
      span
    >
      <p>{{ service.description }}</p>
    </ContentBox>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import Modal from '@/components/Modal.vue';
  import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';
  import ContentBox from '@/components/ContentBox.vue';
  import App from '@/App.vue';

  @Options({
    components: { Modal, ContentBox },
    data() {
      return {
        services: []
      };
    },
    title: 'Officially Supported Services'
  })
  export default class SetUp extends Vue {
    declare $data: {
      services: Cumulonimbus.Data.Instruction[];
    };
    async mounted() {
      if (!navigator.onLine) {
        (this.$parent?.$parent as App).temporaryToast(
          "Looks like you're offline, I'm pretty useless offline.",
          10000
        );
        return;
      }
      if (
        await (this.$parent?.$parent as App).redirectIfNotLoggedIn(
          window.location.pathname + window.location.search
        )
      )
        return;
      try {
        let services = await (
          this.$store.state.client as Client
        ).getInstructions();
        this.$data.services = services.items;
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
          case 'BANNED_ERROR':
            (this.$parent?.$parent as App).temporaryToast(
              "Uh oh, looks like you've been banned from Cumulonimbus, sorry for the inconvenience.",
              10000
            );
            (this.$parent?.$parent as App).redirectIfNotLoggedIn(
              window.location.pathname
            );
            break;
          default:
            (this.$parent?.$parent as App).temporaryToast(
              'I did a bad.',
              10000
            );
            console.error(error);
        }
      }
    }
  }
</script>
