<template>
  <h1>User Info</h1>
  <h2>View and manage this user.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/staff/users" />
  </div>

  <Online>
    <template v-if="!!otherUser && !otherUser.loading && !!otherUser.data">
      <template v-if="!otherUser.errored">
        <div class="content-box-container">
          <ContentBox
            :title="otherUser.data.username"
            nowrap
            theme-safe
            :src="profileIcon"
          >
            <span class="sb-code-label">
              <p>ID:</p>
              <code v-text="otherUser.data.id" />
            </span>
            <span class="sb-code-label">
              <p>Email:</p>
              <code v-text="otherUser.data.email" />
            </span>
            <span class="sb-code-label">
              <p>Verified:</p>
              <code
                v-text="otherUser.data!.verifiedAt
                    ? toDateString(new Date(otherUser.data!.verifiedAt))
                    : 'Not yet...'"
              />
            </span>
            <span class="sb-code-label">
              <p>Domain:</p>
              <code v-text="domain" />
            </span>
            <span class="sb-code-label">
              <p>Created:</p>
              <code v-text="toDateString(new Date(otherUser.data.createdAt))" />
            </span>
            <span class="sb-code-label">
              <p>Updated:</p>
              <code v-text="toDateString(new Date(otherUser.data.updatedAt))" />
            </span>
            <span class="sb-code-label">
              <p>Banned:</p>
              <code
                v-text="otherUser.data!.bannedAt
                    ? toDateString(new Date(otherUser.data!.bannedAt))
                    : 'Not yet...'"
              />
            </span>
            <span class="sb-code-label">
              <p>Staff:</p>
              <code v-text="otherUser.data.staff ? 'Yes' : 'No'" />
            </span>
          </ContentBox>
        </div>
        <Separator />
        <h1 title="These actions require no additional verification from you.">
          Quick Settings
        </h1>
        <div class="content-box-container">
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
          <ContentBox
            v-if="!otherUser.data!.verifiedAt"
            title="Resend Verification Email"
            :src="gearIcon"
            theme-safe
            @click="resendVerificationEmailModal!.show()"
          >
            <p>
              Resend <code>{{ otherUser.data.username }}</code> a verification
              email.
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
        </div>
        <Separator />
        <h1 title="These actions require your password for verification.">
          Account Management
        </h1>
        <div class="content-box-container">
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
            title="Manage User Second Factors"
            :src="gearIcon"
            theme-safe
            :to="`/staff/user/second-factors?id=${otherUser.data.id}`"
          >
            <p>
              Manage <code>{{ otherUser.data.username }}</code
              >'s second factors.
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
        </div>
        <Separator />
        <h1 title="These actions can permanently delete user data, be careful!">
          Danger Zone
        </h1>
        <div class="content-box-container">
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
        </div>
      </template>
      <div v-else>
        <h1>Something went wrong.</h1>
        <button @click="fetchUser">Retry</button>
      </div>
    </template>
    <LoadingMessage spinner v-else />
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
    <br />
    <input
      hidden
      type="text"
      autocomplete="username"
      disabled
      :value="user.account!.user.username"
    />
    <input
      type="password"
      placeholder="Your Password"
      name="password"
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
    <br />
    <input
      hidden
      type="text"
      autocomplete="username"
      disabled
      :value="user.account!.user.username"
    />
    <input
      type="password"
      placeholder="Your Password"
      name="password"
      required
      autocomplete="off"
      :disabled="otherUser.loading"
    />
  </FormModal>
  <FormModal
    ref="changeVerifiedModal"
    title="Change Verified Status"
    @submit="updateVerified"
    :disabled="otherUser.loading"
  >
    <p>
      Are you sure you want to
      {{ otherUser.data?.verifiedAt ? 'unverify' : 'verify' }}
      <code v-text="otherUser.data?.username" />'s email?
    </p>
    <br />
    <input
      hidden
      type="text"
      autocomplete="username"
      disabled
      :value="user.account!.user.username"
    />
    <input
      type="password"
      placeholder="Your Password"
      name="password"
      required
      autocomplete="off"
      :disabled="otherUser.loading"
    />
  </FormModal>
  <ConfirmModal
    ref="resendVerificationEmailModal"
    title="Resend Verification Email"
    @submit="resendVerificationEmail"
    :disabled="otherUser.loading"
  >
    <p>
      Are you sure you want to send a verification email to
      <code v-text="otherUser.data?.username" />?
    </p>
    <p>If they have already requested one, it will be invalidated.</p>
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
      name="newPassword"
      required
      autocomplete="off"
      :disabled="otherUser.loading"
    />
    <br />
    <input
      type="password"
      placeholder="Confirm Password"
      name="confirmNewPassword"
      required
      autocomplete="off"
      :disabled="otherUser.loading"
    />
    <br />
    <input
      hidden
      type="text"
      autocomplete="username"
      disabled
      :value="user.account!.user.username"
    />
    <input
      type="password"
      placeholder="Your Password"
      name="password"
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
  <FormModal
    ref="changeStaffModal"
    title="Change Staff Status"
    @submit="updateStaff"
    :disabled="otherUser.loading"
  >
    <p>
      Are you sure you want to {{ otherUser.data?.staff ? 'revoke' : 'grant' }}
      <code v-text="otherUser.data?.username" /> staff status?
    </p>
    <br />
    <input
      hidden
      type="text"
      autocomplete="username"
      disabled
      :value="user.account!.user.username"
    />
    <input
      type="password"
      placeholder="Your Password"
      name="password"
      required
      autocomplete="off"
      :disabled="otherUser.loading"
    />
  </FormModal>
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
    <br v-if="!otherUser.data?.bannedAt" />
    <input
      hidden
      type="text"
      autocomplete="username"
      disabled
      :value="user.account!.user.username"
    />
    <input
      type="password"
      placeholder="Your Password"
      name="password"
      required
      autocomplete="off"
      :disabled="otherUser.loading"
    />
  </FormModal>
  <FormModal
    ref="signOutModal"
    title="Sign User Out Everywhere"
    @submit="signOut"
    :disabled="otherUser.loading"
  >
    <p>
      Are you sure you want to sign
      <code v-text="otherUser.data?.username" /> out everywhere?
    </p>
    <br />
    <input
      hidden
      type="text"
      autocomplete="username"
      disabled
      :value="user.account!.user.username"
    />
    <input
      type="password"
      placeholder="Your Password"
      name="password"
      required
      autocomplete="off"
      :disabled="otherUser.loading"
    />
  </FormModal>
  <FormModal
    ref="deleteUserFilesModal"
    title="Delete User Files"
    @submit="deleteUserFiles"
    :disabled="otherUser.loading"
  >
    <p>
      Are you sure you want to delete
      <code v-text="otherUser.data?.username" />'s files?
    </p>
    <br />
    <input
      hidden
      type="text"
      autocomplete="username"
      disabled
      :value="user.account!.user.username"
    />
    <input
      type="password"
      placeholder="Your Password"
      name="password"
      required
      autocomplete="off"
      :disabled="otherUser.loading"
    />
  </FormModal>
  <FormModal
    ref="deleteUserModal"
    title="Delete User"
    @submit="deleteUser"
    :disabled="otherUser.loading"
  >
    <p>
      Are you sure you want to delete
      <code v-text="otherUser.data?.username" />'s account?
    </p>
    <p>
      This will delete all of <code v-text="otherUser.data?.username" />'s files
      and account.
    </p>
    <br />
    <input
      hidden
      type="text"
      autocomplete="username"
      disabled
      :value="user.account!.user.username"
    />
    <input
      type="password"
      placeholder="Your Password"
      name="password"
      required
      autocomplete="off"
      :disabled="otherUser.loading"
    />
  </FormModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import DomainModal from '@/components/DomainModal.vue';
  import FormModal from '@/components/FormModal.vue';
  import LoadingMessage from '@/components/LoadingMessage.vue';
  import Online from '@/components/Online.vue';
  import Separator from '@/components/Separator.vue';

  // In-House Modules
  import backWithFallback from '@/utils/routerBackWithFallback.js';
  import profileIcon from '@/assets/images/profile.svg';
  import fileIcon from '@/assets/images/file.svg';
  import gearIcon from '@/assets/images/gear.svg';
  import toDateString from '@/utils/toDateString.js';
  import loadWhenOnline from '@/utils/loadWhenOnline.js';

  // Store Modules
  import { userStore } from '@/stores/user.js';
  import { otherUserStore } from '@/stores/staff-space/user.js';
  import { toastStore } from '@/stores/toast.js';
  import { usersStore } from '@/stores/staff-space/users.js';

  // External Modules
  import { ref, computed, onMounted } from 'vue';
  import { useOnline } from '@/utils/ConnectivityCheck.js';
  import { useRouter } from 'vue-router';

  const user = userStore(),
    users = usersStore(),
    otherUser = otherUserStore(),
    router = useRouter(),
    toast = toastStore(),
    online = useOnline(),
    changeUsernameModal = ref<InstanceType<typeof FormModal>>(),
    changeEmailModal = ref<InstanceType<typeof FormModal>>(),
    changeVerifiedModal = ref<InstanceType<typeof FormModal>>(),
    resendVerificationEmailModal = ref<InstanceType<typeof ConfirmModal>>(),
    changePasswordModal = ref<InstanceType<typeof FormModal>>(),
    changeDomainModal = ref<InstanceType<typeof DomainModal>>(),
    changeStaffModal = ref<InstanceType<typeof FormModal>>(),
    changeBanModal = ref<InstanceType<typeof FormModal>>(),
    signOutModal = ref<InstanceType<typeof ConfirmModal>>(),
    deleteUserFilesModal = ref<InstanceType<typeof FormModal>>(),
    deleteUserModal = ref<InstanceType<typeof FormModal>>();

  const domain = computed(() =>
    otherUser.data
      ? otherUser.data.subdomain
        ? `${otherUser.data.subdomain}.${otherUser.data.domain}`
        : otherUser.data.domain
      : '',
  );

  onMounted(async () =>
    loadWhenOnline(
      fetchUser,
      !otherUser.data ||
        otherUser.data.id !== router.currentRoute.value.query.id,
    ),
  );

  async function fetchUser() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      await otherUser.getUser(router.currentRoute.value.query.id as string);
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function updateUsername({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await otherUser.updateUsername(username, password);
      if (status) {
        toast.show('Username updated.');
        changeUsernameModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function updateEmail({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await otherUser.updateEmail(email, password);
      if (status) {
        toast.show('Email updated.');
        changeEmailModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function updateVerified({ password }: { password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = otherUser.data?.verifiedAt
        ? await otherUser.unverifyEmail(password)
        : await otherUser.verifyEmail(password);
      if (status) {
        toast.show('Verified status updated.');
        changeVerifiedModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function resendVerificationEmail(choice: boolean) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    if (!choice) {
      resendVerificationEmailModal.value!.hide();
      return;
    }
    try {
      const status = await otherUser.resendVerificationEmail();
      if (status) {
        toast.show('Verification email sent.');
        resendVerificationEmailModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function updatePassword({
    password,
    newPassword,
    confirmNewPassword,
  }: {
    password: string;
    newPassword: string;
    confirmNewPassword: string;
  }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await otherUser.updatePassword(
        password,
        newPassword,
        confirmNewPassword,
      );
      if (status) {
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
      if (status) {
        toast.show('Domain updated.');
        changeDomainModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function updateStaff({ password }: { password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = otherUser.data?.staff
        ? await otherUser.revokeStaff(password)
        : await otherUser.grantStaff(password);
      if (status) {
        toast.show(
          `Staff status ${otherUser.data?.staff ? 'granted' : 'revoked'}.`,
        );
        changeStaffModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function updateBan({
    reason,
    password,
  }: {
    reason: string;
    password: string;
  }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = otherUser.data?.bannedAt
        ? await otherUser.unbanUser(password)
        : await otherUser.banUser(reason, password);
      if (status) {
        toast.show(`${otherUser.data?.bannedAt ? 'Banned' : 'Unbanned'} user.`);
        changeBanModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function signOut({ password }: { password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await otherUser.deleteAllSessions(password);
      if (status > -1) {
        toast.show(`Signed out ${status} session${status === 1 ? '' : 's'}.`);
        signOutModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function deleteUserFiles({ password }: { password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await otherUser.deleteAllFiles(password);
      if (status > -1) {
        toast.show(`Deleted ${status} file${status === 1 ? '' : 's'}.`);
        deleteUserFilesModal.value!.hide();
      }
    } catch (error) {
      toast.clientError();
      console.error(error);
    }
  }

  async function deleteUser({ password }: { password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const status = await otherUser.deleteUser(password);
      if (status) {
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
