<template>
  <div class="dark-mode-widget">
    <input type="checkbox" id="theme-toggle" @click="toggleDarkTheme" />
    <label for="theme-toggle"><span></span></label>
  </div>
</template>

<script>
  const html = document.getElementsByTagName('html')[0];
  export default {
    data() {
      return {
        themeTransitionTimeout: -1
      };
    },
    mounted() {
      setTimeout(() => html.classList.remove('no-theme'), 500);
      this.initThemePreference();
    },
    methods: {
      toggleDarkTheme() {
        if (html.classList.contains('dark-theme')) {
          this.enableTransition();
          document.head.querySelector('meta[name="theme-color"]').content =
            '#FFFFFF';
          html.classList.remove('dark-theme');
        } else {
          this.enableTransition();
          document.head.querySelector('meta[name="theme-color"]').content =
            '#212121';
          html.classList.add('dark-theme');
        }
        this.toggleUserPreference();
      },
      enableTransition() {
        if (this.$data.themeTransitionTimeout !== -1) {
          clearTimeout(this.themeTransitionTimeout);
          this.themeTransitionTimeout = setTimeout(() => {
            html.classList.remove('dark-theme-transition');
            this.themeTransitionTimeout = -1;
          }, 250);
        } else {
          html.classList.add('dark-theme-transition');
          this.themeTransitionTimeout = setTimeout(() => {
            html.classList.remove('dark-theme-transition');
            this.themeTransitionTimeout = -1;
          }, 250);
        }
      },
      checkUserPreference() {
        if (!localStorage.getItem('dark-theme'))
          localStorage.setItem('dark-theme', 'false');
        return JSON.parse(localStorage.getItem('dark-theme'));
      },
      initThemePreference() {
        if (!this.checkUserPreference()) return;
        document.head.querySelector('meta[name="theme-color"]').content =
          '#212121';
        html.classList.add('dark-theme');
        document.getElementById('theme-toggle').checked = true;
      },
      toggleUserPreference() {
        localStorage.setItem(
          'dark-theme',
          JSON.stringify(!JSON.parse(localStorage.getItem('dark-theme')))
        );
      }
    }
  };
</script>

<style>
  .dark-mode-widget {
    display: table;
    margin-right: 0.75em;
  }
  #theme-toggle {
    display: none;
  }
  #theme-toggle + label {
    font-size: 1rem;
    display: flex;
    width: 4em;
    border-radius: 2em;
    background-size: auto 8em;
    background-position: bottom;
    background-image: linear-gradient(
      180deg,
      #021037 0%,
      #20206a 19%,
      #4184b1 66%,
      #62e7f7 100%
    );
    transition: 0.2s;
    border: 0.125em solid #eef3f6;
    overflow: hidden;
  }
  #theme-toggle + label span {
    background: #fffad8;
    border-radius: 50%;
    height: 2em;
    width: 2em;
    transform: translateX(-0.125em) scale(0.65);
    transition: 0.2s;
    cursor: pointer;
    box-shadow: 0 0 0.25em 0.0625em #fbee8d, 0 0 2em 0 #ffeb3b,
      inset -0.25em -0.25em 0 0 #fbee8e,
      inset -0.3125em -0.3125em 0 0.625em #fff5b2;
    margin-top: -0.125em;
  }
  #theme-toggle:checked {
    font-size: 10rem;
  }
  #theme-toggle:checked + label {
    background-position: top;
    border-color: #5983a6;
  }
  #theme-toggle:checked + label span {
    background: transparent;
    transform: translateX(calc(100%)) scale(0.65);
    box-shadow: inset -0.1875em -0.1875em 0 0 #fbe7ef,
      inset -0.5625em -0.5625em 0 0 #fffff7;
  }
</style>
