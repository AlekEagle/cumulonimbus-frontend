<template>
  <h1>User Info</h1>
  <h2>View and manage this user.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/staff/users" />
  </div>

  <Online>
    <div class="content-box-container">
      <template v-if="!otherUser.loading">
        <template v-if="!otherUser.errored">
          <template v-if="otherUser.data">
            <ContentBox :title="otherUser.data.username" nowrap>
              <p>
                ID: <code>{{ otherUser.data.id }}</code>
              </p>
              <p>
                Email: <code>{{ otherUser.data.email }}</code>
              </p>
              <p>
                Verified:
                <code>{{
                  otherUser.data!.verifiedAt
                    ? toDateString(new Date(otherUser.data!.updatedAt))
                    : 'Not yet...'
                }}</code>
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
    <div
      class="content-box-container"
      v-if="
        online && otherUser.data && !otherUser.loading && !otherUser.errored
      "
    >
      <ContentBox
        title="Change Username"
        :src="gearIcon"
        theme-safe
        @click="changeUsernameModal!.show()"
      >
        <p>
          Change <code>{{ otherUser.data.username }}</code
          >'s username.
        </p>
      </ContentBox>
      <ContentBox
        title="Change Email"
        :src="gearIcon"
        theme-safe
        @click="changeEmailModal!.show()"
      >
        <p>
          Change <code>{{ otherUser.data.username }}</code
          >'s email.
        </p>
      </ContentBox>
      <ContentBox
        title="Toggle Verified Status"
        :src="gearIcon"
        theme-safe
        @click="changeVerifiedModal!.show()"
      >
        <p>
          Toggle <code>{{ otherUser.data.username }}</code
          >'s verified status.
        </p>
      </ContentBox>
      <ContentBox
        title="Change Password"
        :src="gearIcon"
        theme-safe
        @click="changePasswordModal!.show()"
      >
        <p>
          Change <code>{{ otherUser.data.username }}</code
          >'s password.
        </p>
      </ContentBox>
      <ContentBox
        title="Change Domain"
        :src="gearIcon"
        theme-safe
        @click="changeDomainModal!.show()"
      >
        <p>
          Change <code>{{ otherUser.data.username }}</code
          >'s domain.
        </p>
      </ContentBox>
      <ContentBox
        title="Change Staff Status"
        :src="gearIcon"
        theme-safe
        @click="changeStaffModal!.show()"
      >
        <p>
          Change <code>{{ otherUser.data.username }}</code
          >'s staff status.
        </p>
      </ContentBox>
      <ContentBox
        title="Change Ban Status"
        :src="gearIcon"
        theme-safe
        @click="changeBanModal!.show()"
      >
        <p>
          Change <code>{{ otherUser.data.username }}</code
          >'s ban status.
        </p>
      </ContentBox>
      <ContentBox
        title="Manage User Sessions"
        :src="gearIcon"
        theme-safe
        :to="`/staff/user/sessions?id=${otherUser.data.id}`"
      >
        <p>
          Manage <code>{{ otherUser.data.username }}</code
          >'s sessions.
        </p>
      </ContentBox>
      <ContentBox
        title="Sign User Out Everywhere"
        :src="gearIcon"
        theme-safe
        @click="signOutModal!.show()"
      >
        <p>
          Sign <code>{{ otherUser.data.username }}</code> out everywhere.
        </p>
      </ContentBox>
      <ContentBox
        title="Delete User Files"
        :src="gearIcon"
        theme-safe
        @click="deleteUserFilesModal!.show()"
      >
        <p>
          Delete <code>{{ otherUser.data.username }}</code
          >'s files.
        </p>
      </ContentBox>
      <ContentBox
        title="Delete User"
        :src="gearIcon"
        theme-safe
        @click="deleteUserModal!.show()"
      >
        <p>
          Delete <code>{{ otherUser.data.username }}</code
          >'s account.
        </p>
      </ContentBox>
      <ContentBox
        title="View User's Files"
        :src="fileIcon"
        theme-safe
        :to="`/staff/files?user=${otherUser.data.id}`"
      >
        <p>
          View <code>{{ otherUser.data.username }}</code
          >'s files.
        </p>
      </ContentBox>
    </div>
  </Online>
  <FormModal
    ref="changeUsernameModal"
    title="Change Username"
    @submit="updateUsername"
    :disabled="otherUser.loading"
  >
    <input
      type="text"
      placeholder="New Username"
      name="username"
      required
      autocomplete="off"
      :disabled="otherUser.loading"
    />
  </FormModal>
  <FormModal
    ref="changeEmailModal"
    title="Change Email"
    @submit="updateEmail"
    :disabled="otherUser.loading"
  >
    <input
      type="email"
      placeholder="New Email"
      name="email"
      required
      autocomplete="off"
      :disabled="otherUser.loading"
    />
  </FormModal>
  <ConfirmModal
    ref="changeVerifiedModal"
    title="Change Verified Status"
    @submit="updateVerified"
    :disabled="otherUser.loading"
  >
    <p>
      Are you sure you want to
      {{ otherUser.data?.verifiedAt ? 'unverify' : 'verify' }}
      <code>{{ otherUser.data?.username }}</code
      >?
    </p>
  </ConfirmModal>
  <FormModal
    ref="changePasswordModal"
    title="Change Password"
    @submit="updatePassword"
    :disabled="otherUser.loading"
  >
    <input
      type="password"
      placeholder="New Password"
      name="password"
      required
      autocomplete="off"
      :disabled="otherUser.loading"
    />
    <input
      type="password"
      placeholder="Confirm Password"
      name="confirm"
      required
      autocomplete="off"
      :disabled="otherUser.loading"
    />
  </FormModal>
  <DomainModal
    ref="changeDomainModal"
    @submit="updateDomain"
    :disabled="otherUser.loading"
    :domain="otherUser.data?.domain || ''"
    :subdomain="otherUser.data?.subdomain"
  />
  <ConfirmModal
    ref="changeStaffModal"
    title="Change Staff Status"
    @submit="updateStaff"
    :disabled="otherUser.loading"
  >
    <p>
      Are you sure you want to {{ otherUser.data?.staff ? 'revoke' : 'grant' }}
      <code>{{ otherUser.data?.username }}</code> staff status?
    </p>
  </ConfirmModal>
  <FormModal
    ref="changeBanModal"
    title="Change Ban Status"
    @submit="updateBan"
    :disabled="otherUser.loading"
  >
    <p>
      Are you sure you want to
      {{ otherUser.data?.bannedAt ? 'unban' : 'ban' }}
      <code>{{ otherUser.data?.username }}</code
      >?
    </p>
    <textarea
      v-if="!otherUser.data?.bannedAt"
      name="reason"
      placeholder="Provide your reasoning..."
      required
    />
  </FormModal>
  <ConfirmModal
    ref="signOutModal"
    title="Sign User Out Everywhere"
    @submit="signOut"
    :disabled="otherUser.loading"
  >
    <p>
      Are you sure you want to sign
      <code>{{ otherUser.data?.username }}</code> out everywhere?
    </p>
  </ConfirmModal>
  <ConfirmModal
    ref="deleteUserFilesModal"
    title="Delete User Files"
    @submit="deleteUserFiles"
    :disabled="otherUser.loading"
  >
    <p>
      Are you sure you want to delete <code>{{ otherUser.data?.username }}</code
      >'s files?
    </p>
  </ConfirmModal>
  <ConfirmModal
    ref="deleteUserModal"
    title="Delete User"
    @submit="deleteUser"
    :disabled="otherUser.loading"
  >
    <p>
      Are you sure you want to delete <code>{{ otherUser.data?.username }}</code
      >'s account?
    </p>
    <p>
      This will delete all of <code>{{ otherUser.data?.username }}</code
      >'s files and account.
    </p>
  </ConfirmModal>
