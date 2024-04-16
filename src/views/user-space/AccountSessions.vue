<template>
  <h1>Active Sessions</h1>
  <h2>Who's logged into your account?</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard" />
    <template v-if="!selecting">
      <button @click="selecting = true" :disabled="sessions.loading">
        Select...
      </button>
      <button
        @click="registerSessionModal?.show()"
        :disabled="sessions.loading"
      >
        Create Scoped Session
      </button>
    </template>
    <template v-else>
      <button @click="cancelSelection" :disabled="sessions.loading">
        Cancel
      </button>
      <button @click="confirmDeleteModal!.show()" :disabled="sessions.loading">
        Delete Selected
      </button>
    </template>
  </div>

  <Paginator
    v-model="page"
    @page-change="fetchSessions"
    :item-count="sessions.data?.count || 0"
    :disabled="sessions.loading || !online"
  >
    <Online>
      <template v-if="!sessions.loading">
        <template v-if="!sessions.errored">
          <div
            v-if="sessions.data && sessions.data.count > 0"
            class="content-box-container"
          >
            <SelectableContentBox
              v-for="session in sessions.data.items"
              :title="session.name"
              :selecting="selecting"
              :src="infoIcon"
              theme-safe
              :selected="selected.includes(session.id + '')"
              @click="onSessionClick(session)"
            >
              <strong v-if="session.id === user.account?.session.id"
                >This Session!</strong
              >
              <br v-if="session.id === user.account?.session.id" />
              Click me to manage this session.
            </SelectableContentBox>
          </div>
          <div v-else class="no-content-container">
            <h1>This should not ever be seen.</h1>
            <h2>I am horribly broken.</h2>
          </div>
        </template>
        <div class="no-content-container" v-else>
          <h1>Something went wrong.</h1>
          <button @click="fetchSessions">Retry</button>
        </div>
      </template>
      <SkeletonContentBoxes v-else />
    </Online>
  </Paginator>
  <ConfirmModal
    ref="confirmDeleteModal"
    title="Are you sure?"
    @submit="onDeleteSessionsChoice"
    :disabled="sessions.loading"
  >
    <p>Are you sure you want to delete these {{ selected.length }} sessions?</p>
    <p>They will have to be logged back in!</p>
  </ConfirmModal>
  <ConfirmModal
    ref="manageSessionModal"
    :title="selectedSession ? selectedSession.name : 'Loading Session...'"
    @submit="onManageSessionChoice"
    :disabled="sessions.loading"
    deny-button="Close"
    confirm-button="Delete"
  >
    <template v-if="!!selectedSession">
      <p v-if="selectedSession!.id === user.account?.session.id">
        <strong> This is your current session. </strong>
      </p>
      <p>
        Created At:
        <code v-text="toDateString(new Date(selectedSession.createdAt))" />
      </p>
      <p>
        Expires At:
        <code v-text="toDateString(new Date(selectedSession.exp * 1000))" />
      </p>
      <p>
        Last Used:
        <code
          v-text="
            selectedSession.usedAt
              ? useFuzzyTimeString(ref(new Date(selectedSession.usedAt))).value
              : 'Not yet...'
          "
        />
      </p>
      <p v-if="!selectedSessionPermissions">
        <strong>This session is a standard browser session.</strong>
      </p>
      <template v-else>
        <p>
          <strong>Permissions:</strong>
        </p>
        <code v-text="selectedSessionPermissions.join('\n')" />
      </template>
    </template>
    <LoadingMessage spinner v-else />
  </ConfirmModal>
  <FullscreenLoadingMessage ref="fullscreenLoadingMessage" />

  <FormModal
    ref="registerSessionModal"
    title="Create Scoped Session"
    @submit="registerSession"
    :disabled="sessions.loading"
    confirm-button="Create"
  >
    <p>
      Create a scoped session to be used for automated tasks or other purposes.
      <br />
      Scoped sessions are limited in their permissions.
    </p>
    <p>
      <strong>Session Name:</strong>
    </p>
    <input
      type="text"
      name="name"
      required
      placeholder="Session Name"
      :disabled="sessions.loading"
    />
    <p><strong>Available Permissions:</strong></p>
    <Switch
      class="indent-0"
      name="ALL"
      title="Giving a session all permissions can be dangerous."
      ref="allPermissionsSwitch"
    >
      All
    </Switch>
    <Switch
      class="indent-1"
      name="UPLOAD_FILE"
      title="Grants a session the ability to upload files."
      :disabled="allPermissionsSwitch?.checked"
    >
      Upload Files
    </Switch>
    <Switch
      class="indent-1"
      name="SECOND_FACTOR_READ"
      title="Grants a session read access to second factors."
      :disabled="allPermissionsSwitch?.checked"
    >
      Read Second Factors
    </Switch>
    <Switch
      class="indent-1"
      name="account"
      ref="accountSwitch"
      title="Grants a session read and write access to account details."
      :disabled="allPermissionsSwitch?.checked"
    >
      Account
    </Switch>
    <Switch
      class="indent-2"
      name="ACCOUNT_READ"
      title="Grants a session read access to account details."
      :disabled="allPermissionsSwitch?.checked || accountSwitch?.checked"
    >
      Read
    </Switch>
    <Switch
      class="indent-2"
      name="ACCOUNT_MODIFY"
      title="Grants a session write access to account details."
      :disabled="allPermissionsSwitch?.checked || accountSwitch?.checked"
    >
      Write
    </Switch>
    <Switch
      class="indent-1"
      name="session"
      ref="sessionsSwitch"
      title="Grants a session read and write access to sessions."
      :disabled="allPermissionsSwitch?.checked"
    >
      Sessions
    </Switch>
    <Switch
      class="indent-2"
      name="SESSION_READ"
      title="Grants a session read access to sessions."
      :disabled="allPermissionsSwitch?.checked || sessionsSwitch?.checked"
    >
      Read
    </Switch>
    <Switch
      class="indent-2"
      name="SESSION_MODIFY"
      title="Grants a session write access to sessions."
      :disabled="allPermissionsSwitch?.checked || sessionsSwitch?.checked"
    >
      Write
    </Switch>
    <Switch
      class="indent-1"
      name="file"
      ref="filesSwitch"
      title="Grants a session read and write access to files."
      :disabled="allPermissionsSwitch?.checked"
    >
      Files
    </Switch>
    <Switch
      class="indent-2"
      name="FILE_READ"
      title="Grants a session read access to files."
      :disabled="allPermissionsSwitch?.checked || filesSwitch?.checked"
    >
      Read
    </Switch>
    <Switch
      class="indent-2"
      name="FILE_MODIFY"
      title="Grants a session write access to files."
      :disabled="allPermissionsSwitch?.checked || filesSwitch?.checked"
    >
      Write
    </Switch>
    <template v-if="user.account?.user.staff">
      <Separator />
      <p><strong>Staff Permissions:</strong></p>
      <Switch
        class="indent-1"
        name="staff"
        ref="staffSwitch"
        title="Grants a session read and write access to all staff features."
        :disabled="allPermissionsSwitch?.checked"
      >
        All
      </Switch>
      <Switch
        class="indent-2"
        name="staff-accounts"
        ref="staffAccountSwitch"
        title="Grants a session read and write access to other user accounts."
        :disabled="allPermissionsSwitch?.checked || staffSwitch?.checked"
      >
        Account
      </Switch>
      <Switch
        class="indent-3"
        name="STAFF_READ_ACCOUNTS"
        title="Grants a session read access to other user accounts."
        :disabled="
          allPermissionsSwitch?.checked ||
          staffSwitch?.checked ||
          staffAccountSwitch?.checked
        "
      >
        Read
      </Switch>
      <Switch
        class="indent-3"
        name="STAFF_MODIFY_ACCOUNTS"
        title="Grants a session write access to other user accounts."
        :disabled="
          allPermissionsSwitch?.checked ||
          staffSwitch?.checked ||
          staffAccountSwitch?.checked
        "
      >
        Write
      </Switch>
      <Switch
        class="indent-2"
        name="staff-sessions"
        ref="staffSessionsSwitch"
        title="Grants a session read and write access to other user sessions."
        :disabled="allPermissionsSwitch?.checked || staffSwitch?.checked"
      >
        Sessions
      </Switch>
      <Switch
        class="indent-3"
        name="STAFF_READ_SESSIONS"
        title="Grants a session read access to other user sessions."
        :disabled="
          allPermissionsSwitch?.checked ||
          staffSwitch?.checked ||
          staffSessionsSwitch?.checked
        "
      >
        Read
      </Switch>
      <Switch
        class="indent-3"
        name="STAFF_MODIFY_SESSIONS"
        title="Grants a session write access to other user sessions."
        :disabled="
          allPermissionsSwitch?.checked ||
          staffSwitch?.checked ||
          staffSessionsSwitch?.checked
        "
      >
        Write
      </Switch>
      <Switch
        class="indent-2"
        name="staff-files"
        ref="staffFilesSwitch"
        title="Grants a session read
      and write access to other user files."
        :disabled="allPermissionsSwitch?.checked || staffSwitch?.checked"
      >
        Files
      </Switch>
      <Switch
        class="indent-3"
        name="STAFF_READ_FILES"
        title="Grants a session read access to other user files."
        :disabled="
          allPermissionsSwitch?.checked ||
          staffSwitch?.checked ||
          staffFilesSwitch?.checked
        "
      >
        Read
      </Switch>
      <Switch
        class="indent-3"
        name="STAFF_MODIFY_FILES"
        title="Grants a session write access to other user files."
        :disabled="
          allPermissionsSwitch?.checked ||
          staffSwitch?.checked ||
          staffFilesSwitch?.checked
        "
      >
        Write
      </Switch>
      <Switch
        class="indent-2"
        name="staff-second-factors"
        ref="staffSecondFactorsSwitch"
        title="Grants a session read and write access to other user second factors."
        :disabled="allPermissionsSwitch?.checked || staffSwitch?.checked"
      >
        Second Factors
      </Switch>
      <Switch
        class="indent-3"
        name="STAFF_READ_SECOND_FACTORS"
        title="Grants a session read access to other user second factors."
        :disabled="
          allPermissionsSwitch?.checked ||
          staffSwitch?.checked ||
          staffSecondFactorsSwitch?.checked
        "
      >
        Read
      </Switch>
      <Switch
        class="indent-3"
        name="STAFF_MODIFY_SECOND_FACTORS"
        title="Grants a session write access to other user second factors."
        :disabled="
          allPermissionsSwitch?.checked ||
          staffSwitch?.checked ||
          staffSecondFactorsSwitch?.checked
        "
      >
        Write
      </Switch>
      <Switch
        class="indent-2"
        name="STAFF_MODIFY_DOMAINS"
        title="Grants a session write access to domains."
        :disabled="allPermissionsSwitch?.checked || staffSwitch?.checked"
      >
        Domains
      </Switch>
      <Switch
        class="indent-2"
        name="STAFF_MODIFY_INSTRUCTIONS"
        title="Grants a session write access to instructions."
        :disabled="allPermissionsSwitch?.checked || staffSwitch?.checked"
      >
        Instructions
      </Switch>
      <Switch
        class="indent-2"
        name="STAFF_MODIFY_KILLSWITCHES"
        title="Grants a session write access to killswitches."
        :disabled="allPermissionsSwitch?.checked || staffSwitch?.checked"
      >
        Killswitches
      </Switch>
    </template>
    <Separator />
    <Switch
      class="indent-0"
      name="short-lived"
      checked
      title="Short-lived sessions are automatically deleted after 24 hours, otherwise they last 10 years."
    >
      Short-Lived
    </Switch>
    <p><strong>Your Password:</strong></p>
    <input
      type="text"
      hidden
      autocomplete="username"
      :value="user.account?.user.username"
    />
    <input
      type="password"
      autocomplete="current-password"
      placeholder="Password"
      required
      name="password"
      :disabled="sessions.loading"
    />
  </FormModal>
  <Modal title="Scoped Session Token" ref="scopedSessionTokenModal">
    <p>
      Your scoped session token is:
      <code style="word-break: break-all" v-text="createdScopedSessionToken" />
    </p>
    <p>
      <strong>Keep this token safe!</strong>
    </p>
    <template #footer>
      <button @click="scopedSessionTokenModal?.hide()">Close</button>
      <button
        @click="copyScopedSessionToken()"
        v-text="copied ? 'Copied!' : 'Copy'"
      />
    </template>
  </Modal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import FullscreenLoadingMessage from '@/components/FullscreenLoadingMessage.vue';
  import LoadingMessage from '@/components/LoadingMessage.vue';
  import Online from '@/components/Online.vue';
  import Paginator from '@/components/Paginator.vue';
  import SelectableContentBox from '@/components/SelectableContentBox.vue';
  import SkeletonContentBoxes from '@/components/SkeletonContentBoxes.vue';
  import FormModal from '@/components/FormModal.vue';
  import Switch from '@/components/Switch.vue';
  import Separator from '@/components/Separator.vue';
  import Modal from '@/components/Modal.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import infoIcon from '@/assets/images/info.svg';
  import loadWhenOnline from '@/utils/loadWhenOnline';
  import toDateString from '@/utils/toDateString';
  import { useFuzzyTimeString } from '@/utils/time';
  import toLogin from '@/utils/toLogin';

  // Store Modules
  import { sessionsStore } from '@/stores/user-space/sessions';
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';

  // External Modules
  import { ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useOnline } from '@vueuse/core';
  import { useClipboard } from '@vueuse/core';

  const confirmDeleteModal = ref<InstanceType<typeof ConfirmModal>>(),
    fullscreenLoadingMessage =
      ref<InstanceType<typeof FullscreenLoadingMessage>>(),
    manageSessionModal = ref<InstanceType<typeof ConfirmModal>>(),
    registerSessionModal = ref<InstanceType<typeof FormModal>>(),
    scopedSessionTokenModal = ref<InstanceType<typeof Modal>>(),
    online = useOnline(),
    page = ref(0),
    selected = ref<string[]>([]),
    selectedSession = ref<Cumulonimbus.Data.Session | null>(null),
    selectedSessionPermissions = computed(() => {
      if (
        !selectedSession.value ||
        selectedSession.value.permissionFlags === null
      )
        return null;
      // Convert the permissions bitmask to an array of strings
      return Object.keys(Cumulonimbus.PermissionFlags)
        .filter((key) => isNaN(Number(key)))
        .filter(
          (key) =>
            selectedSession.value!.permissionFlags &
            (Cumulonimbus.PermissionFlags[key as any] as unknown as number),
        );
    }),
    createdScopedSessionToken = ref<string | null>(null),
    { copied, copy } = useClipboard(),
    selecting = ref(false),
    router = useRouter(),
    sessions = sessionsStore(),
    toast = toastStore(),
    user = userStore();

  // Switch refs
  const allPermissionsSwitch = ref<InstanceType<typeof Switch>>(),
    accountSwitch = ref<InstanceType<typeof Switch>>(),
    sessionsSwitch = ref<InstanceType<typeof Switch>>(),
    filesSwitch = ref<InstanceType<typeof Switch>>(),
    staffSwitch = ref<InstanceType<typeof Switch>>(),
    staffAccountSwitch = ref<InstanceType<typeof Switch>>(),
    staffSessionsSwitch = ref<InstanceType<typeof Switch>>(),
    staffFilesSwitch = ref<InstanceType<typeof Switch>>(),
    staffSecondFactorsSwitch = ref<InstanceType<typeof Switch>>();

  async function fetchSessions() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    window.scrollTo(0, 0);
    try {
      await sessions.getSessions(page.value);
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function onSessionClick(session: Cumulonimbus.Data.Session) {
    if (selecting.value) {
      if (selected.value.includes(session.id + '')) {
        selected.value = selected.value.filter((id) => id !== session.id + '');
      } else {
        selected.value.push(session.id + '');
      }
    } else {
      manageSessionModal.value!.show();
      try {
        selectedSession.value = (
          await user.client!.getSelfSession(session.id + '')
        ).result;
      } catch (e) {
        console.error(e);
        toast.clientError();
        await fetchSessions();
        manageSessionModal.value!.hide();
      }
    }
  }

  onMounted(() =>
    loadWhenOnline(
      fetchSessions,
      !sessions.data || sessions.page !== page.value,
    ),
  );

  async function onManageSessionChoice(choice: boolean) {
    if (choice) {
      fullscreenLoadingMessage.value!.show();
      const status = await sessions.deleteSession(
        selectedSession.value!.id + '',
      );
      if (status) {
        if (selectedSession.value?.id === user.account?.session.id) {
          fullscreenLoadingMessage.value!.hide();
          await manageSessionModal.value!.hide();
          toLogin(router);
        } else {
          selectedSession.value = null;
          toast.show('Session deleted.');
          await fetchSessions();
          fullscreenLoadingMessage.value!.hide();
          await manageSessionModal.value!.hide();
        }
      } else fullscreenLoadingMessage.value!.hide();
    } else {
      await manageSessionModal.value!.hide();
    }
  }

  async function onDeleteSessionsChoice(choice: boolean) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    if (!choice) {
      await confirmDeleteModal.value!.hide();
      selected.value = [];
      selecting.value = false;
      return;
    }
    try {
      const status = await sessions.deleteSessions(selected.value);
      if (status) {
        if (selected.value.includes(user.account?.session.id + '')) {
          fullscreenLoadingMessage.value!.hide();
          await confirmDeleteModal.value!.hide();
          await user.logout();
        } else {
          cancelSelection();
          toast.show(`Deleted ${status} sessions.`);
          await fetchSessions();
          fullscreenLoadingMessage.value!.hide();
          await confirmDeleteModal.value!.hide();
        }
      } else fullscreenLoadingMessage.value!.hide();
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  function cancelSelection() {
    selected.value = [];
    selecting.value = false;
  }

  async function registerSession(fart: any) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }

    // Iterate over the switches and build the permissions bitmask
    let permissions = 0;
    theLoop: for (const sw of Object.entries(fart)) {
      if (sw[0] === 'password' || sw[0] === 'short-lived' || sw[0] === '')
        continue;
      switch (sw[0]) {
        case 'ALL':
          if (sw[1]) {
            permissions = Cumulonimbus.PermissionFlags.ALL;
            // Break from the switch statement and the loop
            break theLoop;
          }
          break;
        case 'account':
          if (sw[1]) permissions |= Cumulonimbus.PermissionGroups.ACCOUNT;
          break;
        case 'session':
          if (sw[1]) permissions |= Cumulonimbus.PermissionGroups.SESSION;
          break;
        case 'file':
          if (sw[1]) permissions |= Cumulonimbus.PermissionGroups.FILE;
          break;
        case 'staff':
          if (sw[1]) permissions |= Cumulonimbus.PermissionGroups.STAFF;
          break;
        case 'staff-accounts':
          if (sw[1])
            permissions |= Cumulonimbus.PermissionGroups.STAFF_ACCOUNTS;
          break;
        case 'staff-sessions':
          if (sw[1])
            permissions |= Cumulonimbus.PermissionGroups.STAFF_SESSIONS;
          break;
        case 'staff-files':
          if (sw[1]) permissions |= Cumulonimbus.PermissionGroups.STAFF_FILES;
          break;
        case 'staff-second-factors':
          if (sw[1])
            permissions |= Cumulonimbus.PermissionGroups.STAFF_SECOND_FACTORS;
          break;
        default:
          if (sw[1]) {
            permissions |=
              Cumulonimbus.PermissionFlags[
                sw[0] as keyof typeof Cumulonimbus.PermissionFlags
              ];
          }
          break;
      }
    }

    if (permissions === 0) {
      toast.show('You must select at least one permission.');
      return;
    }

    try {
      const status = await sessions.createScopedSession(
        fart.name,
        permissions,
        fart.password,
        !fart['short-lived'],
      );
      if (status !== null) {
        createdScopedSessionToken.value = status;
        toast.show('Session created.');
        await fetchSessions();
        await registerSessionModal.value!.hide();
        await scopedSessionTokenModal.value!.show();
        copyScopedSessionToken();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  function copyScopedSessionToken() {
    copy(createdScopedSessionToken.value!);
  }
</script>

<style scoped>
  .modal-content .switch-container {
    text-align: left;
  }

  .switch-container.indent-0 {
    margin-left: 0;
  }

  .switch-container.indent-1 {
    margin-left: 2rem;
  }

  .switch-container.indent-2 {
    margin-left: 4rem;
  }

  .switch-container.indent-3 {
    margin-left: 6rem;
  }
</style>
