import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { usePreferredDark } from '@vueuse/core';

export const darkThemeStore = defineStore('darkTheme', () => {
  const themeTransitionTimeout = ref(-1),
    html = document.documentElement,
    preferredDark = usePreferredDark(),
    enabled = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (localStorage.getItem('dark')) {
    enabled.value = JSON.parse(localStorage.getItem('dark') as string);
  }

  watch(enabled, (newVal: boolean) => {
    localStorage.setItem('dark', JSON.stringify(newVal));
    setTheme(newVal);
  });

  function enableTransition() {
    if (themeTransitionTimeout.value !== -1) {
      clearTimeout(themeTransitionTimeout.value);
    } else {
      html.classList.add('dark-theme-transition');
    }
    themeTransitionTimeout.value = setTimeout(() => {
      html.classList.remove('dark-theme-transition');
      themeTransitionTimeout.value = -1;
    }, 0);
  }

  function setTheme(newThemeVal: boolean = !enabled.value) {
    const metaThemeColor = document.querySelector(
      'meta[name=theme-color]',
    ) as HTMLMetaElement;
    enableTransition();
    if (newThemeVal) {
      html.classList.add('dark-theme');
      metaThemeColor.setAttribute('content', '#212121');
    } else {
      html.classList.remove('dark-theme');
      metaThemeColor.setAttribute('content', '#ffffff');
    }
  }

  setTheme(enabled.value);
  setTimeout(() => {
    html.classList.remove('no-theme');
    watch(preferredDark, (newVal: boolean) => {
      enabled.value = newVal;
    });
  }, 500);

  setTheme(enabled.value);

  return {
    enabled,
  };
});
