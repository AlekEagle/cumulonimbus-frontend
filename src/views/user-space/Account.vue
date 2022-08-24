<template>
  <h1>Account</h1>
  <h2>Make yourself at home.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard" />
  </div>
  <template v-if="!user.loading && !!user.user">
    <div class="content-box-container">
      <ContentBox
        :title="user.user!.username"
        theme-safe
        :src="profileIcon"
        nowrap
      >
        <p
          >User ID: <code>{{ user.user!.id }}</code></p
        >
        <p
          >Email: <code>{{ user.user!.email }}</code></p
        >
        <p
          >Domain: <code>{{ user.domain }}</code></p
        >
        <p
          >Last updated at:
          <code>{{ toDateString(new Date(user.user!.updatedAt)) }}</code></p
        >
        <p
          >Created at:
          <code>{{ toDateString(new Date(user.user!.createdAt)) }}</code></p
        >
        <p
          >Staff: <code>{{ user.user!.staff ? 'Yes' : 'No' }}</code></p
        >
      </ContentBox>
    </div>
    <div class="content-box-container" v-if="online">
      <ContentBox
        title="Update Username"
        :src="gearIcon"
        theme-safe
        @click="usernameFormModal!.show()"
      >
        Update your username.
      </ContentBox>
      <ContentBox
        title="Update Email"
        :src="gearIcon"
        theme-safe
        @click="emailFormModal!.show()"
      >
        Update your email.
      </ContentBox>
      <ContentBox
        title="Update Password"
        :src="gearIcon"
        theme-safe
        @click="passwordFormModal!.show()"
      >
        Update your password.
      </ContentBox>
      <ContentBox
        title="Update Domain"
        :src="gearIcon"
        theme-safe
        @click="domainModal!.show()"
      >
        Update your domain selection.
      </ContentBox>
      <ContentBox
        title="Manage Signed In Devices"
        :src="gearIcon"
        theme-safe
        to="/dashboard/account/sessions"
      >
        Manage your signed in devices.
      </ContentBox>
      <ContentBox
        title="Sign Out Everywhere"
        :src="gearIcon"
        theme-safe
        @click="deleteSessionsModal!.show()"
      >
        Signing out everywhere can help keep your account safe.
      </ContentBox>
      <ContentBox
        title="Delete All Files"
        :src="gearIcon"
        theme-safe
        @click="deleteFilesModal!.show()"
      >
        Delete all files in your account.
      </ContentBox>
      <ContentBox
        title="Delete Account"
        :src="gearIcon"
        theme-safe
        @click="deleteAccountModal!.show()"
      >
        Delete your account.
      </ContentBox>
    </div>
    <div v-else>
      <h1>You're offline, to manage your account please go back online.</h1>
    </div>
  </template>
  <LoadingBlurb v-else />
  <FormModal
    ref="usernameFormModal"
    title="Update Username"
    :disabled="user.loading"
    @submit="updateUsername"
  >
    <input
      type="text"
      placeholder="New Username"
      autocomplete="username"
      name="username"
      :disabled="user.loading"
      required
    />
    <br />
    <input
      type="password"
      placeholder="Current Password"
      autocomplete="current-password"
      name="password"
      :disabled="user.loading"
      required
    />
  </FormModal>
  <FormModal
    ref="emailFormModal"
    title="Update Email"
    :disabled="user.loading"
    @submit="updateEmail"
  >
    <input
      type="email"
      placeholder="New Email"
      autocomplete="email"
      name="email"
      :disabled="user.loading"
      required
    />
    <br />
    <input
      type="password"
      placeholder="Current Password"
      autocomplete="current-password"
      name="password"
      :disabled="user.loading"
      required
    />
  </FormModal>
  <FormModal
    ref="passwordFormModal"
    title="Update Password"
    :disabled="user.loading"
    @submit="updatePassword"
  >
    <input type="hidden" autocomplete="username" :value="user.user!.username" />
    <input
      type="password"
      placeholder="New Password"
      autocomplete="new-password"
      name="newPassword"
      :disabled="user.loading"
      required
    />
    <br />
    <input
      type="password"
      placeholder="Confirm Password"
      autocomplete="new-password"
      name="repeatNewPassword"
      :disabled="user.loading"
      required
    />
    <br />
    <input
      type="password"
      placeholder="Current Password"
      autocomplete="current-password"
      name="password"
      :disabled="user.loading"
      required
    />
  </FormModal>
  <DomainModal
    ref="domainModal"
    :domain="user.user!.domain"
    :subdomain="user.user!.subdomain"
    :disabled="user.loading"
    @submit="updateDomain"
    @no-session="toLogin(router)"
  />
  <FormModal
    ref="deleteSessionsModal"
    title="Delete all Sessions"
    @submit="deleteSessions"
  >
    <p>This is going to sign you out of: </p>
    <p><strong>Browsers</strong></p>
    <p><strong>Services</strong></p>
    <p><strong>3rd Party Apps</strong></p>
    <p>
      Or anything else, using your account, the switch below will determine
      wether or not you want to stay signed in on this browser.
    </p>
    <Switch name="allButSelf">Stay signed in</Switch>
  </FormModal>
  <ConfirmModal
    ref="deleteFilesModal"
    title="Delete all Files"
    @submit="deleteFiles"
  >
    <p>This is going to delete all files in your account.</p>
    <p>Are you sure?</p>
  </ConfirmModal>
  <FormModal
    title="Delete Account"
    ref="deleteAccountModal"
    @submit="deleteAccount"
    :disabled="user.loading"
  >
    <p>This is going to delete your account.</p>
    <p>Are you sure?</p>
    <input
      type="text"
      placeholder="Username"
      autocomplete="username"
      name="username"
      required
      :disabled="user.loading"
    />
    <br />
    <input
      type="password"
      placeholder="Password"
      autocomplete="current-password"
      name="password"
      required
      :disabled="user.loading"
    />
  </FormModal>
