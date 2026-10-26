<template>
  <div class="terms">
    <section class="content terms-content">
      <ol>
        <li><a href="#changes">Changes to the Terms of Service</a></li>
        <li><a href="#forks">Clones & Forks</a></li>
        <li><a href="#acceptable-use">Acceptable Use</a></li>
        <li><a href="#violations">Actions Taken Against Violations</a></li>
        <li
          ><a href="#dmca"
            >Digital Millennium Copyright Act (DMCA) Claims</a
          ></li
        >
        <li><a href="#contact">Contact Us</a></li>
      </ol>
      <p>
        This document describes the usage of Cumulonimbus (which from here on
        out may be referred to as <code>We</code>, <code>Us</code>, and/or
        <code>the Service</code>) allowed. By using the Service You are agreeing
        to these terms.
        <strong>
          THIS SERVICE IS PROVIDED AS-IS WITH ABSOLUTELY NO WARRANTY IN ANY WAY,
          SHAPE, OR FORM. WE ARE NOT RESPONSIBLE FOR ANY LOSS OF DATA. FAILURE
          TO ABIDE BY THESE TERMS MAY RESULT IN YOUR ACCOUNT BEING DISABLED
          ("BANNED") OR TERMINATED. ANY ACTION TAKEN AGAINST YOUR ACCOUNT WILL
          BE ACCOMPANIED WITH A REASON, WHETHER IT BE BY EMAIL OR ON THE SERVICE
          ITSELF.
        </strong>
      </p>
      <p>
        If You do not agree to these terms, usage of the Service must be
        discontinued immediately.
      </p>
      <h2 id="changes">Changes to the Terms of Service</h2>
      <p>
        We reserve the right to change these terms at any time. If changes are
        made to these terms, You will be notified via email and/or on the
        Service itself. The date at the top of this document will be updated to
        reflect the date of the last change. While We will notify You of
        changes, We strongly recommend that You check this document regularly to
        ensure that You are aware of the current terms. If You do not agree to
        the changes, You must discontinue usage of the Service immediately.
      </p>
      <h2 id="forks">Clones & Forks</h2>
      <p>
        The source code of the Service is available on GitHub. You are free to
        download, modify, and redistribute the source code as You please under
        the terms of the GNU General Public License v3.0. However, You may not
        use the Cumulonimbus name, logo, or any other branding assets in your
        clone or fork of the Service with the intent to mislead users into
        thinking that Your clone or fork is the official Service. Doing so will
        result in defensive and legal action.
      </p>
      <h2 id="acceptable-use">Acceptable Use</h2>
      <p>
        Any and all content uploaded by You is, and will always be, Your
        property. We will never claim ownership of any content uploaded by You.
        The Service is not liable or responsible for any user-generated content.
        The upload of illegal, harmful, and/or immoral content as defined within
        Your jurisdiction, the state laws of Alaska and Missouri, and U.S.
        Federal Law is strictly prohibited.
      </p>
      <h2 id="violations">Actions Taken Against Violations</h2>
      <p>
        Violating these terms may result in uploaded content being removed, Your
        account being disabled ("banned"), and/or Your account being terminated.
        Any action taken against Your account will be accompanied with a reason,
        whether it be by email or on the Service itself. Disabled accounts will
        be deleted one month after being disabled. Terminated accounts will be
        deleted immediately. If Your account is disabled, You may appeal the
        decision by emailing Us at
        <a href="mailto:appeals@alekeagle.me">appeals@alekeagle.me</a>. If Your
        account is terminated, You may not appeal the decision.
      </p>
      <h2 id="dmca">Digital Millennium Copyright Act (DMCA) Claims</h2>
      <p>
        If You believe that Your work has been copied in a way that constitutes
        a DMCA violation, please contact Us at
        <a href="mailto:dmca@alekeagle.me">dmca@alekeagle.me</a> with the URL of
        the content in question and proof that You are the owner of the content.
        Abuse of DMCA claims are not tolerated and will be ignored.
      </p>
      <h2 id="contact">Contact Us</h2>
      <p>
        If You have any questions or concerns regarding these terms, please
        contact Us at
        <a href="mailto:contact@alekeagle.me">contact@alekeagle.me</a>.
      </p></section
    >
  </div>
</template>

<style scoped>
  p {
    text-align: justify;
    line-height: 1.75;
    padding: 0 0 1rem 0;
  }

  ol {
    text-align: justify;
    line-height: 2.1;
    padding: 0 0 2rem 2rem;
  }

  ul {
    text-align: justify;
    line-height: 2.1;
    padding: 0 0 1rem 2rem;
  }

  h2 {
    padding: 1rem 0;
  }

  .terms {
    background: var(--look-page);
    color: var(--look-page-text);

    transition:
      background var(--theme-switch-time),
      color var(--theme-switch-time);
  }

  .terms-content {
    max-width: 60rem;
    padding-block: clamp(2rem, 5vw, 4rem) clamp(3.5rem, 8vw, 6.5rem);
  }
</style>
