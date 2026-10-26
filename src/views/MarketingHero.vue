<template>
  <section class="content hero-content">
    <h1>Upload a file. Get a link like this one.</h1>

    <p class="url">
      <span class="url-part">https://</span>
      <span class="domain">
        <span class="reel-container">
          <span class="reel" aria-hidden="true">
            <span v-for="site in sites">{{ site }}</span>
            <span>{{ sites[0] }}</span>
          </span>
        </span>

        <span class="screen-reader-only">{{ sites[0] }}</span>
      </span>
      <span class="url-part">/{{ featured }}</span>
    </p>

    <div class="drop-hint js-required">
      <img
        aria-hidden="true"
        src="@/assets/images/upload.svg"
        style="filter: brightness(0) invert(1)"
      />
      <div class="dh-text">
        <p class="dh-title">Drop some media to upload</p>
        <p class="dh-sub">
          Or paste a screenshot. You'll get a link, like the ones above, as soon
          as it's up.
        </p>
      </div>
      <button class="button" type="button" data-pick>Choose a file</button>
    </div>

    <RouterLink class="button" to="/auth">Open the dashboard</RouterLink>
    <p>
      Anyone can sign up, host any file, then share it from whichever of our
      domains you like.
    </p>
  </section>
</template>

<script setup lang="ts">
  import { debugRef } from '@/debug';
  import { watch } from 'vue';

  const siteOverride = debugRef<null | string>(null, {
    type: 'text',
    description: 'Override URL',
    default: 'ÁÂgjpqy_,;',
  });

  watch(siteOverride, (override) => {
    const reel = document.querySelector('.reel');
    if (!reel) return;

    const attributes = reel.children[0].attributes;
    reel.replaceChildren(
      ...Array.from({ length: 7 }, () => {
        const span = document.createElement('span');
        for (const attribute of Array.from(attributes))
          span.setAttribute(attribute.name, attribute.value);
        span.textContent = override;
        return span;
      }),
    );
  });

  // const featured = "iu94IKgA1w.mp4"; // 404
  const featured = '-r7kKbtZbD.mp4'; // funny

  const sites = [
    'cumulonimbus.link',
    'obama.solutions',
    'linus-tech.tips',
    'you.are-so.gay',
    'shit.computer',
    'toilets.pics',
  ];
</script>

<style scoped>
  .hero-content {
    position: relative;
    z-index: 2;
    padding-block: clamp(2rem, 6vw, 5.5rem) 0;
  }

  h1 {
    font-size: clamp(1.6rem, 3vw, 1.9rem);
    font-weight: 700;
    line-height: 1.15;
    padding-block-end: 0.1875em;
    max-width: 22ch;
  }

  .url {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: clamp(1.9rem, 7.2vw, 6.5rem);
    line-height: 1.05;
    font-weight: 700;
    letter-spacing: -0.03em;
    margin: clamp(20px, 3vw, 36px) 0 28px;
  }

  .url > span {
    display: block;
    /*overflow: hidden;*/
    height: 1lh;
  }

  .url-part {
    color: var(--look-sky-text-light);
  }

  .domain {
    position: relative;
    /*overflow: hidden;*/
  }

  .reel-container {
    position: absolute;
    top: -0.1em;
    left: 0;
    bottom: -0.2em;
    /*inset-inline: 0;*/
    /*inset-block: -0.1em 0.2em;*/
    padding-block: 0.1em 0.2em;
    mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      black 4%,
      black 96%,
      transparent 100%
    );
  }

  .reel {
    display: block;
    animation: roll 15s cubic-bezier(0.7, 0, 0.3, 1) infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .reel {
      animation: roll 15s step-start infinite;
    }
  }

  .reel span {
    display: block;
    height: 1.3em;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 19ch;
  }

  .drop-hint {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px 18px;
    max-width: 660px;
    margin-bottom: 24px;
    padding: 14px 14px 14px 18px;
    border: 2px dashed var(--hint-line);
    border-radius: 18px;
    background: var(--hint-bg);
  }

  .dh-text {
    flex: 1;
    min-width: 200px;
  }

  .dh-title {
    font-weight: 700;
    font-size: 1.2rem;
  }

  .dh-sub {
    font-size: 0.98rem;
    color: var(--look-sky-text-light);
  }

  @keyframes roll {
    0%,     /* 0 / 15 */
  13.333% /* 2 / 15 */ {
      transform: translateY(0);
    }
    16.667%, /* 2.5 / 15 */
  30%      /* 4.5 / 15 */ {
      transform: translateY(-1.3em);
    }
    33.333%, /* 5 / 15 */
  46.667%  /* 7 / 15 */ {
      transform: translateY(-2.6em);
    }
    50%,    /* 7.5 / 15 */
  63.333% /* 9.5 / 15 */ {
      transform: translateY(-3.9em);
    }
    66.667%, /* 10 / 15 */
  80%      /* 12 / 15 */ {
      transform: translateY(-5.2em);
    }
    83.333%, /* 12.5 / 15 */
  96.667%  /* 14.5 / 15 */ {
      transform: translateY(-6.5em);
    }
    100% /* 15 / 15 */ {
      transform: translateY(-7.8em);
    }
  }
</style>