</template>

<script lang="ts" setup>
  import BackButton from '@/components/BackButton.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import FormModal from '@/components/FormModal.vue';
  import DomainModal from '@/components/DomainModal.vue';
  import Switch from '@/components/Switch.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import profileIcon from '@/assets/images/profile.svg';
  import gearIcon from '@/assets/images/gear.svg';
  import { userStore } from '@/stores/user';
  import { toastStore } from '@/stores/toast';
  import toDateString from '@/utils/dateString';
  import toLogin from '@/utils/toLogin';
  import { useOnline } from '@vueuse/core';
  import { useRouter } from 'vue-router';
  import { ref } from 'vue';
  import Cumulonimbus from 'cumulonimbus-wrapper';

  const user = userStore(),
    toast = toastStore(),
    router = useRouter(),
    usernameFormModal = ref<typeof FormModal>(),
    emailFormModal = ref<typeof FormModal>(),
    passwordFormModal = ref<typeof FormModal>(),
    domainModal = ref<typeof DomainModal>(),
    deleteSessionsModal = ref<typeof FormModal>(),
    deleteFilesModal = ref<typeof ConfirmModal>(),
    deleteAccountModal = ref<typeof FormModal>(),
    online = useOnline();

  async function updateUsername(data: { username: string; password: string }) {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const res = await user.updateUsername(data.username, data.password);
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
          case 'MISSING_FIELDS_ERROR':
            toast.show('You need to actually fill out the form');
            break;
          case 'USER_EXISTS_ERROR':
            toast.show('Someone already has that username!');
            break;
          case 'INVALID_PASSWORD_ERROR':
            toast.show('No, that is not the password.');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(res);
            toast.clientError();
            break;
        }
      } else if (res) {
        usernameFormModal.value!.hide();
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  async function updateEmail(data: { email: string; password: string }) {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const res = await user.updateEmail(data.email, data.password);
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
          case 'MISSING_FIELDS_ERROR':
            toast.show('You need to actually fill out the form');
            break;
          case 'USER_EXISTS_ERROR':
            toast.show('Someone already has that email!');
            break;
          case 'INVALID_PASSWORD_ERROR':
            toast.show('No, that is not the password.');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(res);
            toast.clientError();
            break;
        }
      } else if (res) {
        emailFormModal.value!.hide();
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  async function updatePassword(data: {
    newPassword: string;
    repeatNewPassword: string;
    password: string;
  }) {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    if (data.newPassword !== data.repeatNewPassword) {
      toast.show('These passwords do not match.');
      return;
    }
    try {
      const res = await user.updatePassword(data.newPassword, data.password);
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
          case 'MISSING_FIELDS_ERROR':
            toast.show('You need to actually fill out the form');
            break;
          case 'INVALID_PASSWORD_ERROR':
            toast.show('No, that is not the password.');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(res);
            toast.clientError();
            break;
        }
      } else if (res) {
        passwordFormModal.value!.hide();
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  async function updateDomain(data: { domain: string; subdomain?: string }) {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const res = await user.updateDomain(data.domain, data.subdomain);
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
          case 'MISSING_FIELDS_ERROR':
            toast.show('You need to actually fill out the form');
            break;
          case 'INVALID_DOMAIN_ERROR':
            toast.show('You just missed that domain.');
            domainModal.value!.reloadDomains();
            break;
          case 'SUBDOMAIN_NOT_SUPPORTED_ERROR':
            toast.show('Subdomains are not supported.');
            break;
          case 'INVALID_SUBDOMAIN_ERROR':
            toast.show('Subdomain cannot be longer than 63 characters.');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(res);
            toast.clientError();
            break;
        }
      } else if (res) {
        domainModal.value!.hide();
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  async function deleteSessions(data: { allButSelf: boolean }) {
    if (!online.value) {
      toast.connectivity();
      return;
    }

    try {
      const res = await user.deleteAllSessions(data.allButSelf);
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
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(res);
            toast.clientError();
            break;
        }
      } else if (res) {
        deleteSessionsModal.value!.hide();
        if (!data.allButSelf) {
          user.logout(true);
          router.push('/');
        }
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  async function deleteFiles(choice: boolean) {
    if (!choice) {
      deleteFilesModal.value!.hide();
      return;
    }
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const res = await user.deleteAllFiles();
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
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(res);
            toast.clientError();
            break;
        }
      } else {
        toast.show(`Deleted ${res} files.`);
        deleteFilesModal.value!.hide();
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  async function deleteAccount(data: { username: string; password: string }) {
    if (!online.value) {
      toast.connectivity();
      return;
    }
    try {
      const res = await user.deleteAccount(data.username, data.password);
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
          case 'MISSING_FIELDS_ERROR':
            toast.show('You need to actually fill out the form');
            break;
          case 'INVALID_PASSWORD_ERROR':
            toast.show('No, that is not the password.');
            break;
          case 'INVALID_USER_ERROR':
            toast.show('No, that is not the username.');
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(res);
            toast.clientError();
            break;
        }
      } else if (res) {
        deleteAccountModal.value!.hide();
        user.logout(true);
        router.push('/');
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }
</script>
