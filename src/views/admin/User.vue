<template>
  <h1>User Information</h1>
  <h2>Here's everything we know about this person.</h2>
  <div class="quick-action-buttons-container">
    <button
      @click="
        $store.commit('setAdminSelectedUserID', null);
        $router.push('/admin/users');
      "
      title="Back to cool town resident directory."
      >Back</button
    >
  </div>

  <div v-if="!$data.loading" class="content-box-group-container">
    <ContentBox :title="$data.user?.displayName" class="profile" selectable>
      <p>
        Username:
        <code v-text="$data.user?.username" />
      </p>
      <p>
        User ID:
        <code v-text="$data.user?.id" />
      </p>
      <p>
        Email:
        <code v-text="$data.user?.email" />
      </p>
      <p>
        Domain Selection:
        <code
          v-text="
            `${$data.user?.subdomain ? `${$data.user?.subdomain}.` : ''}${
              $data.user?.domain
            }`
          "
        />
      </p>
      <p>
        Created at:
        <code
          v-text="
            ($parent?.$parent as any).toDateString(
              new Date($data.user?.createdAt as string)
            )
          "
        />
      </p>
      <p>
        Updated at:
        <code
          v-text="
            ($parent?.$parent as any).toDateString(new Date($data.user?.updatedAt as string))
          "
        />
      </p>
      <p>
        Banned at:

        <code
          v-if="$data.user?.bannedAt"
          v-text="
            ($parent?.$parent as any).toDateString(new Date($data.user?.bannedAt as string))
          "
        />
        <code v-else>Not yet...</code>
      </p>
      <p>
        Staff:
        <code v-text="$data.user?.staff ? 'Yes' : 'No'" />
      </p>
    </ContentBox>
    <ContentBox
      title="Change Username"
      @click="$refs.changeUsernameModal.show()"
      span
      src="/assets/images/gear.svg"
      theme-safe
    >
      <p>Change the user's username.</p>
    </ContentBox>
    <ContentBox
      title="Change Email"
      @click="$refs.changeEmailModal.show()"
      span
      src="/assets/images/gear.svg"
      theme-safe
    >
      <p>Change the user's email.</p>
    </ContentBox>
    <ContentBox
      title="Change Password"
      @click="$refs.changePasswordModal.show()"
      span
      src="/assets/images/gear.svg"
      theme-safe
    >
      <p>Change the user's password.</p>
    </ContentBox>
    <ContentBox
      title="Change Domain"
      @click="$refs.changeDomainModal.show()"
      span
      src="/assets/images/gear.svg"
      theme-safe
    >
      <p>Change the user's domain.</p>
    </ContentBox>
    <ContentBox
      title="Ban/Unban User"
      @click="$refs.banUserModal.show()"
      span
      src="/assets/images/gear.svg"
      theme-safe
    >
      <p>Ban/Unban the user.</p>
    </ContentBox>
    <ContentBox
      title="Delete User"
      @click="$refs.deleteUserModal.show()"
      span
      src="/assets/images/gear.svg"
      theme-safe
    >
      <p>Delete the user.</p>
    </ContentBox>
    <ContentBox
      title="Delete User's Content"
      @click="$refs.deleteUserContentModal.show()"
      span
      src="/assets/images/gear.svg"
      theme-safe
    >
      <p>Delete the user's content.</p>
    </ContentBox>
    <ContentBox
      title="Manage user's sessions"
      :to="{ path: '/admin/user-sessions', query: { uid: $data.user?.id } }"
      span
      src="/assets/images/gear.svg"
      theme-safe
    >
      <p>Manage the user's sessions.</p>
    </ContentBox>
    <ContentBox
      title="Clear all user sessions"
      @click="$refs.clearUserSessionsModal.show()"
      span
      src="/assets/images/gear.svg"
      theme-safe
    >
      <p>Clear all the user's sessions.</p>
    </ContentBox>
    <ContentBox
      title="View User's Content"
      :to="{ path: '/admin/files', query: { uid: $data.user?.id } }"
      span
      @click="$store.commit('setAdminSelectedUserID', $data.user?.id)"
      src="/assets/images/file.svg"
      theme-safe
    >
      <p>View the user's content.</p>
    </ContentBox>
  </div>
  <Loading v-else />
  <FormModal
    ref="changeUsernameModal"
    cancelable
    deny-closes-modal
    @confirm="updateUsername"
    title="Change Username"
    deny-resets-form
    confirm-resets-form
  >
    <input
      name="username"
      placeholder="New Username"
      autocomplete="off"
      autofocus
    />
  </FormModal>
  <FormModal
    ref="changeEmailModal"
    cancelable
    deny-closes-modal
    @confirm="updateEmail"
    title="Change Email"
    deny-resets-form
    confirm-resets-form
  >
    <input name="email" placeholder="New Email" autocomplete="off" autofocus />
  </FormModal>
  <FormModal
    ref="changePasswordModal"
    cancelable
    deny-closes-modal
    @confirm="updatePassword"
    title="Change Password"
    deny-resets-form
    confirm-resets-form
  >
    <input
      name="password"
      placeholder="New Password"
      autocomplete="new-password"
      autofocus
    />
    <br />
    <input
      name="passwordConfirm"
      placeholder="Confirm New Password"
      autocomplete="new-password"
    />
  </FormModal>
  <DomainModal
    ref="changeDomainModal"
    @confirm="updateDomain"
    @error="updateDomainError"
    title="Change Domain"
    :domain="$data.user?.domain"
    :subdomain="$data.user?.subdomain"
  />
  <ConfirmModal
    cancelable
    ref="banUserModal"
    @confirm="banUser"
    deny-closes-modal
    title="Ban/Unban User"
  >
    <p> Are you sure you want to ban/unban this user? </p>
  </ConfirmModal>
  <ConfirmModal
    cancelable
    ref="deleteUserModal"
    @confirm="deleteUser"
    deny-closes-modal
    title="Delete User"
  >
    <p> Are you sure you want to delete this user? </p>
    <br />
    <p>
      <strong>
        This action is irreversible and will delete all of this user's content.
      </strong>
    </p>
  </ConfirmModal>

  <ConfirmModal
    cancelable
    ref="deleteUserContentModal"
    @confirm="deleteUserContent"
    deny-closes-modal
    title="Delete User's Content"
  >
    <p> Are you sure you want to delete this user's content? </p>
    <br />
    <p>
      <strong> This action is irreversible. </strong>
    </p>
  </ConfirmModal>

  <ConfirmModal
    cancelable
    ref="clearUserSessionsModal"
    @confirm="clearUserSessions"
    deny-closes-modal
    title="Clear All User Sessions"
  >
    <p> Are you sure you want to clear all of this user's sessions? </p>
  </ConfirmModal>

  <FullscreenLoading ref="fullscreenLoading" />
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { Client, Cumulonimbus } from '../../../../cumulonimbus-wrapper';
  import Loading from '@/components/Loading.vue';
  import FullscreenLoading from '@/components/FullscreenLoading.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import FormModal from '@/components/FormModal.vue';
  import DomainModal from '@/components/DomainModal.vue';
  import App from '@/App.vue';

  @Options({
    components: {
      Loading,
      FullscreenLoading,
      ContentBox,
      ConfirmModal,
      DomainModal,
      FormModal
    },
    data() {
      return {
        loading: true,
        user: null,
        domains: [],
        subdomainCompatible: false
      };
    },
    title: 'User Information'
  })
  export default class UserInformation extends Vue {
    declare $data: {
      loading: boolean;
      user: Cumulonimbus.Data.User;
    };

    declare $refs: {
      changeUsernameModal: FormModal;
      changeEmailModal: FormModal;
      changePasswordModal: FormModal;
      changeDomainModal: DomainModal;
      banUserModal: ConfirmModal;
      deleteUserModal: ConfirmModal;
      deleteUserContentModal: ConfirmModal;
      clearUserSessionsModal: ConfirmModal;
      fullscreenLoading: FullscreenLoading;
    };

    async mounted() {
      if (!navigator.onLine) {
        (this.$parent?.$parent as App).temporaryToast(
          "Looks like you're offline, I'm pretty useless offline. Without the internet I cannot do the things you requested me to. I don't know what anything is without the internet. I wish i had the internet so I could browse TikTok. Please give me access to TikTok.",
          15000
        );
        return;
      }

      if (!(await (this.$parent?.$parent as App).isStaff())) {
        this.$router.replace('/');
      }

      await (this.$parent?.$parent as App).isLoggedIn();
      await this.getUser();
    }

    async getUser() {
      try {
        this.$data.loading = true;
        this.$data.user = await (
          this.$store.state.client as Client
        ).getUserByID(this.$route.query.uid as string);
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'This user does not exist.',
                5000
              );
              this.$router.replace('/admin/users');
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(error);
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
          );
          console.error(error);
        }
      } finally {
        this.$data.loading = false;
      }
    }

    async updateUsername(payload: { username: string }) {
      try {
        this.$data.loading = true;
        this.$data.user = await (
          this.$store.state.client as Client
        ).editUserByID(this.$data.user.id, payload);
        this.$refs.changeUsernameModal.hide();
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'This user does not exist.',
                5000
              );
              this.$router.replace('/admin/users');
              break;
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'This username is invalid.',
                5000
              );
              break;
            case 'USER_EXISTS_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'There is already a user with that username.',
                5000
              );
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(error);
              break;
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
          );
          console.error(error);
        }
      } finally {
        this.$data.loading = false;
      }
    }

    async updateEmail(payload: { email: string }) {
      try {
        this.$data.loading = true;
        this.$data.user = await (
          this.$store.state.client as Client
        ).editUserByID(this.$data.user.id, payload);
        this.$refs.changeEmailModal.hide();
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'This user does not exist.',
                5000
              );
              this.$router.replace('/admin/users');
              break;
            case 'USER_EXISTS_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'There is already a user with that email.',
                5000
              );
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(error);
              break;
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
          );
          console.error(error);
        }
      } finally {
        this.$data.loading = false;
      }
    }

    async updatePassword(payload: {
      password: string;
      passwordConfirm: string;
    }) {
      try {
        if (payload.password !== payload.passwordConfirm) {
          (this.$parent?.$parent as App).temporaryToast(
            'The passwords do not match.',
            5000
          );
          return;
        }
        this.$data.loading = true;
        this.$data.user = await (
          this.$store.state.client as Client
        ).editUserByID(this.$data.user.id, payload);
        this.$refs.changePasswordModal.hide();
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'This user does not exist.',
                5000
              );
              this.$router.replace('/admin/users');
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(error);
              break;
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
          );
          console.error(error);
        }
      } finally {
        this.$data.loading = false;
      }
    }

    async updateDomain(payload: { domain: string; subdomain: string | null }) {
      try {
        this.$data.loading = true;
        this.$data.user = await (
          this.$store.state.client as Client
        ).editUserDomain(this.$data.user.id, payload.domain, payload.subdomain);
        this.$refs.changeDomainModal.hide();
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'This user does not exist.',
                5000
              );
              this.$router.replace('/admin/users');
              break;
            case 'INVALID_DOMAIN_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The domain is invalid.',
                5000
              );
              break;
            case 'SUBDOMAIN_NOT_SUPPORTED_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'Subdomains are not supported.',
                5000
              );
              break;
            case 'INVALID_SUBDOMAIN_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The subdomain is invalid.',
                5000
              );
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(error);
              break;
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
          );
          console.error(error);
        }
      } finally {
        this.$data.loading = false;
      }
    }

    updateDomainError(error: Error) {
      if (error instanceof Cumulonimbus.ResponseError) {
        switch (error.code) {
          case 'RATELIMITED_ERROR':
            (this.$parent?.$parent as App).ratelimitToast(
              error.ratelimit.resetsAt
            );
            break;
          case 'INVALID_SESSION_ERROR':
            (this.$parent?.$parent as App).handleInvalidSession();
            break;
          case 'BANNED_ERROR':
            (this.$parent?.$parent as App).handleBannedUser();
            break;
          case 'INTERNAL_ERROR':
            (this.$parent?.$parent as App).temporaryToast(
              'The server did something weird, lets try again later.',
              5000
            );
            break;
          default:
            (this.$parent?.$parent as App).temporaryToast(
              'I did something weird, lets try again later.',
              5000
            );
            console.error(error);
            break;
        }
      } else {
        (this.$parent?.$parent as App).temporaryToast(
          'I did something weird, lets try again later.',
          5000
        );
        console.error(error);
      }
    }

    async banUser() {
      try {
        this.$data.loading = true;
        this.$refs.banUserModal.hide();
        this.$data.user = await (
          this.$store.state.client as Client
        ).toggleUserBan(this.$data.user.id);
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'This user does not exist.',
                5000
              );
              this.$router.replace('/admin/users');
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(error);
              break;
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
          );
          console.error(error);
        }
      } finally {
        this.$data.loading = false;
      }
    }

    async deleteUser() {
      try {
        this.$refs.fullscreenLoading.show();
        this.$refs.deleteUserModal.hide();
        await (this.$store.state.client as Client).deleteUserByID(
          this.$data.user.id
        );
        (this.$parent?.$parent as App).temporaryToast('User deleted.', 5000);
        this.$router.replace('/admin/users');
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'This user does not exist.',
                5000
              );
              this.$router.replace('/admin/users');
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(error);
              break;
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
          );
          console.error(error);
        }
      } finally {
        this.$refs.fullscreenLoading.hide();
      }
    }

    async deleteUserContent() {
      try {
        this.$refs.fullscreenLoading.show();
        this.$refs.deleteUserContentModal.hide();
        await (this.$store.state.client as Client).bulkDeleteAllUserFiles(
          this.$data.user.id
        );
        (this.$parent?.$parent as App).temporaryToast(
          'User content deleted.',
          5000
        );
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'This user does not exist.',
                5000
              );
              this.$router.replace('/admin/users');
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(error);
              break;
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
          );
          console.error(error);
        }
      } finally {
        this.$refs.fullscreenLoading.hide();
      }
    }

    async clearUserSessions() {
      try {
        this.$refs.fullscreenLoading.show();
        this.$refs.clearUserSessionsModal.hide();
        await (this.$store.state.client as Client).bulkDeleteUserSessions(
          this.$data.user.id
        );
        (this.$parent?.$parent as App).temporaryToast(
          'User sessions cleared.',
          5000
        );
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          switch (error.code) {
            case 'RATELIMITED_ERROR':
              (this.$parent?.$parent as App).ratelimitToast(
                error.ratelimit.resetsAt
              );
              break;
            case 'INVALID_SESSION_ERROR':
              (this.$parent?.$parent as App).handleInvalidSession();
              break;
            case 'PERMISSIONS_ERROR':
              this.$router.replace('/');
              break;
            case 'BANNED_ERROR':
              (this.$parent?.$parent as App).handleBannedUser();
              break;
            case 'INVALID_USER_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'This user does not exist.',
                5000
              );
              this.$router.replace('/admin/users');
              break;
            case 'INTERNAL_ERROR':
              (this.$parent?.$parent as App).temporaryToast(
                'The server did something weird, lets try again later.',
                5000
              );
              break;
            default:
              (this.$parent?.$parent as App).temporaryToast(
                'I did something weird, lets try again later.',
                5000
              );
              console.error(error);
              break;
          }
        } else {
          (this.$parent?.$parent as App).temporaryToast(
            'I did something weird, lets try again later.',
            5000
          );
          console.error(error);
        }
      } finally {
        this.$refs.fullscreenLoading.hide();
      }
    }
  }
</script>

<style>
  .content-box.profile {
    width: calc((100% - (25px * 2 + 20px * 2 + 1px * 2) * 1) / 1);
  }
</style>
