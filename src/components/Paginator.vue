<template>
  <div class="paginator-controls">
    <button @click="prevPage" :disabled="props.min >= props.modelValue">
      Prev
    </button>
    <input
      :value="props.modelValue + 1"
      :min="props.min"
      :max="props.max"
      @change="onInputChange"
    />
    <button @click="nextPage" :disabled="props.max <= props.modelValue">
      Next
    </button>
  </div>
  <slot>
    <h1> Some idiot forgot to put something in the slot </h1>

    <h2> This is a paginator component. </h2>

    <p> We're on page {{ props.modelValue + 1 }} of {{ props.max + 1 }} </p>
  </slot>

  <div class="paginator-controls">
    <button @click="prevPage" :disabled="props.min >= props.modelValue">
      Prev
    </button>
    <input
      :value="props.modelValue + 1"
      :min="props.min"
      :max="props.max"
      @change="onInputChange"
    />
    <button @click="nextPage" :disabled="props.max <= props.modelValue">
      Next
    </button>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';

  const emit = defineEmits(['update:modelValue', 'pageChange']),
    props = defineProps({
      modelValue: {
        type: Number,
        required: true
      },
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 0
      }
    }),
    router = useRouter();

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
    if (Number(input.value) <= props.min) {
      emit('update:modelValue', props.min);
    } else if (Number(input.value) >= props.max) {
      emit('update:modelValue', props.max);
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
        page: modelValue === 0 ? undefined : modelValue + 1
      }
    });
  });

  onMounted(() => {
    if (router.currentRoute.value.query.page) {
      emit(
        'update:modelValue',
        Number(router.currentRoute.value.query.page) - 1
      );
    }
  });
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
</style>
