<template>
  <div
    class="content-box no-select click-target"
    @click="spanClicked"
    v-if="selecting || !location"
  >
    <div class="content-box-inner">
      <h2 class="title" v-text="props.title" />
      <template v-if="!props.selected">
        <img
          :class="`${props.themeSafe ? 'theme-safe' : ''}`"
          v-if="props.src"
          :src="props.src"
          width="80"
          height="80"
        />
      </template>
      <img
        v-else
        class="theme-safe"
        src="@/assets/images/checkmark.svg"
        width="80"
        height="80"
      />
      <div class="content-box-content" v-if="!props.selecting">
        <slot> imagine leaving this empty </slot>
      </div>
      <div class="content-box-content" v-else>
        Click me to select or deselect this item.
      </div>
    </div>
  </div>
  <a
    v-else
    class="content-box no-select click-target"
    @click.prevent="linkClicked"
    :href="location.href"
  >
    <div class="content-box-inner">
      <h2 class="title" v-text="props.title" />
      <template v-if="!props.selected">
        <img
          :class="`${props.themeSafe ? 'theme-safe' : ''}`"
          v-if="props.src"
          :src="props.src"
          width="80"
          height="80"
        />
      </template>
      <img
        v-else
        class="theme-safe"
        src="@/assets/images/checkmark.svg"
        width="80"
        height="80"
      />
      <div class="content-box-content" v-if="!props.selecting">
        <slot> imagine leaving this empty </slot>
      </div>
      <div class="content-box-content" v-else>
        Click me to select or deselect this item.
      </div>
    </div>
  </a>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import "./ContentBox.vue";

const emit = defineEmits<{
  (event: "click"): void;
}>();

const props = defineProps({
    title: {
      type: String,
      default: "Imagine leaving the title empty",
    },
    src: {
      type: String,
      default: undefined,
    },
    selecting: Boolean,
    selected: Boolean,
    themeSafe: Boolean,
    to: {
      type: null,
      default: undefined,
    },
  }),
  router = useRouter();

const location = computed(() => {
  return props.to ? router.resolve(props.to) : null;
});

async function spanClicked() {
  if (!props.selecting || !!location.value) return;
  emit("click");
}

async function linkClicked() {
  if (props.selecting || !location.value) return;
  await router.push(location.value);
}
</script>
