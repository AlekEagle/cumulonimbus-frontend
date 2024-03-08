<template>
  <h1>Setup Guide</h1>
  <h2>It won't take you more than a few minutes to get set up.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard/setup-guides" />
  </div>
  <Online>
    <div class="content-box-container" v-if="instruction.data">
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
          <LoadingMessage spinner v-else />
        </template>
        <div v-else>
          <h1>Something went wrong.</h1>
          <button @click="fetchInstruction">Retry</button>
        </div>
      </template>
      <LoadingMessage spinner v-else />
    </div>
  </Online>
  <FormModal
    title="Verify Your Identity"
    ref="verifyIdentityModal"
    @cancel="cancelVerify"
    @submit="verifyIdentity"
    :disabled="processing"
  >
    <Online>
      <p>Please login again to verify your identity.</p>
      <p>
        Name what your new
        {{ instruction.data ? instruction.data.name : 'thing' }}
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
    </Online>
  </FormModal>
  <FullscreenLoadingMessage ref="fullscreenLoadingMessage" />
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import FormModal from '@/components/FormModal.vue';
  import FullscreenLoadingMessage from '@/components/FullscreenLoadingMessage.vue';
  import LoadingMessage from '@/components/LoadingMessage.vue';
  import Online from '@/components/Online.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import backWithFallback from '@/utils/routerBackWithFallback';
  import defaultErrorHandler from '@/utils/defaultErrorHandler';
  import loadWhenOnline from '@/utils/loadWhenOnline';

  // Store Modules
  import { instructionStore } from '@/stores/user-space/instruction';
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';

  // External Modules
  import { ref, onMounted } from 'vue';
  import { useOnline, useClipboard } from '@vueuse/core';
  import { useRouter } from 'vue-router';

  const BaseAPIURLs: { [key: string]: string } = {
    production: `${window.location.protocol}//${window.location.host}/api`,
    ptb: 'https://alekeagle.me/api',
    development: 'http://localhost:8000/api',
  };

  const instruction = instructionStore(),
    user = userStore(),
    toast = toastStore(),
    router = useRouter(),
    online = useOnline(),
    { copy } = useClipboard(),
    session = ref<Cumulonimbus.Data.SuccessfulAuth>(),
    processing = ref(false),
    verifyIdentityModal = ref<InstanceType<typeof FormModal>>(),
    fullscreenLoadingMessage =
      ref<InstanceType<typeof FullscreenLoadingMessage>>(),
    OS = ref<string>(
      (navigator as any).userAgentData
        ? (navigator as any).userAgentData.platform
        : navigator.platform,
    );

  async function fetchInstruction() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await instruction.getInstruction(
        router.currentRoute.value.query.id as string,
      );
      if (!status) {
        await backWithFallback(router, '/dashboard/setup-guides', true);
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  onMounted(() => {
    verifyIdentityModal.value!.show();

    loadWhenOnline(
      fetchInstruction,
      !instruction.data ||
        instruction.data?.name !== router.currentRoute.value.query.id,
    );
  });

  async function cancelVerify() {
    await verifyIdentityModal.value!.hide();
    backWithFallback(router, '/dashboard/setup-guides', true);
  }

  async function getSetupFile() {
    if (!instruction.data) return;
    const setupFileData = instruction.data.content.replace(
      '{{token}}',
      session.value!.token,
    );
    if (instruction.data.filename) {
      // generate a new setup file and download it
      const blob = new Blob([setupFileData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = instruction.data.filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // if it's not a file, just copy the fileData to the clipboard
      copy(setupFileData);
      toast.show('Copied to clipboard.');
    }
  }

  async function verifyIdentity(data: { name: string; password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    processing.value = true;
    try {
      fullscreenLoadingMessage.value!.show();
      const newSession = await fetch(
          `${BaseAPIURLs[import.meta.env.MODE]}/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Session-Name':
                data.name ||
                `${
                  instruction.data ? instruction.data.name : 'thing'
                } on ${OS}`,
            },
            body: JSON.stringify({
              username: user.account!.user.username,
              password: data.password,
              rememberMe: true,
            }),
          },
        ),
        json = await newSession.json();

      if (newSession.status === 201) {
        session.value = json;
        fullscreenLoadingMessage.value!.hide();
        await verifyIdentityModal.value!.hide();
      } else {
        const handled = await defaultErrorHandler(
          new Cumulonimbus.ResponseError(json, {
            limit: Number(newSession.headers.get('Ratelimit-Limit') || '0'),
            remaining: Number(
              newSession.headers.get('Ratelimit-Remaining') || '0',
            ),
            reset: Number(newSession.headers.get('Ratelimit-Reset') || '0'),
          }),
          router,
        );
        if (!handled) {
          switch (json.code) {
            case 'INVALID_PASSWORD_ERROR':
              toast.invalidPassword();
              break;
          }
        }
        fullscreenLoadingMessage.value!.hide();
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    } finally {
      processing.value = false;
    }
  }
</script>
