<template>
  <h1>Switch Accounts</h1>
  <h2>Have multiple accounts you need to keep track of? You can do it here.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/">Back</BackButton>
    <button
      v-if="!managingAccounts"
      @click="managingAccounts = true"
      :disabled="user.loading || !online"
    >
      Remove Accounts
    </button>
    <button v-else @click="managingAccounts = false" :disabled="user.loading">
      Done
    </button>
    <button
      v-if="managingAccounts"
      @click="removeAllAccountsModal?.show()"
      :disabled="user.loading || !online"
    >
      Remove All Accounts
    </button>
  </div>
  <Online>
    <EmphasizedBox :no-padding="!user.loading">
      <div v-if="!user.loading" class="account-switcher-accounts">
        <div
          :class="`account-switcher-account${user.loading ? ' disabled' : ''}`"
          v-for="(token, account) in user.accounts"
          @click="handleAccountClick(account as string)"
        >
          <img
            v-if="!managingAccounts"
            :src="profileIcon"
            alt="Generic account icon"
          />
          <img v-else :src="closeIcon" alt="Delete account icon" />
          <p v-text="account" />
          <p
            v-if="user.account?.user.username === account && !managingAccounts"
          >
            Currently logged in.
          </p>
          <p v-if="token === false && !managingAccounts">Not logged in.</p>
          <p v-if="managingAccounts">Click to remove this account.</p>
        </div>
        <div
          v-if="Object.keys(user.accounts).length < 1"
          class="account-switcher-account"
        >
          <img :src="profileIcon" alt="Generic account icon" />
          <p>Nobody here but us chickens!</p>
          <p>Click the "Add Account" button to add an account.</p>
        </div>
        <div
          v-if="!managingAccounts"
          :class="`account-switcher-account${user.loading ? ' disabled' : ''}`"
          @click="addAccount"
        >
          <img :src="plusIcon" alt="Plus icon" />
          <p>Add Account</p>
          <p>Add another account.</p>
        </div>
      </div>
      <LoadingBlurb v-else />
    </EmphasizedBox>
  </Online>
  <ConfirmModal
    title="Remove All Accounts"
    ref="removeAllAccountsModal"
    @submit="removeAllAccountsConfirm"
    :disabled="user.loading"
  >
    <p>Are you sure you want to remove all accounts?</p>
    <p>You'll have to enter your username and password again.</p>
  </ConfirmModal>
  <ConfirmModal
    title="Remove Account"
    ref="removeAccountModal"
    @submit="removeAccountConfirm"
    :disabled="user.loading"
  >
    <p>
      Are you sure you want to remove the account
      <code v-text="selectedAccount" />?
    </p>
    <p>You'll have to enter your username and password again.</p>
  </ConfirmModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import EmphasizedBox from '@/components/EmphasizedBox.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import Online from '@/components/Online.vue';

  // In-House Modules
  import closeIcon from '@/assets/images/close.svg';
  import plusIcon from '@/assets/images/plus.svg';
  import profileIcon from '@/assets/images/profile.svg';

  // Store Modules
  import { fileStore } from '@/stores/user-space/file';
  import { filesStore } from '@/stores/user-space/files';
  import { sessionsStore } from '@/stores/user-space/sessions';
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';

  // External Modules
  import { ref, onBeforeMount, computed } from 'vue';
  import { useOnline } from '@vueuse/core';
  import { useRouter } from 'vue-router';

  const user = userStore(),
    router = useRouter(),
    toast = toastStore(),
    online = useOnline(),
    file = fileStore(),
    files = filesStore(),
    sessions = sessionsStore(),
    managingAccounts = ref(false),
    selectedAccount = ref<string | null>(null),
    removeAllAccountsModal = ref<typeof ConfirmModal>(),
    removeAccountModal = ref<typeof ConfirmModal>(),
    redirectLoc = computed(() =>
      router.currentRoute.value.query.redirect
        ? (router.currentRoute.value.query.redirect as string)
        : '/dashboard',
    );

  async function redirect() {
    await router.replace(redirectLoc.value);
  }

  async function handleAccountClick(account: string) {
    if (user.loading) return;
    if (managingAccounts.value) {
      selectedAccount.value = account;
      removeAccountModal.value?.show();
    } else {
      try {
        const res = await user.switchAccount(account);
        if (res) {
          await file.clear();
          await files.clear();
          await sessions.clear();
          toast.show(`Switched to ${user.account?.user.username}.`);

          redirect();
        } else
          router.replace({
            path: '/auth',
            query: {
              redirect: redirectLoc.value,
              username: account,
            },
            hash: '#login',
          });
      } catch (e) {
        console.error(e);
        toast.clientError();
      }
    }
  }

  function addAccount() {
    router.replace({
      path: '/auth',
      query: {
        redirect: redirectLoc.value,
      },
      hash: '#login',
    });
  }

  async function removeAllAccountsConfirm(choice: boolean) {
    if (choice) {
      for (const account in user.accounts) {
        try {
          const res = await user.removeAccount(account);
          if (res) {
            if (res !== true) {
              console.error(res);
              toast.clientError();
              break;
            }
          }
        } catch (error) {
          console.error(error);
          toast.clientError();
          break;
        }
      }
      toast.show('All accounts removed.');
      managingAccounts.value = false;
    }
  }

  async function removeAccountConfirm(choice: boolean) {
    if (choice) {
      try {
        const res = await user.removeAccount(selectedAccount.value as string);
        if (res) {
          if (res === true) {
            toast.show('Account removed.');
            selectedAccount.value = null;
            if (Object.keys(user.accounts).length < 1) {
              managingAccounts.value = false;
            }
            removeAccountModal.value?.hide();
          } else {
            console.error(res);
            toast.clientError();
          }
        }
      } catch (error) {
        console.error(error);
        toast.clientError();
      }
    } else {
      removeAccountModal.value?.hide();
    }
  }

  onBeforeMount(async () => {
    if (Object.keys(user.accounts).length < 1) {
      router.replace({
        path: '/auth',
        query: {
          redirect: redirectLoc.value,
        },
        hash: '#login',
      });
    } else if (Object.keys(user.accounts).length < 2 && !user.loggedIn) {
      const res = await user.switchAccount(Object.keys(user.accounts)[0]);
      if (res)
        router.replace({
          path: redirectLoc.value,
        });
      else
        router.replace({
          path: '/auth',
          query: {
            redirect: redirectLoc.value,
            username: Object.keys(user.accounts)[0],
          },
          hash: '#login',
        });
    }
  });
