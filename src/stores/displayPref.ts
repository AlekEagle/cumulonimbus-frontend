// In-House Modules
import persistPiniaRef from '@/utils/persistPiniaRef.js';

// Other Store Modules
// No Other Store Modules to import here.

// External Modules
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { usePreferredDark } from '@vueuse/core';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

// Store Definition
export const displayPrefStore = defineStore('displayPref', () => {
  // --- Persistent Refs ---
  // -- Dark Theme --
  const theme = ref<Theme>(Theme.SYSTEM);
  // If 'theme' is not in localStorage, set it to the preferred dark theme, otherwise use the stored value
  persistPiniaRef(theme, 'theme', { immediate: true });
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

  let reactivePreferenceWatcher: ReturnType<typeof watch> | null = null;

  // --- Functions ---

  function setTheme(newThemeVal: Theme) {
    const metaThemeColor = document.querySelector(
      'meta[name=theme-color]',
    ) as HTMLMetaElement;
    if (reactivePreferenceWatcher) {
      reactivePreferenceWatcher();
      reactivePreferenceWatcher = null;
    }
    switch (newThemeVal) {
      case Theme.LIGHT:
        html.classList.remove('dark-theme');
        metaThemeColor.setAttribute('content', '#ffffff');
        break;
      case Theme.DARK:
        html.classList.add('dark-theme');
        metaThemeColor.setAttribute('content', '#212121');
        break;
      case Theme.SYSTEM:
        if (!reactivePreferenceWatcher) {
          reactivePreferenceWatcher = watch(
            preferredDark,
            (newVal: boolean) => {
              if (newVal) {
                html.classList.add('dark-theme');
                metaThemeColor.setAttribute('content', '#212121');
              } else {
                html.classList.remove('dark-theme');
                metaThemeColor.setAttribute('content', '#ffffff');
              }
            },
            { immediate: true },
          );
        }
        break;
      default:
        console.warn(`Unknown theme value: ${newThemeVal}`);
    }
  }

  // Watch for changes to the dark theme preference
  watch(theme, (newVal: Theme) => {
    setTheme(newVal);
  });

  // Wait 500ms before removing the 'no-theme' class to allow the theme to be set
  setTimeout(() => {
    html.classList.remove('no-theme');
  }, 500);

  // Set the theme
  setTheme(theme.value);

  return {
    theme,
    hour12,
    itemsPerPage,
    preferredDark,
  };
});
