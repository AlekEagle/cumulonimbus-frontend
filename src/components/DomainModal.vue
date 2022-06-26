<template>
  <FormModal ref="formModal" @cancel="cancel" title="Select Domain">
    <template v-if="user.loggedIn">
      <Loading v-if="slimDomains.loading" />
      <div class="domain-container" v-if="slimDomains.domains">
        <div class="subdomain-container">
          <input
            name="subdomain"
            type="text"
            placeholder="Subdomain"
            maxlength="63"
            :value="props.subdomain"
          />
          <p>.</p>
        </div>
        <select name="domain" :value="props.domain">
          <option
            v-for="domain in slimDomains.domains.items"
            :value="domain.domain"
            v-text="domain.domain"
          />
        </select>
      </div>
      <div v-else-if="!slimDomains.loading">
        <h1>I wasn't able to get the available domains.</h1>
        <button @click="reloadDomains">Retry</button>
      </div>
    </template>
    <template v-else>
      <h1>You must be logged in to select a domain.</h1>
      <button @click="cancel">Cancel</button>
    </template>
  </FormModal>
</template>

<script lang="ts" setup>
import Loading from "@/components/Loading.vue";
import FormModal from "@/components/FormModal.vue";
import { ref, onMounted } from "vue";
import { slimDomainStore } from "@/stores/slimDomains";
import { toastStore } from "@/stores/toast";
import { userStore } from "@/stores/user";

const emit = defineEmits<{
    (event: "submit", data: { domain: string; subdomain?: string }): void;
    (event: "cancel"): void;
  }>(),
  props = defineProps({
    domain: String,
    subdomain: {
      type: String,
      default: "",
    },
  }),
  formModal = ref<typeof FormModal>(),
  slimDomains = slimDomainStore(),
  toast = toastStore(),
  user = userStore();

function show() {
  formModal.value!.show();
}

function hide() {
  formModal.value!.hide();
}

function cancel() {
  emit("cancel");
  hide();
}

async function reloadDomains() {
  const res = await slimDomains.sync();
  if (typeof res === "boolean") {
    if (res) {
      return;
    } else {
      toast.session();
    }
  }
}

defineExpose({
  show,
  hide,
});

onMounted(reloadDomains);
</script>

<style>
.domain-container {
  padding: 0;
  width: fit-content;
  border-radius: 10px;
  border: 1px solid var(--ui-border);
  background-color: var(--ui-background);
  transition: background-color 0.25s, border 0.25s;
}

.domain-container:focus-within,
.domain-container:hover {
  border: 1px solid var(--ui-border-hover);
  background-color: var(--ui-background-hover);
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
  padding-right: 4px;
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
  padding-left: 0;
  min-width: 10vw;
  margin: 0;
  border: none;
  background-color: transparent;
}

.domain-container select:focus,
.domain-container select:hover {
  border: none;
  background-color: transparent;
}
</style>
