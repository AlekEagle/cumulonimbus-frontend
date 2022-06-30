<template>
  <h1>Testing</h1>
  <h2>Uhh, meow?</h2>
  <div class="quick-action-buttons-container">
    <router-link to="/">
      <button>Home</button>
    </router-link>
  </div>

  <div class="test-select">
    <select v-model="currentItem">
      <option v-for="(name, id) in Items" :value="id" v-text="name" />
    </select>
  </div>

  <!--  BASIC_EMPHASIZED_BOX  -->

  <EmphasizedBox v-if="currentItem === CurrentItem.BASIC_EMPHASIZED_BOX">
    <h2>I am a box that is emphasized.</h2>
  </EmphasizedBox>

  <!--  CONTENT_BOXES  -->

  <div
    v-if="currentItem === CurrentItem.CONTENT_BOXES"
    class="content-box-container"
  >
    <ContentBox />
    <ContentBox title="Content Box w/ title" />
    <ContentBox>Content Box w/ content</ContentBox>
    <ContentBox title="Content Box w/ title & content">
      Content Box w/ title & content
    </ContentBox>
    <ContentBox
      title="Content Box w/ title, content & local icon"
      :src="cumulonimbusIcon"
    >
      Content Box w/ title, content & local icon
    </ContentBox>
    <ContentBox
      title="Content Box w/ title, content & theme safe local icon"
      :src="cumulonimbusIcon"
      theme-safe
    >
      Content Box w/ title, content & theme safe local icon
    </ContentBox>
    <ContentBox
      title="Content Box w/ title, content & external icon"
      src="https://alekeagle.com/alerkpog.png"
    >
      Content Box w/ title, content & external icon
    </ContentBox>
    <ContentBox
      title="Content Box w/ title, content & theme safe external icon"
      src="https://alekeagle.com/alerkpog.png"
      theme-safe
    >
      Content Box w/ title, content & theme safe external icon
    </ContentBox>
    <ContentBox
      title="Content Box w/ title, content & link"
      to="/testing/hush/dont/touch/sink"
    >
      Content Box w/ title, content & link
    </ContentBox>
    <ContentBox
      title="Content Box w/ title, content & click handler"
      @click="toast.show('click')"
    >
      Content Box w/ title, content & click handler
    </ContentBox>
    <ContentBox
      title="Disabled Content Box w/ link"
      to="/testing/hush/dont/touch/sink"
      disabled
    >
      Disabled Content Box w/ link
    </ContentBox>
    <ContentBox
      title="Disabled Content Box w/ click handler"
      @click="toast.show('you will never see this')"
      disabled
    >
      Disabled Content Box w/ click handler
    </ContentBox>
  </div>
  <div
    v-if="currentItem === CurrentItem.CONTENT_BOXES"
    class="content-box-container"
  >
    <ContentBox
      title="Lonely Content Box"
      @click="toast.show('I am lonely :(')"
    >
      Lonely Content Box
    </ContentBox>
  </div>

  <!--  FORM_EMPHASIZED_BOX  -->

  <EmphasizedBox v-if="currentItem === CurrentItem.FORM_EMPHASIZED_BOX">
    <h2>I am a box that is emphasized with a form inside.</h2>
    <Form
      @submit="data => toast.show(JSON.stringify(data))"
      ref="emphasizedForm"
    >
      <input type="text" placeholder="A text box" name="text" />
      <br />
      <input type="password" placeholder="A password box" name="password" />
      <br />
      <input type="number" placeholder="A number box" name="number" />
      <br />
      <input type="email" placeholder="An email box" name="email" />
      <br />
      <Switch name="switch">A switch</Switch>
      <br />
      <button>Submit</button>
    </Form>
    <button @click="emphasizedForm!.submit()">Submit outside of form</button>
  </EmphasizedBox>

  <!--  MODALS  -->

  <div v-if="currentItem === CurrentItem.MODALS" class="content-box-container">
    <ContentBox title="Display basic modal" @click="basicModal!.show()">
      Display basic modal
    </ContentBox>
    <Modal ref="basicModal" title="I am a basic modal">
      I do basic things.
      <template v-slot:footer>
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
      <template v-slot:footer>
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
      @submit="data => toast.show(JSON.stringify(data))"
      @cancel="toast.show('cancelled form modal')"
      close-on-submit
    >
      <input type="text" placeholder="A text box" name="text" />
      <br />
      <input type="password" placeholder="A password box" name="password" />
      <br />
      <input type="number" placeholder="A number box" name="number" />
      <br />
      <input type="email" placeholder="An email box" name="email" />
      <br />
      <Switch name="switch">A switch</Switch>
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
  </div>
  <!--  PAGINATOR  -->
  <template v-if="currentItem === CurrentItem.PAGINATOR">
    <div class="paginator-container">
      <Paginator
        v-model="paginatorPage"
        :min="0"
        :max="4"
        @page-change="toast.show('User changed page')"
      />
    </div>
  </template>
  <!--  LOADING  -->
  <template v-if="currentItem === CurrentItem.LOADING">
    <EmphasizedBox>
      <Loading />
    </EmphasizedBox>
  </template>
  <!--  LOADING_BLURB  -->
  <template v-if="currentItem === CurrentItem.LOADING_BLURB">
    <EmphasizedBox>
      <LoadingBlurb />
    </EmphasizedBox>
  </template>
  <!--  FULLSCREEN_LOADING_BLURB  -->
  <template v-if="currentItem === CurrentItem.FULLSCREEN_LOADING_BLURB">
    <div class="content-box-container">
      <ContentBox title="Show fullscreen loading blurb for 5s" @click="fsb">
        Show fullscreen loading blurb for 5s
      </ContentBox>
      <ContentBox
        title="Show fullscreen loading blurb forever"
        @click="fullscreenLoadingBlurb!.show()"
      >
        Show fullscreen loading blurb forever
      </ContentBox>
    </div>
    <FullscreenLoadingBlurb ref="fullscreenLoadingBlurb" />
  </template>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { toastStore } from '@/stores/toast';
  import ContentBox from '@/components/ContentBox.vue';
  import EmphasizedBox from '@/components/EmphasizedBox.vue';
  import Form from '@/components/Form.vue';
  import Switch from '@/components/Switch.vue';
  import Modal from '@/components/Modal.vue';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import FormModal from '@/components/FormModal.vue';
  import DomainModal from '@/components/DomainModal.vue';
  import Paginator from '@/components/Paginator.vue';
  import Loading from '@/components/Loading.vue';
  import LoadingBlurb from '@/components/LoadingBlurb.vue';
  import FullscreenLoadingBlurb from '@/components/FullscreenLoadingBlurb.vue';
  import { wait } from '@/utils/wait';
  import cumulonimbusIcon from '@/assets/images/Cumulonimbus.svg';

  enum CurrentItem {
    CONTENT_BOXES,
    BASIC_EMPHASIZED_BOX,
    FORM_EMPHASIZED_BOX,
    MODALS,
    PAGINATOR,
    LOADING,
    LOADING_BLURB,
    FULLSCREEN_LOADING_BLURB
  }

  const Items = computed(() => {
      return Object.keys(CurrentItem).filter(item => {
        return isNaN(Number(item));
      });
    }),
    currentItem = ref<CurrentItem>(CurrentItem.CONTENT_BOXES),
    toast = toastStore(),
    emphasizedForm = ref<typeof Form>(),
    basicModal = ref<typeof Modal>(),
    basicDismissibleModal = ref<typeof Modal>(),
    confirmModal = ref<typeof ConfirmModal>(),
    meow = ref<typeof ConfirmModal>(),
    formModal = ref<typeof FormModal>(),
    domainModal = ref<typeof DomainModal>(),
    paginatorPage = ref<number>(0),
    fullscreenLoadingBlurb = ref<typeof FullscreenLoadingBlurb>();

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
              match.index
            )}\t${text.substring(match.index! + match[0].length)}`;
          }
        }
      }
      toast.show(
        `Replaced ${count} space-tabs with real tabs.\nTabs are superior, don't @ me. - danii\nSilence fuckboy - alek`
      );
    }

    if (choice) hehe();
    else toast.show('Good job! you avoided hell!');
  }

  async function fsb() {
    await fullscreenLoadingBlurb.value!.show();
    await wait(5000);
    fullscreenLoadingBlurb.value!.hide();
  }
</script>

<style>
  .test-select {
    margin: 0 0 1rem;
  }
</style>
