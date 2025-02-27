<template>
  <ConfirmModal ref="confirmModal" @submit="submit" title="Select Your Domain">
    <template v-if="online || !!domainPicker.domains">
      <template v-if="user.loggedIn">
        <LoadingSpinner v-if="domainPicker.loading" />
        <div
          :class="{ 'domain-container': true, 'disabled': disabled }"
          v-if="domainPicker.domains"
        >
          <div class="subdomain-container" v-if="allowsSubdomains">
            <input
              name="subdomain"
              type="text"
              placeholder="Subdomain"
              maxlength="63"
              ref="subdomainInput"
              @input="onSubdomainInput"
              :disabled="disabled"
              v-model="subdomain"
            />
            <p>.</p>
          </div>
          <select
            name="domain"
            ref="domainSelect"
            @change="onDomainSelect"
            :disabled="disabled"
            v-model="domain"
          >
            <option
              v-for="domain in domainPicker.domains.items"
              :value="domain.id"
              v-text="domain.id"
            />
          </select>
        </div>
        <div v-else-if="!domainPicker.loading">
          <h1>I wasn't able to get the available domains.</h1>
          <button @click="reloadDomains">Retry</button>
        </div>
      </template>
      <template v-else>
        <h1>You must be logged in to select a domain.</h1>
        <h2>
          Technically you aren't supposed to be able to see this, dumb
          developer.
        </h2>
        <button @click="submit(false)">Cancel</button>
      </template>
    </template>
    <template v-else>
      <h1>Offline</h1>
      <h2>
        You are currently offline. Please connect to the internet to continue.
      </h2>
    </template>
  </ConfirmModal>
  <div class="input-fit-content-shim" ref="inputFitContentShim" />
</template>

<script lang="ts" setup>
  // Vue Components
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import LoadingSpinner from '@/components/LoadingSpinner.vue';

  // In-House Modules
  import { wait } from '@/utils/wait';

  // Store Modules
  import { domainPickerStore } from '@/stores/domainPicker';
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';

  // External Modules
  import { ref, onMounted, watchEffect } from 'vue';
  import { useOnline } from '@/utils/ConnectivityCheck';

  const emit = defineEmits<{
    (event: 'submit', data: { domain: string; subdomain?: string }): void;
    (event: 'cancel'): void;
    (event: 'no-session'): void;
  }>();
  const {
    domain: domainProp = 'alekeagle.me',
    subdomain: subdomainProp = '',
    disabled,
  } = defineProps<{
    domain?: string;
    subdomain?: string | null;
    disabled?: boolean;
  }>();
  const confirmModal = ref<InstanceType<typeof ConfirmModal>>(),
    domainPicker = domainPickerStore(),
    toast = toastStore(),
    user = userStore(),
    inputFitContentShim = ref<HTMLDivElement>(),
    domainSelect = ref<HTMLSelectElement>(),
    subdomainInput = ref<HTMLInputElement>(),
    domain = ref<string>(),
    subdomain = ref<string>(),
    allowsSubdomains = ref(false),
    online = useOnline();

  function onSubdomainInput(event: Event) {
    const input = event.target as HTMLInputElement;
    validateSubdomain(event as InputEvent);
    setSubdomainWidth(input.value || input.placeholder);
  }

  function onDomainSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    setDomainWidth(select.value);
    allowsSubdomains.value = domainPicker.domains!.items.find(
      (domain) => domain.id === select.value,
    )!.subdomains;
  }

  function validateSubdomain(event: InputEvent) {
    // Validate the subdomain input
    if (event.data === null) return;
    const input = event.target as HTMLInputElement;
    // Check if the subdomain is too long
    if (input.value.length >= 63) {
      event.preventDefault();
      return;
    }
    // Save cursor position
    const cursorPos = input.selectionStart as number;
    // Check if the subdomain contains invalid characters and replace them with a dash
    input.value = input.value.replace(/[^a-z0-9-]/g, '-');
    // Restore cursor position
    setCursorPos(input, cursorPos);
  }

  watchEffect(() => {
    if (allowsSubdomains.value) {
      setTimeout(() => {
        if (!subdomainInput.value) return;
        subdomainInput.value.value = subdomainProp!;
      }, 10);
    }
  });

  async function show() {
    confirmModal.value!.show();
    domain.value = domainProp;
    subdomain.value = subdomainProp!;
    setDomainWidth(domainProp);
    setSubdomainWidth(subdomainProp!);
    allowsSubdomains.value = domainPicker.domains!.items.find(
      (domain) => domain.id === domainProp,
    )!.subdomains;
  }

  function hide() {
    confirmModal.value!.hide();
  }

  function submit(choice: boolean) {
    if (!choice) {
      emit('cancel');
      hide();
    } else {
      const response: {
        domain: string;
        subdomain?: string;
      } = {
        domain: domainSelect.value!.value,
      };
      if (allowsSubdomains.value) {
        response.subdomain = subdomainInput.value!.value;
      }
      emit('submit', response);
    }
  }

  async function reloadDomains() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }

    try {
      await domainPicker.sync();
    } catch (error) {
      toast.genericError();
    }
    return;
  }

  function getWidth(text: string): string {
    inputFitContentShim.value!.innerText = text;
    return window.getComputedStyle(inputFitContentShim.value!).width;
  }

  function setSubdomainWidth(subdomain: string) {
    const width = getWidth(subdomain);
    document.documentElement.style.setProperty('--subdomain-width', width);
  }

  function setDomainWidth(domain: string) {
    const width = getWidth(domain);
    document.documentElement.style.setProperty('--domain-width', width);
  }

  // FIXME: What if Neal deGrasse Tyson had a low taper fade?
  function unsetSubdomainWidth() {
    document.documentElement.style.removeProperty('--subdomain-width');
  }

  // TODO: What if Gordon Freeman had a low taper fade?
  function unsetDomainWidth() {
    document.documentElement.style.removeProperty('--domain-width');
  }

  function setCursorPos(
    e: HTMLInputElement | HTMLTextAreaElement,
    pos: number,
  ) {
    e.focus();
    e.setSelectionRange(pos, pos);
  }

  defineExpose({
    show,
    hide,
    reloadDomains,
  });

  onMounted(async () => {
    await reloadDomains();
    domain.value = domainProp;
    subdomain.value = subdomainProp!;
    await wait(100);
    allowsSubdomains.value = domainPicker.domains!.items.find(
      (domain) => domain.id === domainProp,
    )!.subdomains;
  });
