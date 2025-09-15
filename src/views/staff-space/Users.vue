<template>
  <h1>All Users</h1>
  <h2>A list of all users.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/staff" />
    <button
      v-if="!selecting"
      @click="selecting = true"
      :disabled="users.loading"
    >
      Select...
    </button>
    <template v-else>
      <button @click="cancelSelection" :disabled="users.loading">Cancel</button>
      <button @click="confirmModal!.show()" :disabled="users.loading">
        Delete Selected
      </button>
    </template>
  </div>

  <Paginator
    v-model="page"
    @page-change="fetchUsers"
    :item-count="users.data?.count || 0"
    :disabled="users.loading || !online"
  >
    <Online>
      <template v-if="!users.loading">
        <template v-if="!users.errored">
          <div
            v-if="users.data && users.data.count > 0"
            class="content-box-container grow"
          >
            <SelectableContentBox
              v-for="user in users.data.items"
              :title="user.username"
              :selecting="selecting"
              :selected="selected.includes(user.id)"
              :src="profileIcon"
              theme-safe
              :to="{ path: '/staff/user', query: { id: user.id } }"
              @click="onUserClick(user)"
            >
              <code v-text="user.id" />
            </SelectableContentBox>
          </div>
          <div v-else class="no-content-container">
            <h1>how</h1>
          </div>
        </template>
        <template v-else>
          <h1>Something went wrong.</h1>
          <button @click="fetchUsers">Retry</button>
        </template>
      </template>
      <SkeletonContentBoxes v-else />
    </Online>
  </Paginator>
  <FormModal
    ref="confirmModal"
    title="Are you sure?"
    @submit="deleteSelected"
    :disabled="users.loading"
  >
    <p>
      Are you sure you want to delete the selected users? This action cannot be
      undone. Enter your password to confirm.
    </p>
    <br />
    <input
      type="password"
      placeholder="Your Password"
      name="password"
      required
      autocomplete="off"
      :disabled="users.loading"
    />
  </FormModal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import FormModal from '@/components/FormModal.vue';
  import Online from '@/components/Online.vue';
  import Paginator from '@/components/Paginator.vue';
  import SelectableContentBox from '@/components/SelectableContentBox.vue';
  import SkeletonContentBoxes from '@/components/SkeletonContentBoxes.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import profileIcon from '@/assets/images/profile.svg';

  // Store Modules
  import { toastStore } from '@/stores/toast.js';
  import { usersStore } from '@/stores/staff-space/users.js';

  // External Modules
  import { ref, onMounted } from 'vue';
  import { useOnline } from '@/utils/ConnectivityCheck.js';
  import loadWhenOnline from '@/utils/loadWhenOnline.js';

  const users = usersStore(),
    page = ref(0),
    toast = toastStore(),
    selecting = ref(false),
    selected = ref<string[]>([]),
    online = useOnline(),
    confirmModal = ref<InstanceType<typeof FormModal>>();

  onMounted(async () =>
    loadWhenOnline(fetchUsers, !users.data || users.page !== page.value),
  );

  async function onUserClick(user: Cumulonimbus.Data.User) {
    if (selected.value.includes(user.id)) {
      selected.value = selected.value.filter((u) => u !== user.id);
    } else {
      selected.value.push(user.id);
    }
  }

  async function fetchUsers() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    window.scrollTo(0, 0);
    try {
      await users.getUsers(page.value);
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  async function deleteSelected({ password }: { password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const res = await users.deleteUsers(selected.value, password);
      if (res > -1) {
        toast.show(`Deleted ${res} users.`);
        selected.value = [];
        selecting.value = false;
        confirmModal.value!.hide();
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      toast.clientError();
    }
  }

  function cancelSelection() {
    selecting.value = false;
    selected.value = [];
  }
</script>
