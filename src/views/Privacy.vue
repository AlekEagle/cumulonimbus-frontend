<template>
  <div class="terms">
    <section class="content terms-content">
      <ol>
        <li><a href="#agreement">Agreement to These Terms</a></li>
        <li><a href="#changes">Changes to the Privacy Policy</a></li>
        <li><a href="#data-collection">What We Collect and Why</a></li>
        <li><a href="#data-storing">How We Store Your Data</a></li>
        <li><a href="#data-deletion">Deleting Your Data</a></li>
        <li
          ><a href="#gdpr"
            >General Data Protection Regulation (GDPR) Requests</a
          ></li
        >
        <li><a href="#contact">Contact</a></li>
      </ol>
      <p>
        <strong>
          This document describes the policies and procedures on collection,
          use, and disclosure of Your information when using Cumulonimbus (which
          from here on out may be referred to as <code>We</code>,
          <code>Us</code>, <code>Our</code>, and/or <code>the Service</code>),
          and informs You of Your privacy rights and how You are protected by
          the law.
        </strong>
      </p>
      <p>
        We respect You and Your privacy, and collect the minimal amount of data
        needed to provide the Service. We do not sell Your data to third
        parties. We do not use Your data for advertising purposes. We do not use
        Your data for any purpose other than providing the Service.
      </p>
      <h2 id="agreement">Agreement to These Terms</h2>
      <p>
        The personal information collected is used to provide security and
        insure usability for the Service. By using the Service, You agree to the
        collection and use of information in accordance with this Privacy
        Policy. If You do not agree to these terms, usage of the Service must be
        discontinued immediately.
      </p>
      <h2 id="changes">Changes to the Privacy Policy</h2>
      <p>
        We reserve the right to change this Privacy Policy at any time. If
        changes are made to this Privacy Policy, You will be notified via email
        and/or on the Service itself. The date at the top of this document will
        be updated to reflect the date of the last change. While We will notify
        You of changes, We strongly recommend that You check this document
        regularly to ensure that You are aware of the current Privacy Policy. If
        You do not agree to the changes, You must discontinue usage of the
        Service immediately.
      </p>
      <h2 id="data-collection">What We Collect and Why</h2>
      <p>
        When creating an account, You are required to provide a username, email,
        and password. We use Your email address to contact You about important
        information regarding Your account, such as password resets, account
        deactivation ("banning"), account termination, updates to the Privacy
        Policy, and updates to the Terms of Service.
      </p>
      <p>
        When uploading content, We store the content You upload, the date and
        time of the upload, the size of the uploaded content, and the original
        filename of the uploaded content.
      </p>
      <p>
        When logging into Your account, We store the date and time of the login,
        what device You logged in from, and when it expires.
      </p>
      <p>
        When making a request to the Service, Your IP address will be logged by
        Cloudflare and Our origin servers for abuse and DoS/DDoS protection. Our
        servers logs are deleted after 30 days. For more information about
        Cloudflare's policies, please visit
        <a href="https://www.cloudflare.com/privacypolicy/"
          >https://www.cloudflare.com/privacypolicy/</a
        >. Our servers will log the following information whenever You make a
        request that reaches Our servers:
      </p>
      <ul>
        <li>Your IP address</li>
        <li>
          The type of request being made (e.g. <code>GET</code>,
          <code>POST</code>, <code>DELETE</code>, etc.)
        </li>
        <li>The request URI (e.g. <code>/hello/world.png</code>)</li>
        <li>
          The HTTP version used to make the request (e.g.
          <code>HTTP/1.1</code>)
        </li>
        <li>
          The response status code (e.g. <code>200 OK</code>,
          <code>404 Not Found</code>, etc.)
        </li>
        <li> The length of the response sent back to you in bytes </li>
        <li> The referring website, if any </li>
        <li> The User Agent used in the request. </li>
      </ul>
      <p>
        Our servers will NOT log this information in the event Cloudflare serves
        a request from it's cache.
      </p>
      <h2 id="data-storing">How We Store Your Data</h2>
      <p>
        Everything stored by the Service is stored on servers located in the
        United States of America. Passwords are hashed and salted. Uploaded
        content in its original form is not cached by Cloudflare, but may be
        cached by Your browser. All previews are generated by Our servers and
        are cached by Cloudflare for up to 30 days. Previews are deleted from
        Our servers when the original content is deleted.
      </p>
      <h2 id="data-deletion">Deleting Your Data</h2>
      <p>
        You can request a deletion of Your account and/or uploaded content via
        the profile panel. This action is performed immediately and is
        irreversible, and all Your information is deleted, except server logs,
        which are deleted after 30 days.
      </p>
      <p>
        Data stored inside of the database is immediately deleted, not marked as
        "deleted". If You have an issue with performing a deletion of any sort,
        please contact Us.
      </p>
      <h2 id="gdpr">General Data Protection Regulation (GDPR) Requests</h2>
      <p>
        Outside of logs, all data We store related to Your account can be
        accessed via Your dashboard. If you would like a copy of your data, You
        can contact Us at
        <a href="mailto:data-request@alekeagle.me">data-request@alekeagle.me</a>
        using the email associated to Your account, after which You will receive
        a copy of Your account information within 30 business days.
      </p>
      <p>
        Due to the lack of account related information contained in Our servers
        logs related to requests made to the server, We are unable to
        confidently provide a complete copy of logs related to your account
        without either missing logs, or unintentionally including logs not
        associated with Your account.
      </p>
      <p>
        Anyone may make a data request, regardless of you living in a
        jurisdiction with GDPR or CCPA regulations.
      </p>
      <h2 id="contact">Contact</h2>
      <p>
        If You have any questions or concerns, please contact Us at
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
