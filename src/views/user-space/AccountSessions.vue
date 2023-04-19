<template>
  <h1>Active Sessions</h1>
  <template v-if="online || sessions.data">
    <template v-if="sessions.data">
      <h2>
        Showing page {{ (page + 1).toLocaleString() }} of
        {{ (sessions.data ? Math.ceil(sessions.data?.count / 50) : 1).toLocaleString() }}
        <br />
        {{
          sessions.data?.count
            ? sessions.data.count.toLocaleString()
            : "some number of"
        }}
        logged in sessions in total.
      </h2>
    </template>
    <h2 v-else class="animated-ellipsis"
      >Alek is seeing who is logged in as you</h2
    >
  </template>
  <h2 v-else>Alek can't see who is logged in as you :(</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard" />
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
    :max="sessions.data ? Math.ceil(sessions.data?.count / 50) - 1 : 0"
    :disabled="sessions.loading || !online"
  >
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
            :selected="selected.includes(session.iat + '')"
            @click="onSessionClick(session)"
          >
            <strong v-if="session.iat === user.account?.session.iat"
              >This Session!</strong
            >
            <br v-if="session.iat === user.account?.session.iat" />
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
    <div v-else class="no-content-container">
      <LoadingBlurb />
    </div>
  </Paginator>
  <ConfirmModal
    ref="confirmDeleteModal"
    title="Are you sure?"
    @submit="onDeleteSessionsChoice"
  >
    <p>Are you sure you want to delete these {{ selected.length }} sessions?</p>
    <p>They will have to be logged back in!</p>
  </ConfirmModal>
  <ConfirmModal
    ref="manageSessionModal"
    title="Manage Session"
    @submit="onManageSessionChoice"
  >
    <template v-if="!!selectedSession">
      <code v-text="selectedSession!.name" />
      <br />
      <strong v-if="selectedSession!.iat === user.account?.session.iat">
        This is your current session.
      </strong>
      <p>
        Created At:
        <code>{{ toDateString(new Date(selectedSession.iat * 1000)) }}</code>
      </p>
      <p>
        Expires At:
        <code>{{ toDateString(new Date(selectedSession.exp * 1000)) }}</code>
      </p>
      <p>If you delete this session, you will have to log back in.</p>
    </template>
    <LoadingBlurb v-else />
  </ConfirmModal>
</template>

<script lang="ts" setup>
import Paginator from "@/components/Paginator.vue";
import BackButton from "@/components/BackButton.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import LoadingBlurb from "@/components/LoadingBlurb.vue";
import SelectableContentBox from "@/components/SelectableContentBox.vue";
import { toastStore } from "@/stores/toast";
import { userStore } from "@/stores/user";
import defaultErrorHandler from "@/utils/defaultErrorHandler";
import toDateString from "@/utils/toDateString";
import { useOnline } from "@vueuse/core";
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { sessionsStore } from "@/stores/user-space/sessions";
import Cumulonimbus from "cumulonimbus-wrapper";
import infoIcon from "@/assets/images/info.svg";

const router = useRouter(),
  online = useOnline(),
  sessions = sessionsStore(),
  user = userStore(),
  toast = toastStore(),
  selecting = ref(false),
  selected = ref<string[]>([]),
  confirmDeleteModal = ref<typeof ConfirmModal>(),
  manageSessionModal = ref<typeof ConfirmModal>(),
  page = ref(0),
  selectedSession = ref<Cumulonimbus.Data.Session | null>(null);

async function fetchSessions() {
  if (!online.value) {
    toast.connectivityOffline();
    return;
  }
  window.scrollTo(0, 0);
  try {
    const status = await sessions.getSessions(page.value);
    if (status instanceof Cumulonimbus.ResponseError) {
      const handled = await defaultErrorHandler(status, router);
      if (!handled) {
        toast.clientError();
      }
    } else if (!status) {
      toast.clientError();
    }
  } catch (e) {
    console.error(e);
    toast.clientError();
  }
}

async function onSessionClick(session: Cumulonimbus.Data.Session) {
  if (selecting.value) {
    if (selected.value.includes(session.iat + "")) {
      selected.value = selected.value.filter((id) => id !== session.iat + "");
    } else {
      selected.value.push(session.iat + "");
    }
  } else {
    selectedSession.value = session;
    manageSessionModal.value!.show();
  }
}

onMounted(async () => {
  if (!online.value) {
    const unwatchOnline = watch(online, () => {
      if (online.value) {
        if (!sessions.data || sessions.page !== page.value) {
          fetchSessions();
        }
        unwatchOnline();
      }
    });
    return;
  }
  if (!sessions.data || sessions.page !== page.value) {
    fetchSessions();
  }
});

async function onManageSessionChoice(choice: boolean) {
  if (choice) {
    const status = await sessions.deleteSession(
      selectedSession.value!.iat + ""
    );
    if (status instanceof Cumulonimbus.ResponseError) {
      switch (status.code) {
        case "BANNED_ERROR":
          toast.banned();
          user.logout();
          router.push("/");
          break;
        case "RATELIMITED_ERROR":
          toast.rateLimit(status);
          break;
        case "INVALID_SESSION_ERROR":
          toast.show("It appears that session doesn't exist anymore.");
          await fetchSessions();
          selectedSession.value = null;
          break;
        case "INTERNAL_ERROR":
          toast.serverError();
          break;
        case "GENERIC_ERROR":
        default:
          console.error(status);
          toast.clientError();
          break;
      }
    } else if (!status) {
      toast.clientError();
    } else {
      if (selectedSession.value?.iat === user.account?.session.iat) {
        await user.logout();
      } else {
        selectedSession.value = null;
        toast.show("Session deleted.");
        await fetchSessions();
      }
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
    if (status instanceof Cumulonimbus.ResponseError) {
      switch (status.code) {
        case "INVALID_SESSION_ERROR":
          toast.show("It appears that session doesn't exist anymore.");
          await fetchSessions();
          selectedSession.value = null;
          break;
        default:
          const handled = await defaultErrorHandler(status, router);
          if (!handled) {
            toast.clientError();
          }
      }
    } else if (!status) {
      toast.clientError();
    } else {
      if (selected.value.includes(user.account?.session.iat + "")) {
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
  selected.value = [];
  selecting.value = false;
}
</script>
