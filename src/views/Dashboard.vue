<template>
  <h1>Dashboard</h1>
  <h2>Welcome to your dashboard {{ user.user.username }}.</h2>
  <div class="quick-action-buttons-container">
    <button
      @click="logout"
      v-text="processing ? 'Logging out...' : 'Logout'"
      :disabled="processing"
    />
  </div>
  <div class="content-box-container">
    <ContentBox></ContentBox>
    <ContentBox></ContentBox>
    <ContentBox></ContentBox>
    <ContentBox></ContentBox>
    <ContentBox></ContentBox>
    <ContentBox></ContentBox>
    <ContentBox></ContentBox>
    <ContentBox></ContentBox>
    <ContentBox></ContentBox>
    <ContentBox></ContentBox>
    <ContentBox></ContentBox>
  </div>
</template>

<script lang="ts" setup>
import { userStore } from "@/stores/user";
import { toastStore } from "@/stores/toast";
import { ref } from "vue";
import { useRouter } from "vue-router";
import ContentBox from "@/components/ContentBox.vue";

const user = userStore(),
  toast = toastStore(),
  processing = ref<boolean>(false),
  router = useRouter();

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
</script>
