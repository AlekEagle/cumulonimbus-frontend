<template>
  <p v-text="pageIndicatorText" />
  <div class="paginator-controls paginator-controls-top">
    <button @click="prevPage" :disabled="0 >= page || props.disabled">
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
    <button @click="nextPage" :disabled="maxPage <= page || props.disabled">
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
    <button @click="prevPage" :disabled="0 >= page || props.disabled">
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
    <button @click="nextPage" :disabled="maxPage <= page || props.disabled">
      Next
    </button>
  </div>
  <p v-text="pageIndicatorText" />
</template>

<script lang="ts" setup>
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  import { displayPrefStore } from '@/stores/displayPref';

  // External Modules
  import { onMounted, computed, watchEffect } from 'vue';
  import { useRouter } from 'vue-router';

  const page = defineModel({
    type: Number,
    required: true,
  });

  const emit = defineEmits(['pageChange']);
  const props = defineProps({
    itemCount: {
      type: Number,
      default: 0,
    },
    disabled: Boolean,
  });

  const router = useRouter(),
    displayPref = displayPrefStore(),
    pageCount = computed(() => page.value + 1),
    maxPage = computed(() => {
      let a = Math.ceil(props.itemCount / displayPref.itemsPerPage) - 1;
      if (isNaN(a)) return 0;
      else return a;
    }),
    displayMax = computed(() => (maxPage.value < 0 ? 1 : maxPage.value + 1)),
    pageIndicatorText = computed(
      () =>
        `Page ${pageCount.value.toLocaleString()} of ${displayMax.value.toLocaleString()} (${props.itemCount.toLocaleString()} item${
          props.itemCount === 1 ? '' : 's'
        })`,
    );

  function prevPage() {
    page.value--;
    emit('pageChange');
  }

  function nextPage() {
    page.value++;
    emit('pageChange');
  }

  function onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value === '') {
      input.value = page.value + 1 + '';
      return;
    }
    if (Number(input.value) <= 0) {
      page.value = 0;
    } else if (Number(input.value) >= maxPage.value + 1) {
      page.value = maxPage.value;
    } else {
      page.value = Number(input.value) - 1;
    }
    input.blur();
    emit('pageChange');
  }

  watchEffect(() => {
    updateQuery(page.value);
  });

  onMounted(() => {
    if (router.currentRoute.value.query.page) {
      page.value = Number(router.currentRoute.value.query.page) - 1;
      // Watch doesn't trigger because the value is the same, so we need to manually update the query.
      if (page.value === 0) {
        updateQuery(0);
      }
    }
  });

  async function updateQuery(p: number) {
    router.replace({
      query: {
        ...router.currentRoute.value.query,
        page: p === 0 ? undefined : p + 1,
      },
      // If hash is present, keep it
      hash: router.currentRoute.value.hash,
    });
  }

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
