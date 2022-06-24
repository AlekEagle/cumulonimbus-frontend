<template>
  <h1>Dashboard</h1>
  <h2>Welcome to your dashboard, {{ user.user.username }}.</h2>
  <div class="quick-action-buttons-container">
    <button
      @click="logout"
      v-text="processing ? 'Logging out...' : 'Logout'"
      :disabled="processing"
    />
    <button @click="modal!.show" v-text="'Open Modal'" />
  </div>
  <div class="content-box-container">
    <ContentBox
      title="Account"
      src="@/assets/images/profile.svg"
      theme-safe
      to="/dashboard/account"
    >
      See and edit your account.
    </ContentBox>
    <ContentBox
      title="Files"
      src="@/assets/images/file.svg"
      theme-safe
      to="/dashboard/files"
    >
      See and manage all of the files you've uploaded.
    </ContentBox>
    <ContentBox
      title="Quick Setup"
      src="@/assets/images/info.svg"
      theme-safe
      to="/dashboard/quick-setup"
    >
      Quickly setup and connect a service to Cumulonimbus and your account.
    </ContentBox>
    <ContentBox
      title="Upload"
      src="@/assets/images/upload.svg"
      theme-safe
      to="/dashboard/upload"
    >
      Upload a file to Cumulonimbus without the need of an external service or
      program.
    </ContentBox>
  </div>

  <Modal dismissible ref="modal" @close="modalClosed">
    <template v-slot:default>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quibusdam
      voluptatum, debitis dignissimos dolore rem, non ipsum aliquid id molestias
      repellendus, similique sapiente quasi? Totam esse recusandae quam fugit
      pariatur labore.
    </template>
    <template v-slot:footer>
      <button @click="modal!.hide" v-text="'Close'" />
      <button @click="modal!.hide" v-text="'Close again'" />
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import { userStore } from "@/stores/user";
import { toastStore } from "@/stores/toast";
import { ref } from "vue";
import { useRouter } from "vue-router";
import ContentBox from "@/components/ContentBox.vue";
import Modal from "@/components/Modal.vue";

const user = userStore(),
  toast = toastStore(),
  processing = ref<boolean>(false),
  router = useRouter(),
  modal = ref<typeof Modal>();

async function logout() {
  processing.value = true;
  try {
    let res = await user.logout();
    if (typeof res === "string") {
      toast.show(res);
    } else if (typeof res === "number") {
      toast.rateLimit(res);
    } else if (res) {
      router.replace("/");
    } else {
      toast.show("Something went wrong.");
    }
  } catch (e) {
    toast.show("Something went wrong.");
    console.error(e);
  } finally {
    processing.value = false;
  }
}

function modalClosed() {
  toast.show("Modal closed.");
}
</script>