</script>

<style>
  .domain-container {
    padding: 0;
    width: fit-content;
    border-radius: 10px;
    border: 1px solid var(--ui-border);
    background-color: var(--ui-background);
    transition: background-color 0.25s, border 0.25s;
    margin: 0 auto;
  }

  .domain-container:focus-within:not(.disabled),
  .domain-container:hover:not(.disabled) {
    border: 1px solid var(--ui-border-hover);
    background-color: var(--ui-background-hover);
  }

  .domain-container.disabled {
    cursor: not-allowed;
    border: 1px solid var(--ui-border-disabled);
    background-color: var(--ui-background-disabled);
  }

  .subdomain-container {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-items: baseline;
    min-width: 10vw;
    margin: 0;
  }

  .subdomain-container p {
    margin: 0;
    font-weight: 600;
    font-family: var(--font-heading);
  }

  .subdomain-container input {
    padding-right: 0;
    margin: 0;
    width: var(--subdomain-width, 9ch);
    min-width: 10vw;
    text-align: right;
    border: none;
    background-color: transparent;
  }

  .subdomain-container input:focus,
  .subdomain-container input:hover {
    border: none;
    background-color: transparent;
  }

  .domain-container select {
    width: calc(var(--domain-width, 6ch) + 30px);
    padding: 10px 5px;
    min-width: 10vw;
    margin: 0;
    border: none;
    background-color: transparent;
  }

  .domain-container > .subdomain-container + select {
    padding: 10px 10px 10px 0;
    margin-left: -4px;
  }

  .domain-container select:focus,
  .domain-container select:hover {
    border: none;
    background-color: transparent;
  }

  .input-fit-content-shim {
    position: absolute;
    top: 0;
    left: -9999px;
    z-index: -9999;
    overflow: hidden;
    visibility: hidden;
    white-space: nowrap;
    height: 0;
    font-family: var(--font-heading);
    font-weight: 600;
    font-size: 18px;
  }
</style>
