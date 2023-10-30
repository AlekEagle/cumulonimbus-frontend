import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { usePreferredDark } from '@vueuse/core';
import persistPiniaRef from '@/utils/persistPiniaRef';

// A store for display related preferences
export const displayPrefStore = defineStore('displayPref', () => {
  // --- Persistent Refs ---
  // -- Dark Theme --
  const dark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);
  // If 'dark' is not in localStorage, set it to the preferred dark theme, otherwise use the stored value
  persistPiniaRef(dark, 'dark', { immediate: true });
  // -- Time Format --
  const hour12 = ref(true);
  persistPiniaRef(hour12, 'hour12', { immediate: true });
  // More persistent refs can be added here
  // --- End Persistent Refs ---
  // --- Internal Values ---
  const preferredDark = usePreferredDark(),
    themeTransitionTimeout = ref(-1),
    html = document.documentElement;

  // --- Functions ---

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

  function setTheme(newThemeVal: boolean = !dark.value) {
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

  // Watch for changes to the dark theme preference
  watch(dark, (newVal: boolean) => {
    setTheme(newVal);
  });
  
  // Wait 500ms before removing the 'no-theme' class to allow the theme to be set
  setTimeout(() => {
    html.classList.remove('no-theme');
    // Watch for changes to the preferred dark theme
    watch(preferredDark, (newVal: boolean) => {
      dark.value = newVal;
    });
  }, 500);

  // Set the theme
  setTheme(dark.value);

  return {
    dark,
    hour12,
  };
});
