<template>
  <h1>Account</h1>
  <h2>Make yourself at home.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard" />
    <button
      @click="refreshUser()"
      title="Refresh account details"
      :disabled="user.loading"
      >Refresh</button
    >
  </div>
  <template v-if="!!user && !user.loading && !!user.account">
    <div class="content-box-container">
      <ContentBox
        :title="user.account!.user.username"
        theme-safe
        :src="profileIcon"
        nowrap
      >
        <p>
          User ID: <code>{{ user.account!.user.id }}</code>
        </p>
        <p>
          Email: <code>{{ user.account!.user.email }}</code>
        </p>
        <p>
          Verified:
          <code>{{
            user.account!.user.verifiedAt
              ? toDateString(new Date(user.account.user!.updatedAt))
              : 'Not yet...'
          }}</code>
        </p>
        <p>
          Domain: <code>{{ user.domain }}</code>
        </p>
        <p>
          Last updated at:
          <code>{{
            toDateString(new Date(user.account.user!.updatedAt))
          }}</code>
        </p>
        <p>
          Created at:
          <code>{{
            toDateString(new Date(user.account.user!.createdAt))
          }}</code>
        </p>
        <p>
          Staff: <code>{{ user.account.user!.staff ? 'Yes' : 'No' }}</code>
        </p>
      </ContentBox>
    </div>
    <Separator />
    <div class="content-box-container" v-if="online">
      <ContentBox
        title="Display Preferences"
        :src="gearIcon"
        theme-safe
        @click="displayPrefsModal!.show()"
      >
        Change your display preferences.
      </ContentBox>
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
        v-if="!user.account!.user.verifiedAt"
        title="Resend Verification Email"
        :src="gearIcon"
        theme-safe
        @click="resendVerificationEmailModal!.show()"
      >
        Resend your verification email.
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
  <Modal dismissible title="Display Preferences" ref="displayPrefsModal">
    <p>Change the look and feel of Cumulonimbus to your liking.</p>
    <br />
    <Switch v-model:checked="displayPref.hour12">
      Use a 12 hour time format?
    </Switch>
    <br />
    <p>Number of items per page:</p>
    <input
      type="number"
      inputmode="numeric"
      :value="displayPref.itemsPerPage"
      min="1"
      max="50"
      @change="onItemsPerPageChange"
      @input="validateItemsPerPage"
    />
  </Modal>
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
      autofocus
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
    <p>
      Changing your email will require you to verify your new email address.
    </p>
    <input
      hidden
      type="text"
      autocomplete="username"
      disabled
      :value="user.account!.user.username"
    />
    <input
      type="email"
      placeholder="New Email"
      autocomplete="email"
      name="email"
      :disabled="user.loading"
      required
      autofocus
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
  <ConfirmModal
    ref="resendVerificationEmailModal"
    title="Resend Verification Email"
    @submit="resendVerificationEmail"
    :disabled="user.loading"
  >
    <p>
      Are you sure you want to resend your verification email? This will send
      another verification email to your email address and the previous one will
      no longer be valid.
    </p>
  </ConfirmModal>
  <FormModal
    ref="passwordFormModal"
    title="Update Password"
    :disabled="user.loading"
    @submit="updatePassword"
  >
    <input
      hidden
      type="text"
      autocomplete="username"
      disabled
      :value="user.account!.user.username"
    />
    <input
      type="password"
      placeholder="New Password"
      autocomplete="new-password"
      name="newPassword"
      :disabled="user.loading"
      required
      autofocus
    />
    <br />
    <input
      type="password"
      placeholder="Confirm Password"
      autocomplete="new-password"
      name="confirmNewPassword"
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
    :domain="user.account?.user.domain"
    :subdomain="user.account?.user.subdomain"
    :disabled="user.loading"
    @submit="updateDomain"
    @no-session="toLogin()"
  />
  <FormModal
    ref="deleteSessionsModal"
    title="Delete all Sessions"
    @submit="deleteSessions"
    :disabled="user.loading"
  >
    <p>This is going to sign you out of:</p>
    <p><strong>Browsers</strong></p>
    <p><strong>Services</strong></p>
    <p><strong>3rd Party Apps</strong></p>
    <p>
      Or anything else, using your account, the switch below will sign this
      device out as well.
    </p>
    <Switch name="includeSelf">Sign out this device as well</Switch>
  </FormModal>
  <FormModal
    ref="deleteFilesModal"
    title="Delete all Files"
    @submit="deleteFiles"
    :disabled="user.loading"
  >
    <p>This is going to delete all files in your account.</p>
    <p>Please enter your password to confirm.</p>
    <input
      hidden
      type="text"
      autocomplete="username"
      disabled
      :value="user.account!.user.username"
    />
    <input
      type="password"
      placeholder="Password"
      autocomplete="current-password"
      name="password"
      required
      :disabled="user.loading"
      autofocus
    />
  </FormModal>
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
  <FullscreenLoadingBlurb ref="fullscreenLoadingBlurb" />
