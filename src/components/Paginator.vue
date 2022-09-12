<template>
  <div class="paginator-controls paginator-controls-top">
    <button
      @click="prevPage"
      :disabled="props.min >= props.modelValue || props.disabled"
    >
      Prev
    </button>
    <input
      type="number"
      :value="props.modelValue + 1"
      :min="props.min + 1"
      :max="props.max + 1"
      :disabled="props.disabled"
      @change="onInputChange"
      @input="validateInput"
    />
    <button
      @click="nextPage"
      :disabled="props.max <= props.modelValue || props.disabled"
    >
      Next
    </button>
  </div>
  <slot>
    <h1>Some idiot forgot to put something in the slot</h1>

    <h2>This is a paginator component.</h2>

    <p>We're on page {{ props.modelValue + 1 }} of {{ props.max + 1 }}</p>
  </slot>

  <div class="paginator-controls paginator-controls-bottom">
    <button
      @click="prevPage"
      :disabled="props.min >= props.modelValue || props.disabled"
    >
      Prev
    </button>
    <input
      type="number"
      :value="props.modelValue + 1"
      :min="props.min + 1"
      :max="props.max + 1"
      step="1"
      :disabled="props.disabled"
      @change="onInputChange"
      @input="validateInput"
    />
    <button
      @click="nextPage"
      :disabled="props.max <= props.modelValue || props.disabled"
    >
      Next
    </button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const emit = defineEmits(["update:modelValue", "pageChange"]),
  props = defineProps({
    modelValue: {
      type: Number,
      required: true,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 0,
    },
    disabled: Boolean,
  }),
  router = useRouter();

function prevPage() {
  emit("update:modelValue", props.modelValue - 1);
  emit("pageChange");
}

function nextPage() {
  emit("update:modelValue", props.modelValue + 1);
  emit("pageChange");
}

function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.value === "") {
    input.value = props.modelValue + 1 + "";
    return;
  }
  if (Number(input.value) <= props.min) {
    emit("update:modelValue", props.min);
  } else if (Number(input.value) >= props.max) {
    emit("update:modelValue", props.max);
  } else {
    emit("update:modelValue", Number(input.value) - 1);
  }
  input.blur();
  emit("pageChange");
}

watch(props, ({ modelValue }) => {
  router.replace({
    query: {
      ...router.currentRoute.value.query,
      page: modelValue === 0 ? undefined : modelValue + 1,
    },
  });
});

onMounted(() => {
  if (router.currentRoute.value.query.page) {
    if (Number(router.currentRoute.value.query.page) === 1) {
      router.replace({
        query: {
          ...router.currentRoute.value.query,
          page: undefined,
        },
      });
      return;
    }
    emit("update:modelValue", Number(router.currentRoute.value.query.page) - 1);
  }
});

function validateInput(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.value === "") return;
  if (Number(input.value) < props.min + 1) {
    input.value = props.min + 1 + "";
  } else if (Number(input.value) > props.max + 1) {
    input.value = props.max + 1 + "";
  }
}
</script>

<style>
.paginator-controls {
  width: fit-content;
  margin: 0 auto;
}

.paginator-controls input {
  width: 6ch;
  margin: 0 0.5ch;
}

.paginator-controls.paginator-controls-top {
  margin-bottom: 5px;
}

.paginator-controls.paginator-controls-bottom {
  margin-top: 5px;
}
</style>
