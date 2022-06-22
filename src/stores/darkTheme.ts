import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const darkThemeStore = defineStore("darkTheme", () => {
  const preferredDark = matchMedia("(prefers-color-scheme: dark)").matches;
  const enabled = ref(preferredDark);

  watch(enabled, (newVal: boolean) => {
    localStorage.setItem("dark", JSON.stringify(newVal));
  });

  if (localStorage.getItem("dark")) {
    enabled.value = JSON.parse(localStorage.getItem("dark") as string);
  }

  return {
    enabled,
  };
});
