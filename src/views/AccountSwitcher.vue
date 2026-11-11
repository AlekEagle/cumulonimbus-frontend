<template>
  <EmphasizedBox :no-padding="!user.loading" :center-content="!user.loading">
    <div v-if="!user.loading" class="account-switcher-accounts">
      <div
        :class="`account-switcher-account${user.loading ? ' disabled' : ''}`"
        v-for="(token, account) in user.accounts"
        @click="handleAccountClick(account as string)"
      >
        <img src="!/images/profile.svg" alt="Generic account icon" />
        <p v-text="account" />
        <p v-if="user.account?.user.username === account">
          Currently logged in.
        </p>
        <p v-if="token === false">Not logged in.</p>
        <img
          src="!/images/close.svg"
          alt="Delete account icon"
          @click.stop="handleDeleteAccountClick(account as string)"
        />
      </div>
      <div
        v-if="Object.keys(user.accounts).length < 1"
        class="account-switcher-account"
      >
        <img src="!/images/profile.svg" alt="Generic account icon" />
        <p>Nobody here but us chickens!</p>
        <p>Click the "Add Account" button to add an account.</p>
      </div>
      <div
        :class="`account-switcher-account${user.loading ? ' disabled' : ''}`"
        @click="addAccount"
      >
        <img src="!/images/plus.svg" alt="Plus icon" />
        <p>Add Account</p>
        <p>Add another account.</p>
      </div>
    </div>
    <LoadingMessage spinner v-else />
  </EmphasizedBox>
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
  import ConfirmModal from '&/ConfirmModal.vue';
  import EmphasizedBox from '&/EmphasizedBox.vue';
  import LoadingMessage from '&/LoadingMessage.vue';

  // In-House Modules
  // No In-House Modules to import here.

  // Store Modules
  import { fileStore } from '$/user-space/file.js';
  import { filesStore } from '$/user-space/files.js';
  import { sessionsStore } from '$/user-space/sessions.js';
  import { toastStore } from '$/toast.js';
  import { userStore } from '$/user.js';

  // External Modules
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';

  const user = userStore(),
    router = useRouter(),
    toast = toastStore(),
    file = fileStore(),
    files = filesStore(),
    sessions = sessionsStore(),
    selectedAccount = ref<string | null>(null),
    removeAccountModal = ref<InstanceType<typeof ConfirmModal>>(),
    redirectLoc = computed(() =>
      router.currentRoute.value.query.redirect
        ? (router.currentRoute.value.query.redirect as string)
        : '/dashboard',
    );

  async function redirect() {
    await router.replace(redirectLoc.value);
  }

  async function handleDeleteAccountClick(account: string) {
    if (user.loading) return;
    selectedAccount.value = account;
    removeAccountModal.value?.show();
  }

  async function handleAccountClick(account: string) {
    if (user.loading) return;
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

  function addAccount() {
    router.replace({
      path: '/auth',
      query: {
        redirect: redirectLoc.value,
      },
      hash: '#login',
    });
  }

  async function removeAccountConfirm(choice: boolean) {
    if (choice) {
      try {
        const res = await user.removeAccount(selectedAccount.value as string);
        if (res) {
          if (res === true) {
            toast.show('Account removed.');
            selectedAccount.value = null;
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
    grid: 1fr 1fr / 50px 4fr 40px;
    align-items: center;
    padding: 25px 30px;
    gap: 0 5px;
    border-bottom: 1px solid var(--look-text-field-border);
    cursor: pointer;
    transition:
      background-color var(--theme-switch-time) ease,
      border-color var(--theme-switch-time) ease,
      color var(--theme-switch-time) ease;
  }

  .account-switcher-account:hover,
  .account-switcher-account:focus {
    background-color: var(--look-text-field-hover);
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
    opacity: 0.5;
  }

  .account-switcher-account img:not(:last-child) {
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

  html.dark-mode .account-switcher-account img {
    filter: invert(100%);
  }

  html.dark-mode .account-switcher-account.disabled img {
    filter: invert(calc(148 / 255));
  }

  .account-switcher-account p {
    margin: 0;
    text-align: left;
    transition: color var(--theme-switch-time) ease;
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

  .account-switcher-account img:last-child:not(:only-child) {
    height: 20px;
    align-self: center;
    justify-self: right;
    grid-row: 1 / span 2;
    grid-column: 3 / 4;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
  }
</style>
