<template>
  <h1>Setup Guide</h1>
  <template v-if="online || instruction.data">
    <h2 v-if="instruction.data">
      It won't take you more than a few minutes to set this up.
    </h2>
    <h2 class="animated-ellipsis" v-else>Speed reading the setup guide</h2>
  </template>
  <h2 v-else>You're offline. Please connect to the internet to continue.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard/setup-guides" />
  </div>
  <div class="content-box-container" v-if="online || instruction.data">
    <template v-if="!instruction.loading">
      <template v-if="!instruction.errored">
        <template v-if="instruction.data">
          <ContentBox
            v-for="(step, index) in instruction.data.steps"
            :title="`Step ${index + 1}`"
            @click="index === 0 ? getSetupFile() : undefined"
          >
            {{ step }}
          </ContentBox>
        </template>
        <LoadingBlurb v-else />
      </template>
      <div v-else>
        <h1>Something went wrong.</h1>
        <button @click="fetchInstruction">Retry</button>
      </div>
    </template>
    <LoadingBlurb v-else />
  </div>
  <div v-else>
    <h1>Offline</h1>
    <h2>
      You are currently offline. Please connect to the internet to continue.
    </h2>
  </div>
  <FormModal
    title="Verify Your Identity"
    ref="verifyIdentityModal"
    @cancel="cancelVerify"
    @submit="verifyIdentity"
    :disabled="processing"
  >
    <template v-if="online">
      <p>Please login again to verify your identity.</p>
      <p>
        Name what your new
        {{ instruction.data ? instruction.data.name : "thing" }}
        will be called.
      </p>
      <input
        type="text"
        :placeholder="`${
          instruction.data ? instruction.data.name : 'thing'
        } on ${OS}`"
        autocomplete="off"
        name="name"
        required
        :disabled="processing"
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        autocomplete="current-password"
        name="password"
        required
        :disabled="processing"
      />
    </template>
    <template v-else>
      <h1>Offline</h1>
      <h2>
        You are currently offline. Please connect to the internet to continue.
      </h2>
    </template>
  </FormModal>
  <FullscreenLoadingBlurb ref="fullscreenLoadingBlurb" />
</template>

<script lang="ts" setup>
import ContentBox from "@/components/ContentBox.vue";
import LoadingBlurb from "@/components/LoadingBlurb.vue";
import FullscreenLoadingBlurb from "@/components/FullscreenLoadingBlurb.vue";
import BackButton from "@/components/BackButton.vue";
import FormModal from "@/components/FormModal.vue";
import { instructionStore } from "@/stores/user-space/instruction";
import { instructionsStore } from "@/stores/user-space/instructions";
import { userStore } from "@/stores/user";
import { toastStore } from "@/stores/toast";
import { useRouter } from "vue-router";
import { useOnline, useClipboard } from "@vueuse/core";
import defaultErrorHandler from "@/utils/defaultErrorHandler";
import Cumulonimbus from "cumulonimbus-wrapper";
import backWithFallback from "@/utils/routerBackWithFallback";
import { ref, watch, onMounted } from "vue";

const BaseAPIURLs: { [key: string]: string } = {
  production: `${window.location.protocol}//${window.location.host}/api`,
  prod_preview: "https://alekeagle.me/api",
  development: "http://localhost:8000/api",
};

const instruction = instructionStore(),
  instructions = instructionsStore(),
  user = userStore(),
  toast = toastStore(),
  router = useRouter(),
  online = useOnline(),
  { copy } = useClipboard(),
  session = ref<Cumulonimbus.Data.SuccessfulAuth>(),
  processing = ref(false),
  verifyIdentityModal = ref<typeof FormModal>(),
  fullscreenLoadingBlurb = ref<typeof FullscreenLoadingBlurb>(),
  OS = ref<string>(
    (navigator as any).userAgentData
      ? (navigator as any).userAgentData.platform
      : navigator.platform
  );

async function fetchInstruction() {
  if (!online.value) {
    toast.connectivityOffline();
    return;
  }
  try {
    const status = await instruction.getInstruction(
      router.currentRoute.value.query.id as string
    );
    if (status instanceof Cumulonimbus.ResponseError) {
      const handled = await defaultErrorHandler(status, router);
      if (!handled) {
        switch (status.code) {
          case "INVALID_INSTRUCTION_ERROR":
            toast.show("This setup guide does not exist.");
            await instructions.getInstructions(instructions.page);
            await backWithFallback(router, "/dashboard/setup-guides", true);
            break;
        }
      }
    } else if (!status) {
      toast.clientError();
    }
  } catch (e) {
    console.error(e);
    toast.clientError();
  }
}

onMounted(() => {
  verifyIdentityModal.value!.show();
  if (!online.value) {
    const unwatchOnline = watch(online, () => {
      if (online.value) {
        if (
          !instruction.data ||
          instruction.data.name !== router.currentRoute.value.query.id
        ) {
          fetchInstruction();
        }
        unwatchOnline();
      }
    });
  } else if (
    !instruction.data ||
    instruction.data.name !== router.currentRoute.value.query.id
  ) {
    fetchInstruction();
  }
});

async function cancelVerify() {
  await verifyIdentityModal.value!.hide();
  backWithFallback(router, "/dashboard/setup-guides", true);
}

async function getSetupFile() {
  if (!instruction.data) return;
  const setupFileData = instruction.data.content.replace(
    "{{token}}",
    session.value!.token
  );
  if (instruction.data.filename) {
    // generate a new setup file and download it
    const blob = new Blob([setupFileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = instruction.data.filename;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    // if it's not a file, just copy the fileData to the clipboard
    copy(setupFileData);
    toast.show("Copied to clipboard.");
  }
}

async function verifyIdentity(data: { name: string; password: string }) {
  if (!online.value) {
    toast.connectivityOffline();
    return;
  }
  processing.value = true;
  try {
    fullscreenLoadingBlurb.value!.show();
    const newSession = await fetch(
        `${BaseAPIURLs[import.meta.env.MODE]}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Token-Name":
              data.name ||
              `${instruction.data ? instruction.data.name : "thing"} on ${OS}`,
          },
          body: JSON.stringify({
            username: user.account!.user.username,
            password: data.password,
            rememberMe: true,
          }),
        }
      ),
      json = await newSession.json();

    if (newSession.status === 201) {
      session.value = json;
      fullscreenLoadingBlurb.value!.hide();
      await verifyIdentityModal.value!.hide();
    } else {
      const handled = await defaultErrorHandler(
        new Cumulonimbus.ResponseError(json, {
          limit: Number(newSession.headers.get("Ratelimit-Limit") || "0"),
          remaining: Number(
            newSession.headers.get("Ratelimit-Remaining") || "0"
          ),
          reset: Number(newSession.headers.get("Ratelimit-Reset") || "0"),
        }),
        router
      );
      if (!handled) {
        switch (json.code) {
          case "INVALID_PASSWORD_ERROR":
            toast.invalidPassword();
            break;
        }
      }
    }
  } catch (error) {
    console.error(error);
    toast.clientError();
  } finally {
    processing.value = false;
  }
}
</script>
