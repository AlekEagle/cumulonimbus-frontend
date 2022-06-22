<template>
  <div class="theme-switch">
    <input
      type="checkbox"
      id="theme-switch"
      ref="themeSwitch"
      @change="setThemeFromCheckbox"
      :checked="theme.enabled"
    />
    <label for="theme-switch">
      <span />
    </label>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { darkThemeStore } from "@/stores/darkTheme";
let theme = darkThemeStore();
const themeSwitch = ref<HTMLInputElement>(),
  themeTransitionTimeout = ref(-1),
  html = document.documentElement;

onMounted(() => {
  setTheme(theme.enabled);
  setTimeout(() => html.classList.remove("no-theme"), 500);
});

function enableTransition() {
  if (themeTransitionTimeout.value !== -1) {
    clearTimeout(themeTransitionTimeout.value);
  } else {
    html.classList.add("dark-theme-transition");
  }
  themeTransitionTimeout.value = setTimeout(() => {
    html.classList.remove("dark-theme-transition");
    themeTransitionTimeout.value = -1;
  }, 0);
}

function setTheme(newThemeVal: boolean = !theme.enabled) {
  if (newThemeVal === html.classList.contains("dark-theme")) return;

  const metaThemeColor = document.querySelector(
    "meta[name=theme-color]"
  ) as HTMLMetaElement;
  enableTransition();
  if (newThemeVal) {
    html.classList.add("dark-theme");
    metaThemeColor.setAttribute("content", "#212121");
    theme.enabled = true;
  } else {
    html.classList.remove("dark-theme");
    metaThemeColor.setAttribute("content", "#ffffff");
    theme.enabled = false;
  }
}

function setThemeFromCheckbox(checkbox: Event) {
  setTheme((checkbox.target as HTMLInputElement).checked);
}
</script>

<style scoped>
.theme-switch {
  display: table;
  margin-right: 0.75em;
}

#theme-switch {
  display: none;
}

#theme-switch + label {
  font-size: 1rem;
  display: flex;
  width: 4em;
  height: 30px;
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

#theme-switch + label:after {
  content: "";
  display: none;
}

#theme-switch + label span {
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

#theme-switch:checked {
  font-size: 10rem;
}

#theme-switch:checked + label {
  background-position: top;
  border-color: #5983a6;
}

#theme-switch:checked + label span {
  background: transparent;
  transform: translateX(calc(100%)) scale(0.65);
  box-shadow: inset -0.1875em -0.1875em 0 0 #fbe7ef,
    inset -0.5625em -0.5625em 0 0 #fffff7;
}
</style>
