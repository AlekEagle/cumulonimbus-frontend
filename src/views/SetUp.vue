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
        @change="sessionTypeSelector"
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
        >The session selector tells me wether or not you want to enter your
        password again, its good so if the session token gets leaked you can
        know which one you need to revoke. It also generates a new token that
        won't be expiring any time soon, so that way you don't have to worry
        about making a new one every time.</p
      >
    </Modal>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import Modal from '@/components/Modal.vue';

  @Options({
    components: { Modal },
    data() {
      return {
        newSession: true
      };
    }
  })
  export default class SetUp extends Vue {}
</script>
