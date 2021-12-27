<template>
  <h1>Cumulonimbus, the funny cloud platform.</h1>

  <div class="hero-points">
    <div class="hero-point">
      <h2>The only file sharing platform</h2>
      <p
        >Yes, this is totally the only file sharing platform, don't even bother
        with looking up other file sharing platforms, because they don't exist.
        You can trust me, I'm the marketing material that's supposed to convince
        you to use this platform.</p
      >
    </div>
    <div class="hero-point">
      <h2>Large selection of domains</h2>
      <p
        >With a large selection of domains already, we are always accepting more
        domains if you're open to supplying them!</p
      >
    </div>
    <div class="hero-point">
      <h2>Support for uploading services</h2>
      <p
        >With official support for ShareX and ShareNiX, we are always looking to
        expand what is officially supported, just let us know what you want to
        see added and we'll see what we can do!</p
      >
    </div>
    <div class="hero-point">
      <h2>Having trouble?</h2>
      <p
        >We are always happy to help with any issues you might be having in our
        discord server!</p
      ></div
    >
    <div class="hero-point">
      <h2>Lets get started!</h2>
      <p
        >Click <router-link to="/dashboard/">me</router-link> to open the
        dashboard!</p
      >
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';

  @Options({
    components: {},
    title: ''
  })
  export default class Home extends Vue {}
</script>

<style>
  .hero-points {
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
  }

  .hero-point {
    width: 35vw;
  }

  @media only screen and (max-width: 768px) {
    .hero-point {
      width: 70vw;
    }
  }
</style>