</script>

<style>
  .account-switcher-accounts {
    width: fit-content;
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    flex-direction: column;
  }

  .account-switcher-account {
    display: grid;
    grid: 1fr 1fr / 50px 4fr;
    align-items: center;
    padding: 25px 30px;
    gap: 0 5px;
    border-bottom: 1px solid var(--ui-border);
    cursor: pointer;
    transition: background-color 0.25s, border-color 0.25s, color 0.25s;
  }

  .account-switcher-account:hover,
  .account-switcher-account:focus {
    background-color: var(--ui-background-hover);
  }

  .account-switcher-account:first-child {
    border-radius: 1rem 1rem 0 0;
  }

  .account-switcher-account:last-child {
    border-radius: 0 0 1rem 1rem;
    border-bottom-width: none;
    border-bottom-style: none;
  }

  .account-switcher-account:only-child {
    border-radius: 1rem;
    border-bottom-width: none;
    border-bottom-style: none;
  }

  .account-switcher-account.disabled {
    cursor: not-allowed;
    background-color: var(--ui-background-disabled);
    color: var(--ui-foreground-disabled);
  }

  .account-switcher-account img {
    transition: filter 0.25s;
    width: 50px;
    justify-self: left;
    align-self: center;
    grid-row: 1 / span 2;
    grid-column: 1 / 2;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
  }

  html.dark-theme .account-switcher-account img {
    filter: invert(100%);
  }

  html.dark-theme .account-switcher-account.disabled img {
    filter: invert(calc(148 / 255));
  }

  .account-switcher-account p {
    margin: 0;
    text-align: left;
    transition: color 0.25s;
  }

  .account-switcher-account.disabled p {
    color: var(--ui-foreground-disabled);
  }

  .account-switcher-account p:first-of-type {
    font-size: 24px;
    font-weight: bold;
    font-family: var(--font-heading);
    grid-column: 2 / 2;
    grid-row: 1 / 2;
  }

  .account-switcher-account p:first-of-type:not(:only-of-type) {
    align-self: end;
  }

  .account-switcher-account p:last-of-type:not(:only-of-type) {
    align-self: start;
    grid-column: 2 / 2;
    grid-row: 2 / 2;
  }

  .account-switcher-account p:only-of-type {
    grid-row: 1 / span 2;
  }
</style>
