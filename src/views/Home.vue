<template>
  <h1>Cumulonimbus, the funny cloud platform.</h1>

  <div class="hero-points">
    <div>
      <h2>The only file hosting platform.</h2>
      <p>
        Yes, this is totally the only file hosting platform, don't even bother
        with looking up other file hosting platforms, because they don't exist.
        You can trust me, I'm the marketing material that's supposed to convince
        you to use this platform.
      </p>
    </div>
    <div>
      <h2>Large selection of domains.</h2>
      <p>
        With a large selection of domains already, we are always accepting more
        domains if you're open to supplying them!
      </p>
    </div>
    <div>
      <h2>Support for uploading services.</h2>
      <p>
        With official support for ShareX and ShareNiX, we are always looking to
        expand what is officially supported, just let us know what you want to
        see added and we'll see what we can do!
      </p>
    </div>
    <div>
      <h2>Having trouble?</h2>
      <p>
        We are always happy to help with any issues you might be having in our
        <a href="https://alekeagle.com/d" rel="noopener" target="_blank"
          >Discord</a
        >
        server!
      </p>
    </div>
    <div>
      <h2>Lets get started!</h2>
      <p>
        Click <router-link to="/dashboard">here</router-link> to open the
        dashboard!
      </p>
    </div>
  </div>
</template>

<style>
.hero-points {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
}

.hero-points div {
  width: 45vw;
}

@media screen and (min-width: 769px) {
  .hero-points div:nth-child(even) {
    text-align: left;
  }

  .hero-points div:nth-child(odd):not(:last-child) {
    text-align: right;
  }
}

@media only screen and (max-width: 768px) {
  .hero-points div {
    width: 70vw;
  }
}
</style>
