<template>
  <h1>Active Sessions</h1>
  <h2>Active user sessions.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/staff/users" />
    <button
      v-if="!selecting"
      @click="selecting = true"
      :disabled="sessions.loading"
    >
      Bulk Delete
    </button>
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
              Click me to manage this session.
            </SelectableContentBox>
          </div>
          <div v-else class="no-content-container">
            <h1>This user has no active sessions.</h1>
            <h2>They have not used their account.</h2>
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
  >
    <p>Are you sure you want to delete these {{ selected.length }} sessions?</p>
    <p>They will have to be signed back in!</p>
  </ConfirmModal>
  <ConfirmModal
    ref="manageSessionModal"
    title="Manage Session"
    @submit="onManageSessionChoice"
  >
    <template v-if="!!selectedSession">
      <code v-text="selectedSession!.name" />
      <br />
      <p>
        Created At:
        <code>{{ toDateString(new Date(selectedSession.id * 1000)) }}</code>
      </p>
      <p>
        Expires At:
        <code>{{ toDateString(new Date(selectedSession.exp * 1000)) }}</code>
      </p>
      <p>If you delete this session, they will have to sign back in.</p>
    </template>
    <LoadingMessage spinner v-else />
  </ConfirmModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import LoadingMessage from '@/components/LoadingMessage.vue';
  import Online from '@/components/Online.vue';
  import Paginator from '@/components/Paginator.vue';
  import SelectableContentBox from '@/components/SelectableContentBox.vue';
  import SkeletonContentBoxes from '@/components/SkeletonContentBoxes.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import backWithFallback from '@/utils/routerBackWithFallback';
  import defaultErrorHandler from '@/utils/defaultErrorHandler';
  import infoIcon from '@/assets/images/info.svg';
  import toDateString from '@/utils/toDateString';
  import loadWhenOnline from '@/utils/loadWhenOnline';

  // Store Modules
  import { sessionsStore } from '@/stores/staff-space/sessions';
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';

  // External Modules
  import { ref, onMounted } from 'vue';
  import { useOnline } from '@vueuse/core';
  import { useRouter } from 'vue-router';

  const router = useRouter(),
    online = useOnline(),
    sessions = sessionsStore(),
    user = userStore(),
    toast = toastStore(),
    selecting = ref(false),
    selected = ref<string[]>([]),
    confirmDeleteModal = ref<InstanceType<typeof ConfirmModal>>(),
    manageSessionModal = ref<InstanceType<typeof ConfirmModal>>(),
    page = ref(0),
    selectedSession = ref<Cumulonimbus.Data.Session | null>(null);

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
      selectedSession.value = session;
      manageSessionModal.value!.show();
    }
  }

  onMounted(async () =>
    loadWhenOnline(
      initPage,
      !sessions.data ||
        sessions.page !== page.value ||
        sessions.sessionOwner?.id !== router.currentRoute.value.query.id,
    ),
  );

  async function initPage() {
    try {
      sessions.sessionOwner = (
        await user.client!.getUser(router.currentRoute.value.query.id as string)
      ).result;
    } catch (e) {
      if (e instanceof Cumulonimbus.ResponseError) {
        const handled = await defaultErrorHandler(e, router);
        if (!handled) {
          switch (e.code) {
            case 'INVALID_USER_ERROR':
              toast.show('This user does not exist.');
              backWithFallback(router, '/staff/users', true);
          }
        }
      } else {
        console.error(e);
        toast.genericError();
      }
    }
    fetchSessions();
  }

  async function onManageSessionChoice(choice: boolean) {
    if (choice) {
      const status = await sessions.deleteSession(
        selectedSession.value!.id + '',
      );
      if (status) {
        selectedSession.value = null;
        toast.show('Session deleted.');
        await fetchSessions();
      }
    }
    await manageSessionModal.value!.hide();
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
          await user.logout();
        } else {
          selected.value = [];
          selecting.value = false;
          toast.show(`Deleted ${status} sessions.`);
          await fetchSessions();
        }
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  function cancelSelection() {
    selecting.value = false;
    selected.value = [];
  }
</script>
