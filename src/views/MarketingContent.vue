<template>
  <div class="features">
    <main class="content features-content">
      <section aria-labelledby="domain-list-title">
        <h2 id="domain-list-title">Choose the domain on your links</h2>
        features sect
      </section>

      <section aria-labelledby="upload-tools-title">
        <h2 id="upload-tools-title">Upload from the tools you already use</h2>
        We have support for programs like ShareX and other popular upload tools,
        it can even be integrated into programs and platforms that allow you to
        upload files to a remote host!
      </section>
    </main>
  </div>

  <div class="questions">
    <div class="content questions-content">
      <section aria-labelledby="questions-ideas-title">
        <h3 id="questions-ideas-title">Questions or ideas?</h3>
        Talk to the developers and the rest of the community on
        <a
          href="https://alekeagle.com/d"
          target="_blank"
          rel="noopener noreferrer"
          >our Discord Server</a
        >.
      </section>

      <section aria-labelledby="abuse report title">
        <h3 class="abuse-report-title">See something wrong?</h3>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nostrum,
        numquam dolores, placeat omnis explicabo sunt dicta harum velit earum
        obcaecati odit aliquid error cumque. Enim maxime ut atque vero debitis?
      </section>

      <section aria-labelledby="joke-filler-title">
        <h3 class="joke-filler-title">The only file host.*</h3>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis ad
        voluptatem, eos officia commodi voluptatum tenetur veritatis. Blanditiis
        distinctio mollitia ducimus quisquam, exercitationem ea suscipit,
        aperiam pariatur quod reprehenderit dolorum!
      </section>
    </div>
  </div>
</template>

<style scoped>
  .features {
    background: var(--look-page);
    color: var(--look-page-text);

    transition:
      background var(--theme-switch-time),
      color var(--theme-switch-time);
  }

  .features-content {
    padding-block: clamp(2rem, 5vw, 4rem) clamp(3.5rem, 8vw, 6.5rem);

    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    gap: clamp(2.25rem, 6vw, 5.5rem);
  }

  .questions {
    background: var(--look-band);
    color: var(--look-band-text);

    transition:
      background var(--theme-switch-time),
      color var(--theme-switch-time);
  }

  .questions-content {
    padding-block: clamp(2.5rem, 6vw, 4.5rem);

    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(1.5rem, 4vw, 3.5rem);
  }
</style>
