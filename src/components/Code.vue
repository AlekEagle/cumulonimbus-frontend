<template>
  <div :class="['code-container', { inline: props.inline }]">
    <div
      v-if="showCopyButton"
      title="Copy to Clipboard"
      class="copy-button-container"
      @click="copyToClipboard"
    >
      <div class="copy-button" />
    </div>
    <pre><code><div v-for="(line, index) in textLines" :key="index"><span v-if="showLineNumbers" class="line-number">{{ index + 1 }}</span>{{ line }}</div></code></pre>
  </div>
</template>

<script lang="ts" setup>
  // Vue Components
  // No Vue Components to import here.

  // In-House Modules
  import useTextFromSlot from '#/textFromSlot.js';

  // Store Modules
  import { toastStore } from '$/toast.js';

  // External Modules
  import { computed } from 'vue';

  const toast = toastStore(),
    textFromSlot = useTextFromSlot();

  const props = defineProps<{
    copy?: boolean;
    inline?: boolean;
    lineNumbers?: boolean;
    rawText?: string;
  }>();

  const showCopyButton = computed(() => !props.inline && props.copy),
    showLineNumbers = computed(() => !props.inline && props.lineNumbers),
    textLines = computed(() => {
      const text = props.rawText ?? textFromSlot.default.value ?? '';
      return text.split('\n');
    });

  function copyToClipboard() {
    navigator.clipboard.writeText(textLines.value.join('\n'));
    toast.show('Copied to clipboard!');
  }
</script>

<style scoped>
  code {
    font-family: var(--font-mono);
  }

  .code-container {
    display: block;
    padding: 1rem;
    background-color: var(--look-page-card);
    color: var(--look-page-text);
    border-radius: 6px;
    position: relative;
  }

  .inline {
    display: inline;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .inline pre {
    display: inline-block;
  }

  .line-number {
    display: inline-block;
    width: 2em;
    text-align: right;
    margin-right: 0.4em;
    padding-right: 0.5em;
    color: var(--look-page-text-secondary);
    border-right: 1px solid var(--look-page-text);
    user-select: none;
  }

  .copy-button-container {
    line-height: 0;
    display: inline-block;
    position: absolute;
    top: 8px;
    right: 8px;
    cursor: pointer;
    margin: 0;
    padding: 4px;
    background-color: var(--look-button-text);
    border-radius: 6px;
  }

  .copy-button {
    display: inline-block;
    width: 32px;
    height: 32px;
    background: var(--look-button);
    background-size: contain;
    mask: url('!/images/copy.svg') center / contain no-repeat;
  }
</style>