</template>

<script lang="ts" setup>
  import BackButton from '@/components/BackButton.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import FullscreenLoadingBlurb from '@/components/FullscreenLoadingBlurb.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import Modal from '@/components/Modal.vue';
  import FormModal from '@/components/FormModal.vue';
  import DomainModal from '@/components/DomainModal.vue';
  import Switch from '@/components/Switch.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import profileIcon from '@/assets/images/profile.svg';
  import gearIcon from '@/assets/images/gear.svg';
  import { userStore } from '@/stores/user';
  import { toastStore } from '@/stores/toast';
  import { displayPrefStore } from '@/stores/displayPref';
  import toDateString from '@/utils/toDateString';
  import toLogin from '@/utils/toLogin';
  import defaultErrorHandler from '@/utils/defaultErrorHandler';
  import { useOnline } from '@vueuse/core';
  import { useRouter } from 'vue-router';
  import { ref } from 'vue';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import Separator from '@/components/Separator.vue';

  const user = userStore(),
    toast = toastStore(),
    router = useRouter(),
    displayPref = displayPrefStore(),
    displayPrefsModal = ref<typeof Modal>(),
    usernameFormModal = ref<typeof FormModal>(),
    emailFormModal = ref<typeof FormModal>(),
    resendVerificationEmailModal = ref<typeof ConfirmModal>(),
    passwordFormModal = ref<typeof FormModal>(),
    domainModal = ref<typeof DomainModal>(),
    deleteSessionsModal = ref<typeof FormModal>(),
    deleteFilesModal = ref<typeof ConfirmModal>(),
    deleteAccountModal = ref<typeof FormModal>(),
    fullscreenLoadingBlurb = ref<typeof FullscreenLoadingBlurb>(),
    online = useOnline();

  async function updateUsername(data: { username: string; password: string }) {
    if (!online.value) return toast.connectivityOffline();

    const oldUsername = user.account!.user.username;
    try {
      fullscreenLoadingBlurb.value!.show();
      const res = await user.changeUsername(data.username, data.password);
      if (res instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(res);
        if (!handled) {
          switch (res.code) {
            case 'USER_EXISTS_ERROR':
              toast.show('Someone already has that username!');
              break;
          }
        }
        fullscreenLoadingBlurb.value!.hide();
      } else if (res) {
        const token = user.accounts[oldUsername]!;
        delete user.accounts[oldUsername];
        user.accounts[data.username] = token;
        fullscreenLoadingBlurb.value!.hide();
        usernameFormModal.value!.hide();
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  async function updateEmail(data: { email: string; password: string }) {
    if (!online.value) return toast.connectivityOffline();

    try {
      fullscreenLoadingBlurb.value!.show();
      const res = await user.changeEmail(data.email, data.password);
      if (res instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(res);
        if (!handled) {
          switch (res.code) {
            case 'USER_EXISTS_ERROR':
              toast.show('Someone already has that email!');
              break;
          }
        }
        fullscreenLoadingBlurb.value!.hide();
      } else if (res) {
        fullscreenLoadingBlurb.value!.hide();
        emailFormModal.value!.hide();
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  async function resendVerificationEmail(choice: boolean) {
    if (!choice) return;
    if (!online.value) return toast.connectivityOffline();

    try {
      fullscreenLoadingBlurb.value!.show();
      const res = await user.resendVerificationEmail();
      if (res instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(res);
        if (!handled) {
          switch (res.code) {
            case 'EMAIL_ALREADY_VERIFIED_ERROR':
              toast.show('You are already verified!');
              break;
          }
        }
        fullscreenLoadingBlurb.value!.hide();
      } else if (res) {
        toast.show('Sent! Check your email.');
        fullscreenLoadingBlurb.value!.hide();
        resendVerificationEmailModal.value!.hide();
      }
    } catch (error) {
      fullscreenLoadingBlurb.value!.hide();
      console.error(error);
      toast.clientError();
    }
  }

  async function updatePassword(data: {
    newPassword: string;
    confirmNewPassword: string;
    password: string;
  }) {
    if (!online.value) return toast.connectivityOffline();

    try {
      fullscreenLoadingBlurb.value!.show();
      const res = await user.changePassword(
        data.newPassword,
        data.confirmNewPassword,
        data.password,
      );
      if (res instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(res);
        if (!handled) {
          toast.clientError();
        }
      } else if (res) {
        fullscreenLoadingBlurb.value!.hide();
        passwordFormModal.value!.hide();
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  async function updateDomain(data: { domain: string; subdomain?: string }) {
    if (!online.value) return toast.connectivityOffline();

    try {
      fullscreenLoadingBlurb.value!.show();
      const res = await user.changeDomain(data.domain, data.subdomain);
      if (res instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(res);
        if (!handled) {
          switch (res.code) {
            case 'INVALID_DOMAIN_ERROR':
              toast.show('You just missed that domain.');
              domainModal.value!.reloadDomains();
              break;
            case 'SUBDOMAIN_NOT_ALLOWED_ERROR':
              toast.show('Subdomains are not supported.');
              break;
            case 'SUBDOMAIN_TOO_LONG_ERROR':
              toast.show('Subdomain cannot be longer than 63 characters.');
              break;
          }
        }
      } else if (res) {
        fullscreenLoadingBlurb.value!.hide();
        domainModal.value!.hide();
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  async function deleteSessions(data: { includeSelf: boolean }) {
    if (!online.value) return toast.connectivityOffline();

    try {
      fullscreenLoadingBlurb.value!.show();
      const res = await user.revokeSessions(data.includeSelf);
      if (res instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(res);
        if (!handled) {
          toast.clientError();
        }
      } else if (res) {
        fullscreenLoadingBlurb.value!.hide();
        deleteSessionsModal.value!.hide();
        toast.show(`Deleted ${res} sessions.`);
        if (data.includeSelf) {
          toLogin();
        }
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  async function deleteFiles(data: { password: string }) {
    if (!online.value) return toast.connectivityOffline();

    try {
      fullscreenLoadingBlurb.value!.show();
      const res = await user.deleteFiles(data.password);
      if (res instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(res);
        if (!handled) {
          switch (res.code) {
            case 'INVALID_FILE_ERROR':
              toast.show("You don't have any files to delete.");
              break;
            default:
              toast.clientError();
              break;
          }
        }
      } else {
        toast.show(`Deleted ${res} files.`);
        fullscreenLoadingBlurb.value!.hide();
        deleteFilesModal.value!.hide();
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  async function deleteAccount(data: { username: string; password: string }) {
    if (!online.value) return toast.connectivityOffline();

    try {
      fullscreenLoadingBlurb.value!.show();
      const res = await user.deleteAccount(data.username, data.password);
      if (res instanceof Cumulonimbus.ResponseError) {
        switch (res.code) {
          case 'INVALID_USERNAME_ERROR':
            toast.show('That is not your username.');
            break;
          default:
            const handled = await defaultErrorHandler(res);
            if (!handled) {
              toast.clientError();
            }
            break;
        }
      } else if (res) {
        fullscreenLoadingBlurb.value!.hide();
        await deleteAccountModal.value!.hide();
        router.replace('/');
        toast.show("We're sad to see you go, but we understand.");
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  function onItemsPerPageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value === '') {
      input.value = displayPref.itemsPerPage + '';
      return;
    }
    if (Number(input.value) < 1) {
      displayPref.itemsPerPage = 1;
    } else if (Number(input.value) > 50) {
      displayPref.itemsPerPage = 50;
    } else {
      displayPref.itemsPerPage = Number(input.value);
    }
  }

  function validateItemsPerPage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value === '') return;
    if (Number(input.value) < 1) {
      input.value = '1';
    } else if (Number(input.value) > 50) {
      input.value = '50';
    }
  }

  async function refreshUser() {
    if (!online.value) return toast.connectivityOffline();

    try {
      const res = await user.refetch();
      if (res instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(res);
        if (!handled) {
          toast.clientError();
        }
      } else {
        toast.show('Refreshed account details.');
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }
</script>
