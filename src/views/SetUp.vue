<template>
  <h1>Getting Set Up</h1>
  <h2>
    Get your favorite file sharing application or platform set up and ready to
    use with only a few simple steps!
  </h2>
  <div class="quick-action-buttons-container">
    <div class="checkbox-container"
      ><p class="label-left">This session</p>
      <input
        type="checkbox"
        id="session-type-selector"
        :checked="newSession"
        @change="e => ($data.newSession = e.target.checked)"
      />
      <label for="session-type-selector"><span></span></label
      ><p class="label-right">New session (recommended)</p>
    </div>
    <button
      @click="$refs.sessionSelectorModal.showModal()"
      title="Click me for more info!"
      >What does this mean?</button
    >
    <Modal ref="sessionSelectorModal" cancelable title="Session Selector">
      <p
        >The session selector tells me whether or not you want to enter your
        password again, its good so if the session token gets leaked you can
        know which one you need to revoke. It also generates a new token that
        won't be expiring any time soon, so that way you don't have to worry
        about making a new one every time.</p
      >
    </Modal>
  </div>
  <div class="content-box-group-container">
    <ContentBox
      v-for="service in services"
      :key="service.name"
      :title="service.displayName"
      :to="`/dashboard/set-up/service/?=${service.name}${
        newSession ? '&new-session' : ''
      }`"
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
        newSession: true,
        services: []
      };
    },
    title: 'Getting Set Up'
  })
  export default class SetUp extends Vue {
    declare $data: {
      newSession: boolean;
      services: Cumulonimbus.Data.Instruction[];
    };
    async mounted() {
      if (
        await (this.$parent?.$parent as App).redirectIfNotLoggedIn(
          window.location.pathname + window.location.search
        )
      )
        return;
      try {
        let services = await (
          this.$store.state.client as Client
        ).getAllInstructions();
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
