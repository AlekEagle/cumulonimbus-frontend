<template>
  <h1>Your Files</h1>
  <h2
    >Check out everything
    {{
      files.selectedUser ? `${files.selectedUser.username} has ` : ''
    }}uploaded.</h2
  >
  <template v-if="online || files.data">
    <template v-if="files.data">
      <h2>
        Showing page {{ page + 1 }} of
        {{ (files.data ? Math.floor(files.data?.count / 50) : 0) + 1 }}
      </h2>
      <h2> {{ files.data?.count || 'some number of' }} files in total. </h2>
    </template>
    <h2 class="animated-ellipsis" v-else
      >Alek is individually counting the files</h2
    >
  </template>
  <template v-else>
    <h2>Alek can't count the files because you are offline :(</h2>
  </template>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard" />
    <button
      v-if="!selecting"
      @click="selecting = true"
      :disabled="files.loading"
    >
      Bulk Delete
    </button>
    <template v-else>
      <button @click="selecting = false" :disabled="files.loading">
        Cancel
      </button>
      <button @click="displayModal" :disabled="files.loading">
        Delete Selected
      </button>
    </template>
  </div>

  <Paginator
    v-model="page"
    @page-change="fetchFiles"
    :max="files.data ? Math.floor(files.data?.count / 50) : 0"
    :disabled="files.loading || !online"
  >
    <template v-if="online || files.data">
      <template v-if="!files.loading">
        <template v-if="!files.errored">
          <div
            v-if="files.data && files.data.count > 0"
            class="content-box-container"
          >
            <PreviewContentBox
              v-for="file in files.data.items"
              :file="file"
              :selecting="selecting"
              :selected="selected.includes(file.filename)"
              @click="onFileClick(file)"
            />
          </div>
          <div v-else class="no-content-container">
            <h1>There isn't anything here yet...</h1>
            <h2>{{
              files.selectedUser
                ? `${files.selectedUser.username} hasn't uploaded anything yet.`
                : 'No one has uploaded anything yet.'
            }}</h2>
          </div>
        </template>
        <div class="no-content-container" v-else>
          <h1>Something went wrong.</h1>
          <button @click="fetchFiles">Retry</button>
        </div>
      </template>
      <div class="no-content-container" v-else>
        <LoadingBlurb />
      </div>
    </template>
    <div class="no-content-container" v-else>
      <h1>Offline</h1>
      <h2
        >You are currently offline. Please connect to the internet to
        continue.</h2
      >
    </div>
  </Paginator>
  <ConfirmModal
    ref="confirmModal"
    title="Are you sure?"
    @submit="deleteSelected"
  >
    <p>Are you sure you want to delete these {{ selected.length }} files?</p>
    <p>They will be lost forever! (A long time!)</p>
  </ConfirmModal>
</template>

<script lang="ts" setup>
  import PreviewContentBox from '@/components/PreviewContentBox.vue';
  import Paginator from '@/components/Paginator.vue';
  import BackButton from '@/components/BackButton.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import { filesStore } from '@/stores/staff-space/files';
  import { userStore } from '@/stores/user';
  import { toastStore } from '@/stores/toast';
  import { useOnline } from '@vueuse/core';
  import { useRouter } from 'vue-router';
  import { ref, watch, onMounted } from 'vue';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import toLogin from '@/utils/toLogin';
  import backWithFallback from '@/utils/routerBackWithFallback';

  const online = useOnline(),
    router = useRouter(),
    files = filesStore(),
    user = userStore(),
    toast = toastStore(),
    selected = ref<string[]>([]),
    selecting = ref(false),
    page = ref(0),
    confirmModal = ref<typeof ConfirmModal>();

  onMounted(async () => {
    if (!online.value) {
      const unwatchOnline = watch(online, async () => {
        if (online.value) {
          if (
            !files.data ||
            files.page !== page.value ||
            (files.selectedUser &&
              files.selectedUser.id !== router.currentRoute.value.query.user)
          ) {
            if (router.currentRoute.value.query.user) {
              files.selectedUser = (
                await user.client!.getUser(
                  router.currentRoute.value.query.user as string
                )
              ).result;
            } else {
              files.selectedUser = null;
            }
            fetchFiles();
          }
          unwatchOnline();
        }
      });
      return;
    }
    if (
      !files.data ||
      files.page !== page.value ||
      (files.selectedUser &&
        files.selectedUser.id !== router.currentRoute.value.query.user)
    ) {
      if (router.currentRoute.value.query.user) {
        files.selectedUser = (
          await user.client!.getUser(
            router.currentRoute.value.query.user as string
          )
        ).result;
      } else {
        files.selectedUser = null;
      }
      fetchFiles();
    }
  });

  async function fetchFiles() {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    window.scrollTo(0, 0);
    try {
      const status = await files.getFiles(page.value);
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout(true);
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INSUFFICIENT_PERMISSIONS_ERROR':
            await user.getSelf();
            router.replace('/');
            break;
          case 'INVALID_USER_ERROR':
            toast.show('Invalid user.');
            backWithFallback(router, '/staff/users');
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      } else if (!status) {
        toast.clientError();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  function onFileClick(file: Cumulonimbus.Data.File) {
    if (selecting.value) {
      if (selected.value.includes(file.filename)) {
        selected.value = selected.value.filter(f => f !== file.filename);
      } else {
        selected.value.push(file.filename);
      }
    }
  }

  function displayModal() {
    if (selected.value.length > 0) {
      confirmModal.value!.show();
    } else {
      toast.show('You must select at least one file to delete.');
    }
  }

  async function deleteSelected() {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const status = await files.deleteFiles(selected.value);
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout(true);
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'MISSING_FIELDS_ERROR':
            if (selected.value.length > 0)
              toast.show('You can only select up to 100 files at once.');
            else toast.show('You must select at least one file to delete.');
            break;
          case 'INSUFFICIENT_PERMISSIONS_ERROR':
            await user.getSelf();
            router.replace('/');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      } else if (!status) {
        toast.clientError();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }
</script>
