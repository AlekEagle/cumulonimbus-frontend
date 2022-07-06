<template>
  <h1>Setup Guides</h1>
</template>

<script lang="ts" setup>
  import SelectableContentBox from '@/components/SelectableContentBox.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import Paginator from '@/components/Paginator.vue';
  import BackButton from '@/components/BackButton.vue';
  import Switch from '@/components/Switch.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import FormModal from '@/components/FormModal.vue';
  import { userStore } from '@/stores/user';
  import { toastStore } from '@/stores/toast';
  import { instructionsStore } from '@/stores/staff-space/instructions';
  import toLogin from '@/utils/toLogin';
  import { useOnline } from '@vueuse/core';
  import { ref, watch, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import gearIcon from '@/assets/images/gear.svg';
  import toDateString from '@/utils/dateString';

  const online = useOnline(),
    router = useRouter(),
    user = userStore(),
    toast = toastStore(),
    instructions = instructionsStore(),
    selecting = ref(false),
    selected = ref<string[]>([]),
    page = ref(0),
    manageInstructionModal = ref<typeof ConfirmModal>(),
    bulkDeleteInstructionModal = ref<typeof ConfirmModal>(),
    deleteInstructionModal = ref<typeof ConfirmModal>(),
    createInstructionModal = ref<typeof FormModal>(),
    selectedInstruction = ref<Cumulonimbus.Data.Instruction | null>(null);

  async function fetchInstructions() {
    if (!online) {
      toast.connectivity();
      return;
    }
    window.scrollTo(0, 0);
    try {
      const status = await instructions.getInstructions(page.value);
      if (status instanceof Cumulonimbus.ResponseError) {
        switch (status.code) {
          case 'BANNED_ERROR':
            toast.banned();
            user.logout(true);
            router.push('/');
            break;
          case 'RATELIMITED_ERROR':
            toast.rateLimit(status);
            break;
          case 'INVALID_SESSION_ERROR':
            toast.session();
            await toLogin(router);
            break;
          case 'INTERNAL_ERROR':
            toast.serverError();
            break;
          case 'GENERIC_ERROR':
          default:
            console.error(status);
            toast.clientError();
            break;
        }
      } else if (!status) {
        toast.clientError();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }
</script>
