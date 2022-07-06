<template>
  <h1>User Info</h1>
  <template v-if="online || otherUser.data">
    <template v-if="otherUser.data">
      <h2>View and manage this user.</h2>
    </template>
    <template v-else>
      <h2 class="animated-ellipsis">Rummaging through the users</h2>
    </template>
  </template>
  <template v-else>
    <h2>You're offline. Please connect to the internet to continue.</h2>
  </template>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard/users" />
  </div>

  <div class="content-box-container" v-if="online || otherUser.data">
    <template v-if="!otherUser.loading">
      <template v-if="!otherUser.errored">
        <template v-if="otherUser.data">
          <ContentBox
            :title="otherUser.data.username"
            :src="profileIcon"
            theme-safe
          >
            <p>
              ID: <code>{{ otherUser.data.id }}</code>
            </p>
            <p>
              Email: <code>{{ otherUser.data.email }}</code>
            </p>
            <p>
              Domain:
              <code
                >{{
                  otherUser.data.subdomain
                    ? `${otherUser.data.subdomain}.`
                    : ''
                }}{{ otherUser.data.domain }}</code
              >
            </p>
            <p>
              Created at:
              <code>{{
                toDateString(new Date(otherUser.data.createdAt))
              }}</code>
            </p>
            <p>
              Last Updated:
              <code>{{
                toDateString(new Date(otherUser.data.updatedAt))
              }}</code>
            </p>
            <p>
              Banned at:
              <code>{{
                otherUser.data.bannedAt
                  ? toDateString(new Date(otherUser.data.bannedAt))
                  : 'Not yet...'
              }}</code>
            </p>
            <p>
              Staff:
              <code>{{ otherUser.data.staff ? 'Yes' : 'No' }}</code>
            </p>
          </ContentBox>
        </template>
        <LoadingBlurb v-else />
      </template>
      <div v-else>
        <h1>Something went wrong.</h1>
        <button @click="fetchUser">Retry</button>
      </div>
    </template>
    <LoadingBlurb v-else />
  </div>
  <div v-else>
    <h1>Offline</h1>
    <h2
      >You are currently offline. Please connect to the internet to
      continue.</h2
    >
  </div>
</template>

<script lang="ts" setup>
  import ContentBox from '@/components/ContentBox.vue';
  import BackButton from '@/components/BackButton.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import { useRouter } from 'vue-router';
  import { useOnline } from '@vueuse/core';
  import { userStore } from '@/stores/user';
  import { toastStore } from '@/stores/toast';
  import { ref, onMounted, watch } from 'vue';
  import toLogin from '@/utils/toLogin';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import { otherUserStore } from '@/stores/staff-space/user';
  import { usersStore } from '@/stores/staff-space/users';
  import backWithFallback from '@/utils/routerBackWithFallback';
  import toDateString from '@/utils/dateString';
  import profileIcon from '@/assets/images/profile.svg';

  const user = userStore(),
    users = usersStore(),
    otherUser = otherUserStore(),
    router = useRouter(),
    toast = toastStore(),
    online = useOnline();

  onMounted(async () => {
    if (!online.value) {
      const unwatchOnline = watch(online, () => {
        if (online.value) {
          if (
            !otherUser.data ||
            otherUser.data.id !== router.currentRoute.value.query.id
          ) {
            fetchUser();
          }
          unwatchOnline();
        }
      });
      return;
    }
    if (
      !otherUser.data ||
      otherUser.data.id !== router.currentRoute.value.query.id
    ) {
      fetchUser();
    }
  });

  async function fetchUser() {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const status = await otherUser.getUser(
        router.currentRoute.value.query.id as string
      );
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
          case 'INVALID_USER_ERROR':
            toast.show('This file does not exist.');
            await users.getUsers(users.page);
            await backWithFallback(router, '/staff/users');
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
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }
</script>
