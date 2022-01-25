<template>
  <h1>Officially Supported Services</h1>
  <h2>
    Get your favorite file sharing application or platform set up and ready to
    use with only a few simple steps!
  </h2>
  <div class="quick-action-buttons-container">
    <button @click="$router.replace('/dashboard/')" title="Go back!"
      >Back</button
    >
  </div>
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
          5000
        );
        return;
      }
      try {
        let services = await (
          this.$store.state.client as Client
        ).getInstructions();
        this.$data.services = services.items;
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                "That's funny, your session just expired!",
                5000
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
                5000
              );
              (this.$parent?.$parent as App).redirectIfNotLoggedIn(
                window.location.pathname
              );
              break;
            case 'INTERNAL_SERVER_ERROR':
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
              console.error(error);
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
