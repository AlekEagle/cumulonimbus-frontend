<template>
  <div class="content-box-container">
    <ContentBox title="Display basic modal" @click="basicModal!.show()">
      Display basic modal
    </ContentBox>
    <Modal ref="basicModal" title="I am a basic modal">
      I do basic things.
      <template #footer>
        <button @click="basicModal!.hide()">Close</button>
      </template>
    </Modal>
    <ContentBox
      title="Display basic dismissible modal"
      @click="basicDismissibleModal!.show()"
    >
      Display basic dismissible modal
    </ContentBox>
    <Modal
      ref="basicDismissibleModal"
      title="I am a basic dismissible modal"
      dismissible
      @close="toast.show('basic dismissible modal closed non-programmatically')"
    >
      I do basic things.
      <template #footer>
        <button @click="basicDismissibleModal!.hide()">
          Close without event
        </button>
      </template>
    </Modal>
    <ContentBox title="Display confirm modal" @click="confirmModal!.show()">
      Display confirm modal
    </ContentBox>
    <ConfirmModal
      ref="confirmModal"
      title="I am a confirm modal"
      @submit="
  (choice: boolean) => { toast.show(`you do${choice ? '' : 'n\'t'} like men`) }
      "
      close-on-submit
      deny-button="No"
      confirm-button="Yes"
    >
      do you like men?
    </ConfirmModal>
    <ContentBox title="Display danii's dumb modal" @click="meow!.show()">
      Display danii's dumb modal
    </ContentBox>
    <ConfirmModal
      ref="meow"
      title="Meow mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr mrap."
      @submit="meowMeow"
      close-on-submit
    >
      Meow mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr mrap Meow mroaw
      mrow meow nyah meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow meow
      nyah meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah meow
      meoow mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow mrowwww
      mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr
      mrap Meow mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr mrap Meow
      mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow
      meow nyah meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah
      meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow
      mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow mrowwww
      mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr
      mrap Meow mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr mrap Meow
      mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow
      meow nyah meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah
      meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow
      mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow mrowwww
      mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr
      mrap Meow mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr mrap Meow
      mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow
      meow nyah meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah
      meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow
      mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow mrowwww
      mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr
      mrap Meow mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr mrap Meow
      mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow
      meow nyah meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah
      meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow
      mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow mrowwww
      mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr
      mrap Meow mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr mrap Meow
      mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow
      meow nyah meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah
      meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow
      mrowwww mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow mrowwww
      mmrrppurrr mrap Meow mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr
      mrap Meow mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr mrap Meow
      mroaw mrow meow nyah meow meoow mrowwww mmrrppurrr mrap Meow mroaw mrow
      meow nyah meow meoow mrowwww mmrrppurrr mrap
    </ConfirmModal>
    <ContentBox title="Display form modal" @click="formModal!.show()">
      Display form modal
    </ContentBox>
    <FormModal
      ref="formModal"
      title="I am a form modal"
      @submit="(data) => toast.show(JSON.stringify(data))"
      @cancel="toast.show('cancelled form modal')"
      close-on-submit
    >
      <input type="text" name="text" placeholder="Text" />
      <br />
      <input type="number" name="number" placeholder="Number" />
      <br />
      <input type="password" name="password" placeholder="Password" />
      <br />
      <input type="email" name="email" placeholder="Email" />
      <br />
      <input type="url" name="url" placeholder="URL" />
      <br />
      <input type="tel" name="tel" placeholder="Telephone" />
      <br />
      <input type="search" name="search" placeholder="Search" />
      <br />
      <input type="date" name="date" />
      <br />
      <input type="time" name="time" />
      <br />
      <input type="datetime-local" name="datetime-local" />
      <br />
      <input type="month" name="month" />
      <br />
      <input type="week" name="week" />
      <br />
      <input type="color" name="color" />
      <br />
      <input type="range" name="range" />
      <br />
      <textarea name="textarea" placeholder="Textarea"></textarea>
      <br />
      <select name="select">
        <option value="">Select</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </select>
      <br />
      <!-- multiselect -->
      <select name="multiselect" multiple>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </select>

      <Switch name="switch">Switch</Switch>
    </FormModal>
    <ContentBox title="Display domain modal" @click="domainModal!.show()">
      Display domain modal
    </ContentBox>
    <DomainModal
      ref="domainModal"
      @submit="(data:any) => toast.show(JSON.stringify(data))"
      @cancel="toast.show('cancelled domain modal')"
      domain="alekeagle.me"
    />
    <ContentBox
      title="Display Fullscreen Loading Message Modal"
      @click="fullscreenLoadingMessageModal!.show()"
    >
      Display Fullscreen Loading Message Modal
    </ContentBox>
    <ConfirmModal
      ref="fullscreenLoadingMessageModal"
      title="Fullscreen Loading Message Modal"
      @submit="fullscreenLoadingMessageModalHandler"
    >
      I am a modal that will display a fullscreen loading message when
      confirmed.
    </ConfirmModal>
  </div>
  <FullscreenLoadingMessage ref="fullscreenLoadingMessage" />
</template>

<script lang="ts" setup>
  // Vue Components
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import ContentBox from '@/components/ContentBox.vue';
  import DomainModal from '@/components/DomainModal.vue';
  import FormModal from '@/components/FormModal.vue';
  import FullscreenLoadingMessage from '@/components/FullscreenLoadingMessage.vue';
  import Modal from '@/components/Modal.vue';
  import Switch from '@/components/Switch.vue';

  // In-House Modules
  import { wait } from '@/utils/wait';

  // Store Modules
  import { toastStore } from '@/stores/toast';

  // External Modules
  import { ref } from 'vue';

  const toast = toastStore(),
    basicModal = ref<InstanceType<typeof Modal>>(),
    basicDismissibleModal = ref<InstanceType<typeof Modal>>(),
    confirmModal = ref<InstanceType<typeof ConfirmModal>>(),
    meow = ref<InstanceType<typeof ConfirmModal>>(),
    formModal = ref<InstanceType<typeof FormModal>>(),
    domainModal = ref<InstanceType<typeof DomainModal>>(),
    fullscreenLoadingMessageModal = ref<InstanceType<typeof ConfirmModal>>(),
    fullscreenLoadingMessage =
      ref<InstanceType<typeof FullscreenLoadingMessage>>();

  function meowMeow(choice: boolean) {
    function* allNodes(node: Node): Generator<Node> {
      for (const child of Array.from(node.childNodes)) {
        yield child;
        yield* allNodes(child);
      }
    }

    function hehe() {
      let count = 0;
      for (const node of allNodes(document)) {
        if (node instanceof Text) {
          let text = node.textContent ?? '';
          let match;
          while ((match = text.match(/  /))) {
            // this needs to be put in a museum for copilot
            //console.log(`Replaced ${match[0]} with ${choice ? "meow" : "nyah"}`);
            count++;

            node.textContent = text = `${text.substring(
              0,
              match.index,
            )}\t${text.substring(match.index! + match[0].length)}`;
          }
        }
      }
      toast.show(
        `Replaced ${count} space-tabs with real tabs.\nTabs are superior, don't @ me. - danii\nSilence - alek`,
      );
    }

    if (choice) hehe();
    else toast.show('Good job! you avoided hell!');
  }

  async function fullscreenLoadingMessageModalHandler(choice: boolean) {
    if (!choice) {
      await fullscreenLoadingMessageModal.value!.hide();
    } else {
      await fullscreenLoadingMessage.value!.show();
      await wait(5000);
      fullscreenLoadingMessageModal.value!.hide();
      await fullscreenLoadingMessage.value!.hide();
    }
  }
</script>
