<template>
  <h1>This doesn't look like the right place...</h1>
  <h2>Um, I think we took a wrong turn somewhere.</h2>
  <h2>404 not found! The page you're looking for probably doesn't exist!</h2>
  <div class="quick-action-buttons-container">
    <button @click="$router.push('/')" title="Lets go home!">
      I wanna go home.
    </button>
    <BackButton fallback="/" title="Retrace your steps. duh.">
      Retrace my steps.
    </BackButton>
  </div>
  <div class="funny-padding">
    <transition name="fade">
      <p v-if="$data.line >= 0">Do you have the map upside-down?</p>
    </transition>
    <transition name="fade">
      <p v-if="$data.line >= 1">What about your compass, did you break it?</p>
    </transition>
    <transition name="fade">
      <p v-if="$data.line >= 2"
        >Look, you're the one who got us lost, it was fun for a little bit, but
        its starting to get cold and I wanna go home.</p
      >
    </transition>
    <transition name="fade">
      <p v-if="$data.line >= 3"
        ><strong>My fault?</strong> What do you mean its my fault? You're
        clearly the one holding the map, the compass, and the one I put in
        charge of navigating!</p
      >
    </transition>
    <transition name="fade">
      <p v-if="$data.line >= 4"
        >Oh, since I put you in charge of navigation its my fault?</p
      >
    </transition>
    <transition name="fade">
      <p v-if="$data.line >= 5"
        >Look, lets just stop arguing, this button above me looks like it might
        send us home. Try it.</p
      >
    </transition>
    <transition name="fade">
      <p v-if="$data.line >= 6"
        >What are you waiting for? This is the easiest job I've ever given you,
        just push a button, some magic happens, and boom! We're home.</p
      >
    </transition>
    <transition name="fade">
      <p v-if="$data.line >= 7"
        >What do you mean "What button?" It's the one up there! Are you blind?
        Well, that explains how you <strong>somehow</strong> got us lost.</p
      >
    </transition>
    <transition name="fade">
      <p v-if="$data.line >= 8"
        >I'm seeing things? Man, you really are blind. This is why I shouldn't
        have trusted you with anything remotely important.</p
      >
    </transition>
    <transition name="fade">
      <p v-if="$data.line >= 9"
        >I guess I'll do this myself. You are useless.</p
      >
    </transition>
    <transition name="fade">
      <p v-if="$data.line >= 10">There, I pushed it.</p>
    </transition>
    <transition name="fade">
      <p v-if="$data.line >= 11">Ugh, you broke it somehow. Good job.</p>
    </transition>
    <transition name="fade">
      <p v-if="$data.line >= 12"
        >No, I'm not calling mom and dad. I can get us home myself with or
        without this stupid magic button.</p
      >
    </transition>
    <transition name="fade">
      <p v-if="$data.line >= 13"
        >I'm not going to get lost. I'm going to find my way home.</p
      >
    </transition>
    <transition name="fade">
      <p v-if="$data.line >= 14"
        >Fine you can stay here and wait for your imaginary hero to save you,
        later nerd.</p
      >
    </transition>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import BackButton from '@/components/BackButton.vue';

  @Options({
    components: {
      BackButton
    },
    data() {
      return {
        line: -1,
        maxLines: 14,
        nextLineTimeout: undefined
      };
    },
    title: 'Where Are We?'
  })
  export default class NotFound extends Vue {
    declare $data: {
      line: number;
      maxLines: number;
      nextLineTimeout?: number;
    };
    mounted() {
      setTimeout(this.displayNextLine, 1000);
    }

    displayNextLine() {
      this.$data.nextLineTimeout = undefined;
      if (++this.$data.line >= this.$data.maxLines) {
        setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 1);
        return;
      } else {
        setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 1);
        this.$data.nextLineTimeout = setTimeout(this.displayNextLine, 5000);
      }
    }

    beforeUnmount() {
      if (this.$data.nextLineTimeout) clearTimeout(this.$data.nextLineTimeout);
    }
  }
</script>

<style>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.4s;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .fade-enter-to,
  .fade-leave-from {
    opacity: 1;
  }

  .funny-padding {
    padding: 1em;
  }
</style>
