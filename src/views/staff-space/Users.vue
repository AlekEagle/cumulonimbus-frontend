<template>
  <h1>All Users</h1>
  <template v-if="online || users.data">
    <template v-if="users.data">
      <h2>
        All users registered on Cumulonimbus.
        <br />
        Showing page {{ page + 1 }} of
        {{ (users.data ? Math.floor(users.data?.count / 50) : 0) + 1 }}
        <br />
        {{ users.data?.count || 'some number of' }} users in total.
      </h2>
    </template>
    <h2 class="animated-ellipsis" v-else
      >Alek is individually counting the users</h2
    >
  </template>
  <template v-else>
    <h2>Alek can't count the users because you are offline :(</h2>
  </template>

  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard" />
    <button
      v-if="!selecting"
      @click="selecting = true"
      :disabled="users.loading"
    >
      Bulk Delete
    </button>
    <template v-else>
      <button @click="selecting = false" :disabled="users.loading">
        Cancel
      </button>
      <button @click="confirmModal!.show()" :disabled="users.loading">
        Delete Selected
      </button>
    </template>
  </div>

  <Paginator
    v-model="page"
    @page-change="fetchUsers"
    :max="users.data ? Math.floor(users.data?.count / 50) : 0"
    :disabled="users.loading || !online"
  >
    <template v-if="online || users.data">
      <template v-if="!users.loading">
        <template v-if="!users.errored">
          <div
            v-if="users.data && users.data.count > 0"
            class="content-box-container"
          >
            <SelectableContentBox
              v-for="user in users.data.items"
              :title="user.username"
              :selecting="selecting"
              :selected="selected.includes(user.id)"
              :src="profileIcon"
              theme-safe
              @click="onUserClick(user)"
            >
              {{ user.id }}
            </SelectableContentBox>
          </div>
          <div v-else class="no-content-container">
            <h1>how</h1>
          </div>
        </template>
        <template v-else>
          <h1>Something went wrong.</h1>
          <button @click="fetchUsers">Retry</button>
        </template>
      </template>
      <LoadingBlurb v-else />
    </template>
    <template v-else>
      <h1>Offline</h1>
      <h2
        >You are currently offline. Please connect to the internet to
        continue.</h2
      >
    </template>
  </Paginator>
  <ConfirmModal
    ref="confirmModal"
    title="Are you sure?"
    @submit="deleteSelected"
  >
    <p>
      Are you sure you want to delete the selected users? This action cannot be
      undone.
    </p>
  </ConfirmModal>
</template>

<script lang="ts" setup>
  import SelectableContentBox from '@/components/SelectableContentBox.vue';
  import Paginator from '@/components/Paginator.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import BackButton from '@/components/BackButton.vue';
  import { userStore } from '@/stores/user';
  import { usersStore } from '@/stores/staff-space/users';
  import { toastStore } from '@/stores/toast';
  import { ref, onMounted, watch } from 'vue';
  import toLogin from '@/utils/toLogin';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import { useRouter } from 'vue-router';
  import { useOnline } from '@vueuse/core';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import profileIcon from '@/assets/images/profile.svg';

  const users = usersStore(),
    user = userStore(),
    page = ref(0),
    toast = toastStore(),
    router = useRouter(),
    selecting = ref(false),
    selected = ref<string[]>([]),
    online = useOnline(),
    confirmModal = ref<typeof ConfirmModal>();

  onMounted(async () => {
    if (!online.value) {
      const unwatchOnline = watch(online, () => {
        if (online.value) {
          if (!users.data || users.page !== page.value) {
            fetchUsers();
          }
          unwatchOnline();
        }
      });
      return;
    }
    if (!users.data || users.page !== page.value) {
      fetchUsers();
    }
  });

  async function onUserClick(user: Cumulonimbus.Data.User) {
    if (selecting.value) {
      if (selected.value.includes(user.id)) {
        selected.value = selected.value.filter(u => u !== user.id);
      } else {
        selected.value.push(user.id);
      }
    } else {
      router.push({ path: '/staff/user', query: { id: user.id } });
    }
  }

  async function fetchUsers() {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    window.scrollTo(0, 0);
    try {
      const res = users.getUsers(page.value);
      if (res instanceof Cumulonimbus.ResponseError) {
        switch (res.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout(true);
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(res);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INSUFFICIENT_PERMISSIONS_ERROR':
            await user.getSelf();
            router.replace('/');
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(res);
        }
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  async function deleteSelected() {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const res = await users.deleteUsers(selected.value);
      if (res instanceof Cumulonimbus.ResponseError) {
        switch (res.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout(true);
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(res);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
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
            console.error(res);
            toast.clientError();
        }
      } else {
        toast.show(`Deleted ${res} users.`);
        selected.value = [];
        selecting.value = false;
        confirmModal.value!.hide();
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }
</script>
