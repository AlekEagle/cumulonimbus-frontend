<template>
  <p
    v-text="
      `Page ${pageCount.toLocaleString()} of ${displayMax.toLocaleString()} (${itemCount.toLocaleString()} item${
        itemCount === 1 ? '' : 's'
      })`
    "
  />
  <div class="paginator-controls paginator-controls-top">
    <button
      @click="prevPage"
      :disabled="0 >= props.modelValue || props.disabled"
    >
      Prev
    </button>
    <input
      type="number"
      inputmode="numeric"
      :value="pageCount"
      min="0"
      :max="displayMax"
      :disabled="props.disabled"
      @change="onInputChange"
      @input="validateInput"
    />
    <button
      @click="nextPage"
      :disabled="maxPage <= props.modelValue || props.disabled"
    >
      Next
    </button>
  </div>
  <slot>
    <h1>Some idiot forgot to put something in the slot</h1>

    <h2>This is a paginator component.</h2>

    <p
      >We're on page {{ pageCount.toLocaleString() }} of
      {{ displayMax.toLocaleString() }}</p
    >
  </slot>

  <div class="paginator-controls paginator-controls-bottom">
    <button
      @click="prevPage"
      :disabled="0 >= props.modelValue || props.disabled"
    >
      Prev
    </button>
    <input
      type="number"
      inputmode="numeric"
      :value="pageCount"
      min="0"
      :max="displayMax"
      step="1"
      :disabled="props.disabled"
      @change="onInputChange"
      @input="validateInput"
    />
    <button
      @click="nextPage"
      :disabled="maxPage <= props.modelValue || props.disabled"
    >
      Next
    </button>
  </div>
  <p
    v-text="
      `Page ${pageCount.toLocaleString()} of ${displayMax.toLocaleString()} (${itemCount.toLocaleString()} item${
        itemCount === 1 ? '' : 's'
      })`
    "
  />
</template>

<script lang="ts" setup>
  import { onMounted, watch, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { displayPrefStore } from '@/stores/displayPref';

  const emit = defineEmits(['update:modelValue', 'pageChange']);
  const props = defineProps({
    modelValue: {
      type: Number,
      required: true,
    },
    itemCount: {
      type: Number,
      default: 0,
    },
    disabled: Boolean,
  });

  const router = useRouter(),
    displayPref = displayPrefStore(),
    pageCount = computed(() => props.modelValue + 1),
    maxPage = computed(() => {
      let a = Math.ceil(props.itemCount / displayPref.itemsPerPage) - 1;
      if (isNaN(a)) return 0;
      else return a;
    }),
    displayMax = computed(() => (maxPage.value < 0 ? 1 : maxPage.value + 1));

  function prevPage() {
    emit('update:modelValue', props.modelValue - 1);
    emit('pageChange');
  }

  function nextPage() {
    emit('update:modelValue', props.modelValue + 1);
    emit('pageChange');
  }

  function onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value === '') {
      input.value = props.modelValue + 1 + '';
      return;
    }
    if (Number(input.value) <= 0) {
      emit('update:modelValue', 0);
    } else if (Number(input.value) >= maxPage.value + 1) {
      emit('update:modelValue', maxPage.value);
    } else {
      emit('update:modelValue', Number(input.value) - 1);
    }
    input.blur();
    emit('pageChange');
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
      emit(
        'update:modelValue',
        Number(router.currentRoute.value.query.page) - 1,
      );
    }
  });

  function validateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value === '') return;
    if (Number(input.value) < 1) {
      input.value = '1';
    } else if (Number(input.value) > displayMax.value + 1) {
      input.value = displayMax.value + '';
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
