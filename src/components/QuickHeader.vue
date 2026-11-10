<template>
  <section class="content hero-content">
    <h1 class="hero-title">
      <slot name="title" />
    </h1>
    <p>
      <slot name="subtitle" />
    </p>
    <slot name="extra" />
  </section>
</template>

<style scoped>
  .hero-content {
    position: relative;
    z-index: 2;
    padding-block: clamp(2rem, 6vw, 5.5rem) 0;
    max-width: 60rem;
  }

  .hero-content p {
    color: var(--look-sky-text);
  }
</style>
