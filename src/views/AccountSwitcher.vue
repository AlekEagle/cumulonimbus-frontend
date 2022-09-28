<template>
  <h1>Switch Accounts</h1>
  <h2>Have multiple accounts you need to keep track of? You can do it here.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/">Back</BackButton>
    <button
      v-if="!managingAccounts"
      @click="managingAccounts = true"
      :disabled="user.loading"
    >
      Remove Accounts
    </button>
    <button v-else @click="managingAccounts = false" :disabled="user.loading">
      Cancel
    </button>
    <button
      v-if="managingAccounts"
      @click="removeAllAccounts"
      :disabled="user.loading"
    >
      Remove All Accounts
    </button>
  </div>
  <EmphasizedBox no-padding>
    <div class="account-switcher-accounts">
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
        <p v-if="token === false && !managingAccounts">Not logged in.</p>
        <p v-if="managingAccounts">Click to remove this account.</p>
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
  </EmphasizedBox>
  <ConfirmModal
    title="Remove All Accounts"
    ref="removeAllAccountsModal"
    @submit="removeAllAccountsConfirm"
  >
    <p>Are you sure you want to remove all accounts?</p>
    <p>You'll have to enter your username/email and password again.</p>
  </ConfirmModal>
  <ConfirmModal
    title="Remove Account"
    ref="removeAccountModal"
    @submit="removeAccountConfirm"
  >
    <p
      >Are you sure you want to remove the account
      <code v-text="selectedAccount" />?</p
    >
    <p>You'll have to enter your username/email and password again.</p>
  </ConfirmModal>
</template>

<script lang="ts" setup>
  import BackButton from '@/components/BackButton.vue';
  import EmphasizedBox from '@/components/EmphasizedBox.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import { ref, onBeforeMount } from 'vue';
  import { userStore, cumulonimbusOptions } from '@/stores/user';
  import { useRouter } from 'vue-router';
  import { toastStore } from '@/stores/toast';
  import profileIcon from '@/assets/images/profile.svg';
  import plusIcon from '@/assets/images/plus.svg';
  import closeIcon from '@/assets/images/close.svg';

  const user = userStore(),
    router = useRouter(),
    toast = toastStore(),
    managingAccounts = ref(false),
    selectedAccount = ref<string | null>(null),
    removeAllAccountsModal = ref<typeof ConfirmModal>(),
    removeAccountModal = ref<typeof ConfirmModal>();

  async function handleAccountClick(account: string) {
    if (managingAccounts.value) {
      selectedAccount.value = account;
      removeAccountModal.value?.show();
    } else {
      const res = await user.switchAccount(account);
      if (typeof res === 'boolean') {
        if (res)
          router.push({
            path: '/dashboard'
          });
        else
          router.push({
            path: '/auth',
            query: {
              redirect: '/dashboard',
              username: account
            },
            hash: 'login'
          });
      }
    }
  }

  function addAccount() {
    router.push({
      path: '/auth',
      query: {
        redirect: '/dashboard'
      },
      hash: 'login'
    });
  }

  function removeAllAccounts() {
    removeAllAccountsModal.value?.show();
  }

  async function removeAllAccountsConfirm(choice: boolean) {
    if (choice) {
      for (const account in user.accounts) {
        if (user.accounts[account] === false) {
          user.removeAccount(account);
        } else {
          const tempClient = new Cumulonimbus(
            user.accounts[account] as string,
            cumulonimbusOptions
          );
          try {
            const res = await tempClient.deleteSelfSession(
              (await tempClient.getSelfSession()).result.iat.toString()
            );
            if (res) {
              user.removeAccount(account);
            }
          } catch (error) {
            if (error instanceof Cumulonimbus.ResponseError) {
              if (error.code === 'INVALID_SESSION_ERROR') {
                user.removeAccount(account);
              }
              {
                console.error(error);
                toast.clientError();
              }
            } else {
              console.error(error);
              toast.clientError();
            }
          }
        }
      }
      toast.show('All accounts removed.');
      user.logout();
      router.push({
        path: '/auth',
        query: {
          redirect: '/dashboard'
        },
        hash: 'login'
      });
    }
  }

  async function removeAccountConfirm(choice: boolean) {
    if (choice) {
      if (user.accounts[selectedAccount.value as string] === false) {
        toast.show('Account removed.');
        user.removeAccount(selectedAccount.value as string);
      } else {
        const tempClient = new Cumulonimbus(
          user.accounts[selectedAccount.value as string] as string,
          cumulonimbusOptions
        );
        try {
          const res = await tempClient.deleteSelfSession(
            (await tempClient.getSelfSession()).result.iat.toString()
          );
          if (res) {
            toast.show('Account removed.');
            if (user.account?.user.username === selectedAccount.value) {
              user.logout();
            }
            user.removeAccount(selectedAccount.value as string);
          }
        } catch (error) {
          if (error instanceof Cumulonimbus.ResponseError) {
            if (error.code === 'INVALID_SESSION_ERROR') {
              toast.show('Account removed.');
              if (user.account?.user.username === selectedAccount.value) {
                user.logout();
              }
              user.removeAccount(selectedAccount.value as string);
            }
            {
              console.error(error);
              toast.clientError();
            }
          } else {
            console.error(error);
            toast.clientError();
          }
        } finally {
          removeAccountModal.value?.hide();
        }
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
          redirect: '/dashboard'
        },
        hash: 'login'
      });
    } else if (Object.keys(user.accounts).length < 2 && !user.loggedIn) {
      const res = await user.switchAccount(Object.keys(user.accounts)[0]);
      if (typeof res === 'boolean') {
        if (res)
          router.push({
            path: '/dashboard'
          });
        else
          router.push({
            path: '/auth',
            query: {
              redirect: '/dashboard',
              username: Object.keys(user.accounts)[0]
            },
            hash: 'login'
          });
      }
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
