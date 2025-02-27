// In-House Modules
import persistPiniaRef from '@/utils/persistPiniaRef';

// Other Store Modules
// No Other Store Modules to import here.

// External Modules
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { usePreferredDark } from '@vueuse/core';

// Store Definition
export const displayPrefStore = defineStore('displayPref', () => {
  // --- Persistent Refs ---
  // -- Dark Theme --
  const dark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);
  // If 'dark' is not in localStorage, set it to the preferred dark theme, otherwise use the stored value
  persistPiniaRef(dark, 'dark', { immediate: true });
  // -- Time Format --
  const hour12 = ref(true);
  persistPiniaRef(hour12, 'hour12', { immediate: true });
  // -- Items Per Page --
  const itemsPerPage = ref(50);
  persistPiniaRef(itemsPerPage, 'itemsPerPage', { immediate: true });
  // More persistent refs can be added here
  // --- End Persistent Refs ---
  // --- Internal Values ---
  const preferredDark = usePreferredDark(),
    html = document.documentElement;

  // --- Functions ---

  function setDarkTheme(newThemeVal: boolean = !dark.value) {
    const metaThemeColor = document.querySelector(
      'meta[name=theme-color]',
    ) as HTMLMetaElement;
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
    setDarkTheme(newVal);
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
  setDarkTheme(dark.value);

  return {
    dark,
    hour12,
    itemsPerPage,
  };
});