</template>

<script lang="ts" setup>
  import ContentBox from '@/components/ContentBox.vue';
  import BackButton from '@/components/BackButton.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import FormModal from '@/components/FormModal.vue';
  import DomainModal from '@/components/DomainModal.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import Online from '@/components/Online.vue';
  import { useRouter } from 'vue-router';
  import { useOnline } from '@vueuse/core';
  import { toastStore } from '@/stores/toast';
  import { usersStore } from '@/stores/staff-space/users';
  import { otherUserStore } from '@/stores/staff-space/user';
  import { ref, onMounted, watch } from 'vue';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import backWithFallback from '@/utils/routerBackWithFallback';
  import toDateString from '@/utils/toDateString';
  import gearIcon from '@/assets/images/gear.svg';
  import fileIcon from '@/assets/images/file.svg';
  import defaultErrorHandler from '@/utils/defaultErrorHandler';

  const users = usersStore(),
    otherUser = otherUserStore(),
    router = useRouter(),
    toast = toastStore(),
    online = useOnline(),
    changeUsernameModal = ref<typeof FormModal>(),
    changeEmailModal = ref<typeof FormModal>(),
    changeVerifiedModal = ref<typeof ConfirmModal>(),
    changePasswordModal = ref<typeof FormModal>(),
    changeDomainModal = ref<typeof DomainModal>(),
    changeStaffModal = ref<typeof ConfirmModal>(),
    changeBanModal = ref<typeof FormModal>(),
    signOutModal = ref<typeof ConfirmModal>(),
    deleteUserFilesModal = ref<typeof ConfirmModal>(),
    deleteUserModal = ref<typeof ConfirmModal>();

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
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await otherUser.getUser(
        router.currentRoute.value.query.id as string,
      );
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          switch (status.code) {
            case 'INVALID_USER_ERROR':
              toast.show('This user does not exist.');
              backWithFallback(router, '/staff/users', true);
          }
        }
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function updateUsername(data: { username: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await otherUser.updateUsername(data.username);
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          switch (status.code) {
            case 'INVALID_USER_ERROR':
              toast.show('This user does not exist.');
              backWithFallback(router, '/staff/users', true);
          }
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Username updated.');
        changeUsernameModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function updateEmail(data: { email: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await otherUser.updateEmail(data.email);
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          switch (status.code) {
            case 'INVALID_USER_ERROR':
              toast.show('This user does not exist.');
              backWithFallback(router, '/staff/users', true);
          }
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Email updated.');
        changeEmailModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function updateVerified(choice: boolean) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    if (!choice) {
      changeVerifiedModal.value!.hide();
      return;
    }
    try {
      const status = otherUser.data?.verifiedAt
        ? await otherUser.unverifyEmail()
        : await otherUser.verifyEmail();
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          switch (status.code) {
            case 'EMAIL_ALREADY_VERIFIED_ERROR':
              toast.show('This email is already verified.');
              break;
            case 'EMAIL_NOT_VERIFIED_ERROR':
              toast.show('This email is not verified.');
              break;
            case 'INVALID_USER_ERROR':
              toast.show('This user does not exist.');
              backWithFallback(router, '/staff/users', true);
          }
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Verified status updated.');
        changeVerifiedModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function updatePassword(data: { password: string; confirm: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await otherUser.updatePassword(
        data.password,
        data.confirm,
      );
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          switch (status.code) {
            case 'INVALID_USER_ERROR':
              toast.show('This user does not exist.');
              backWithFallback(router, '/staff/users', true);
          }
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Password updated.');
        changePasswordModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function updateDomain(data: { domain: string; subdomain?: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await otherUser.updateDomain(data.domain, data.subdomain);
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          switch (status.code) {
            case 'INVALID_USER_ERROR':
              toast.show('This user does not exist.');
              backWithFallback(router, '/staff/users', true);
              break;
            case 'INVALID_DOMAIN_ERROR':
              toast.show('You just missed that domain.');
              changeDomainModal.value!.reloadDomains();
              break;
            case 'SUBDOMAIN_NOT_ALLOWED_ERROR':
              toast.show('Subdomains are not supported.');
              break;
            case 'SUBDOMAIN_TOO_LONG_ERROR':
              toast.show('Subdomain cannot be longer than 63 characters.');
              break;
          }
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Domain updated.');
        changeDomainModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function updateStaff(choice: boolean) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    if (!choice) {
      changeStaffModal.value!.hide();
      return;
    }
    try {
      const status = otherUser.data?.staff
        ? await otherUser.revokeStaff()
        : await otherUser.grantStaff();
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          switch (status.code) {
            case 'INVALID_USER_ERROR':
              toast.show('This user does not exist.');
              backWithFallback(router, '/staff/users', true);
          }
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Staff updated.');
        changeStaffModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function updateBan(data: { reason: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = otherUser.data?.bannedAt
        ? await otherUser.unbanUser()
        : await otherUser.banUser(data.reason);
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          switch (status.code) {
            case 'INVALID_USER_ERROR':
              toast.show('This user does not exist.');
              backWithFallback(router, '/staff/users', true);
          }
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Banned updated.');
        changeBanModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function signOut(choice: boolean) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    if (!choice) {
      signOutModal.value!.hide();
      return;
    }
    try {
      const status = await otherUser.deleteAllSessions();
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          switch (status.code) {
            case 'INVALID_USER_ERROR':
              toast.show('This user does not exist.');
              backWithFallback(router, '/staff/users', true);
          }
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Signed out.');
        signOutModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function deleteUserFiles(choice: boolean) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    if (!choice) {
      deleteUserFilesModal.value!.hide();
      return;
    }
    try {
      const status = await otherUser.deleteAllFiles();
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          switch (status.code) {
            case 'INVALID_USER_ERROR':
              toast.show('This user does not exist.');
              backWithFallback(router, '/staff/users', true);
          }
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('Files deleted.');
        deleteUserFilesModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function deleteUser(choice: boolean) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    if (!choice) {
      deleteUserModal.value!.hide();
      return;
    }
    try {
      const status = await otherUser.deleteUser();
      if (status instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(status, router);
        if (!handled) {
          switch (status.code) {
            case 'INVALID_USER_ERROR':
              toast.show('This user does not exist.');
              backWithFallback(router, '/staff/users', true);
          }
        }
      } else if (!status) {
        toast.clientError();
      } else {
        toast.show('User deleted.');
        otherUser.data = null;
        await deleteUserModal.value!.hide();
        await users.getUsers(users.page);
        await backWithFallback(router, '/staff/users', true);
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }
</script>
