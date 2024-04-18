<template>
  <h1>Second Factors</h1>
  <h2>Your registered second factors.</h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard/account" />
    <template v-if="!selecting">
      <button @click="selecting = true" :disabled="secondFactors.loading">
        Select...
      </button>
      <button @click="deleteAllSecondFactorsModal?.show()">Delete All</button>
      <button
        @click="beginRegenerateBackupCodes"
        :disabled="secondFactors.data ? secondFactors.data.count < 1 : true"
      >
        Regenerate Backup Codes
      </button>
    </template>
    <template v-else>
      <button @click="cancelSelection" :disabled="secondFactors.loading">
        Cancel Selection
      </button>
      <button
        @click="confirmDeleteMultipleModal?.show()"
        :disabled="secondFactors.loading"
      >
        Delete Selected
      </button>
    </template>
  </div>

  <Paginator
    v-model="page"
    @page-change="fetchSecondFactors"
    :item-count="secondFactors.data?.count || 0"
    :disabled="secondFactors.loading || !online"
  >
    <Online>
      <template v-if="!secondFactors.loading">
        <template v-if="!secondFactors.errored">
          <div
            v-if="secondFactors.data && secondFactors.data.count > 0"
            class="content-box-container"
          >
            <SelectableContentBox
              v-for="secondFactor in secondFactors.data.items"
              :key="secondFactor.id"
              :title="secondFactor.name"
              :selecting="selecting"
              :src="infoIcon"
              theme-safe
              :selected="selected.includes(secondFactor.id + '')"
              @click="onSecondFactorClick(secondFactor)"
            >
              Click me to manage this second factor.
            </SelectableContentBox>
            <ContentBox
              v-if="!selecting"
              theme-safe
              :src="plusIcon"
              @click="registerNewSecondFactorModal?.show()"
              title="Register New Second Factor"
            >
              Help increase your account security by registering a new second
              factor.
            </ContentBox>
          </div>
          <div v-else class="content-box-container">
            <ContentBox
              theme-safe
              :src="plusIcon"
              @click="registerNewSecondFactorModal?.show()"
              title="Register New Second Factor"
            >
              Help increase your account security by registering a new second
              factor.
            </ContentBox>
          </div>
        </template>
        <div class="no-content-container" v-else>
          <h1>Something went wrong.</h1>
          <button @click="fetchSecondFactors">Retry</button>
        </div>
      </template>
      <SkeletonContentBoxes v-else />
    </Online>
  </Paginator>

  <ConfirmModal
    ref="manageSecondFactorModal"
    :title="selectedFactor?.name"
    @submit="onManageSecondFactor"
    deny-button="Close"
    confirm-button="Remove"
  >
    <template v-if="!!selectedFactor">
      <span class="sb-code-label">
        <p>Type:</p>
        <code v-text="selectedFactor.type" />
      </span>
      <span class="sb-code-label">
        <p>Registered:</p>
        <code v-text="toDateString(new Date(selectedFactor.createdAt))" />
      </span>
      <span class="sb-code-label">
        <p>Last Updated:</p>
        <code v-text="toDateString(new Date(selectedFactor.updatedAt))" />
      </span>
      <span class="sb-code-label">
        <p>Last Used:</p>
        <code v-text="selectedFactorFuzzyLastUsedAt" />
      </span>
    </template>
    <LoadingMessage spinner v-else />
  </ConfirmModal>

  <FormModal
    ref="confirmDeleteModal"
    title="Are you sure?"
    @submit="deleteSecondFactor"
    :disabled="secondFactors.loading"
  >
    <p>
      Are you sure you want to delete the second factor
      <code v-text="selectedFactor?.name" />?
    </p>
    <p>Please enter your password to confirm.</p>
    <input
      type="password"
      placeholder="Your Password"
      name="password"
      required
      autocomplete="off"
      :disabled="secondFactors.loading"
    />
  </FormModal>

  <FormModal
    ref="confirmDeleteMultipleModal"
    title="Are you sure?"
    @submit="deleteSecondFactors"
    :disabled="secondFactors.loading"
  >
    <p>
      Are you sure you want to delete these {{ selected.length }} second
      factors?
    </p>
    <p>Please enter your password to confirm.</p>

    <input
      type="password"
      placeholder="Your Password"
      name="password"
      required
      autocomplete="off"
      :disabled="secondFactors.loading"
    />
  </FormModal>

  <FormModal
    ref="deleteAllSecondFactorsModal"
    title="Are you sure?"
    @submit="deleteAllSecondFactors"
    :disabled="secondFactors.loading"
  >
    <p> Are you sure you want to delete all your second factors? </p>
    <p>Please enter your password to confirm.</p>

    <input
      type="password"
      placeholder="Your Password"
      name="password"
      required
      autocomplete="off"
      :disabled="secondFactors.loading"
    />
  </FormModal>

  <Modal
    ref="registerNewSecondFactorModal"
    title="New Second Factor"
    close-button="Nevermind"
    dismissible
  >
    <p>What type of second factor would you like to add to your account?</p>
    <br />
    <p>
      <strong>Authenticator App:</strong> An authenticator app is an app that
      will generate a 6 digit code every 30 seconds, all you have to do is enter
      one of those codes when we ask for one.
    </p>
    <br />
    <p>
      <strong>Security Key:</strong> A security key is a physical device that
      you can plug into your computer or tap on your phone to verify your
      identity.
    </p>
    <br />
    <div class="modal-footer">
      <button @click="beginTOTPRegistration">Authenticator App</button>
      <button @click="beginWebAuthnRegistration">Security Key</button>
    </div>
  </Modal>

  <FormModal
    ref="secondFactorPasswordModal"
    title="Enter Your Password"
    @submit="registerNewSecondFactor"
    :disabled="secondFactors.loading"
  >
    <p>
      Awesome, let's get you set up with a new second factor. Please enter your
      password to confirm.
    </p>
    <input
      type="password"
      placeholder="Your Password"
      name="password"
      required
      autocomplete="off"
      :disabled="secondFactors.loading"
    />
  </FormModal>
  <FormModal
    ref="secondFactorRegistrationModal"
    title="New Second Factor"
    @submit="completeSecondFactorRegistration"
    :disabled="secondFactors.loading"
    confirm-button="Register"
  >
    <p>Time Remaining: <code v-text="registrationTimeout" /></p>
    <template v-if="registrationData!.type === 'totp'">
      <p>
        Please click or scan the QR code below to register your new
        authenticator app.
      </p>
      <a :href="totpRegisterUrl!" target="_blank" rel="noopener noreferrer">
        <img :src="qrCode!" alt="QR Code" />
      </a>
      <p>
        If you are unable to scan the QR code, you can manually enter the
        following code into your authenticator app:
      </p>
      <code v-text="registrationData?.secret" />

      <p>
        Once you've completed that, please enter the code generated by your
        authenticator app below.
      </p>
      <input
        type="text"
        placeholder="Your Code"
        name="code"
        required
        autocomplete="off"
        :disabled="secondFactors.loading"
        maxlength="6"
      />
      <p>
        And finally, please give your new second factor a name. This will help
        you identify it in the future.
      </p>
      <input
        type="text"
        placeholder="Name"
        name="name"
        required
        autocomplete="off"
        :disabled="secondFactors.loading"
      />
    </template>
    <template v-else-if="factorTypeToRegister === 'webauthn'">
      <p>
        Give your new security key a name. This will help you identify it in the
        future.
      </p>
      <input
        type="text"
        placeholder="Name"
        name="name"
        required
        autocomplete="off"
        :disabled="secondFactors.loading"
      />
      <p>
        When you're ready, click the register button to register your new
        security key.
      </p>
    </template>
    <template v-else>
      <h1> You shouldn't even be here. </h1>
    </template>
  </FormModal>

  <Modal ref="backupCodesModal" title="Backup Codes">
    <p>
      Below are your new backup codes. Please store these in a safe place. You
      will not be able to view these codes again.
    </p>

    <pre><code v-text="registrationCompleteData!.codes!.join('\n')" /></pre>
    <template #footer>
      <button @click="closeBackupCodesModal">Close</button>
      <button @click="saveBackupCodes">Save</button>
      <button @click="printBackupCodes">Print</button>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
  // Vue Components
  import BackButton from '@/components/BackButton.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import Paginator from '@/components/Paginator.vue';
  import Online from '@/components/Online.vue';
  import SelectableContentBox from '@/components/SelectableContentBox.vue';
  import SkeletonContentBoxes from '@/components/SkeletonContentBoxes.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import FormModal from '@/components/FormModal.vue';
  import LoadingMessage from '@/components/LoadingMessage.vue';
  import Modal from '@/components/Modal.vue';

  // In-House Modules
  import Cumulonimbus from 'cumulonimbus-wrapper';
  import infoIcon from '@/assets/images/info.svg';
  import plusIcon from '@/assets/images/plus.svg';
  import loadWhenOnline from '@/utils/loadWhenOnline';
  import toDateString from '@/utils/toDateString';
  import { useFuzzyTimeString } from '@/utils/time';

  // Store Modules
  import { secondFactorsStore } from '@/stores/user-space/secondFactors';
  import { toastStore } from '@/stores/toast';
  import { userStore } from '@/stores/user';

  // External Modules
  import { ref, onMounted, computed } from 'vue';
  import { useOnline } from '@vueuse/core';
  import QRCode from 'qrcode';
  import { startRegistration } from '@simplewebauthn/browser';

  const secondFactors = secondFactorsStore(),
    toast = toastStore(),
    user = userStore(),
    online = useOnline(),
    selecting = ref(false),
    selected = ref<string[]>([]),
    selectedFactor = ref<Cumulonimbus.Data.SecondFactor | null>(null),
    selectedFactorFuzzyLastUsedAt = computed(() =>
      selectedFactor.value?.usedAt
        ? useFuzzyTimeString(ref(new Date(selectedFactor.value.usedAt)))
        : 'Not yet...',
    ),
    factorTypeToRegister = ref<'totp' | 'webauthn' | 'backup' | null>(null),
    registrationData = ref<
      | Cumulonimbus.Data.SecondFactorTOTPRegistration
      | Cumulonimbus.Data.SecondFactorWebAuthnRegistration
      | null
    >(null),
    registrationTimeoutDate = computed(
      () => new Date((registrationData.value?.exp ?? 0) * 1000),
    ),
    registrationTimeout = useFuzzyTimeString(registrationTimeoutDate),
    registrationCompleteData = ref<
      | Cumulonimbus.Data.SecondFactorRegisterSuccess
      | Cumulonimbus.Data.SecondFactorBackupRegisterSuccess
      | null
    >(null),
    totpRegisterUrl = ref<string | null>(null),
    qrCode = ref<string | null>(null),
    page = ref(0),
    manageSecondFactorModal = ref<InstanceType<typeof ConfirmModal>>(),
    confirmDeleteMultipleModal = ref<InstanceType<typeof FormModal>>(),
    confirmDeleteModal = ref<InstanceType<typeof FormModal>>(),
    deleteAllSecondFactorsModal = ref<InstanceType<typeof FormModal>>(),
    registerNewSecondFactorModal = ref<InstanceType<typeof Modal>>(),
    secondFactorPasswordModal = ref<InstanceType<typeof FormModal>>(),
    secondFactorRegistrationModal = ref<InstanceType<typeof FormModal>>(),
    backupCodesModal = ref<InstanceType<typeof Modal>>();

  async function fetchSecondFactors() {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    window.scrollTo(0, 0);
    try {
      await secondFactors.getSecondFactors(page.value);
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function onSecondFactorClick(
    secondFactor: Cumulonimbus.Data.SecondFactor,
  ) {
    if (selecting.value) {
      if (selected.value.includes(secondFactor.id + '')) {
        selected.value = selected.value.filter(
          (id) => id !== secondFactor.id + '',
        );
      } else {
        selected.value.push(secondFactor.id + '');
      }
    } else {
      selectedFactor.value = (
        await user.client!.getSelfSecondFactor(secondFactor.id)
      ).result;

      manageSecondFactorModal.value?.show();
    }
  }

  onMounted(async () => {
    loadWhenOnline(
      fetchSecondFactors,
      !secondFactors.data || secondFactors.page !== page.value,
    );
  });

  async function deleteSecondFactor({ password }: { password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const result = await secondFactors.deleteSecondFactor(
        selectedFactor.value!.id,
        password,
      );
      if (result) {
        toast.show('Second factor deleted.');
        confirmDeleteModal.value?.hide();
        await fetchSecondFactors();
      } else {
        toast.clientError();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function deleteSecondFactors({ password }: { password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      const count = await secondFactors.deleteSecondFactors(
        selected.value,
        password,
      );
      if (count < 0) {
        toast.clientError();
      } else {
        toast.show(`${count} second factor(s) deleted.`);
        confirmDeleteMultipleModal.value?.hide();
        cancelSelection();
        await fetchSecondFactors();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function deleteAllSecondFactors({ password }: { password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      await secondFactors.deleteAllSecondFactors(password);
      await fetchSecondFactors();
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function onManageSecondFactor(choice: boolean) {
    await manageSecondFactorModal.value?.hide();
    if (choice) {
      confirmDeleteModal.value?.show();
    }
  }

  function cancelSelection() {
    selecting.value = false;
    selected.value = [];
  }

  async function beginTOTPRegistration() {
    factorTypeToRegister.value = 'totp';
    await registerNewSecondFactorModal.value?.hide();
    await secondFactorPasswordModal.value?.show();
  }

  async function beginWebAuthnRegistration() {
    factorTypeToRegister.value = 'webauthn';
    await registerNewSecondFactorModal.value?.hide();
    await secondFactorPasswordModal.value?.show();
  }

  async function beginRegenerateBackupCodes() {
    factorTypeToRegister.value = 'backup';
    await registerNewSecondFactorModal.value?.hide();
    await secondFactorPasswordModal.value?.show();
  }

  async function registerNewSecondFactor({ password }: { password: string }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      switch (factorTypeToRegister.value) {
        case 'totp':
          registrationData.value = await secondFactors.beginTOTPRegistration(
            password,
          );
          if (!registrationData.value) {
            throw new Error('Failed to begin TOTP registration.');
          }
          await secondFactorPasswordModal.value?.hide();
          totpRegisterUrl.value = `otpauth://totp/${
            user.account!.user.username
          }?secret=${registrationData.value.secret}&algorithm=${
            registrationData.value.algorithm
          }&digits=${registrationData.value.digits}&period=${
            registrationData.value.period
          }&issuer=Cumulonimbus`;
          // Generate QR Code
          qrCode.value = await QRCode.toDataURL(totpRegisterUrl.value);
          await secondFactorRegistrationModal.value?.show();
          break;
        case 'webauthn':
          registrationData.value =
            await secondFactors.beginWebAuthnRegistration(password);
          await secondFactorPasswordModal.value?.hide();
          await secondFactorRegistrationModal.value?.show();
          break;
        case 'backup':
          registrationCompleteData.value =
            await secondFactors.regenerateBackupCodes(password);
          await secondFactorPasswordModal.value?.hide();
          await backupCodesModal.value?.show();
          break;
        default:
          toast.show("You're are ddumb.");
          throw new Error('Invalid factor type to register.');
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  async function completeSecondFactorRegistration({
    code,
    name,
  }: { name: string } & {
    code: string;
    response: undefined;
  }) {
    if (!online.value) {
      toast.connectivityOffline();
      return;
    }
    try {
      switch (registrationData.value!.type) {
        case 'totp':
          if (!code) {
            throw new Error('No code provided.');
          }
          registrationCompleteData.value =
            await secondFactors.completeTOTPRegistration(
              registrationData.value!.token,
              name,
              code,
            );

          break;
        case 'webauthn':
          try {
            const response = await startRegistration(registrationData.value!);
            if (!response) {
              throw new Error('No response provided.');
            }
            registrationCompleteData.value =
              await secondFactors.completeWebAuthnRegistration(
                registrationData.value!.token,
                name,
                response,
              );
          } catch (e) {
            console.error(e);
            toast.clientError();
          }
          break;
        default:
          throw new Error('Invalid factor type to register.');
      }
      await fetchSecondFactors();
      await secondFactorRegistrationModal.value?.hide();
      factorTypeToRegister.value = null;
      registrationData.value = null;
      if (registrationCompleteData.value?.codes) {
        backupCodesModal.value?.show();
      }
    } catch (e) {
      console.error(e);
      toast.clientError();
    }
  }

  function closeBackupCodesModal() {
    backupCodesModal.value?.hide();
    registrationCompleteData.value = null;
  }

  function saveBackupCodes() {
    const blob = new Blob([registrationCompleteData.value!.codes!.join('\n')], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cumulonimbus-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  function printBackupCodes() {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(
        `<pre>${registrationCompleteData.value!.codes!.join('\n')}</pre>`,
      );
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }
</script>
