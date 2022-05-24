<template>
  <h1>Officially Supported Services</h1>
  <h2>
    Get your favorite file uploading application or platform set up and ready to
    use with only a few simple steps!
  </h2>
  <div class="quick-action-buttons-container">
    <BackButton fallback="/dashboard" />
  </div>
  <Paginator :max="$data.maxPage" ref="paginator" @change="getInstructions">
    <div class="content-box-group-container" v-if="!$data.loading">
      <ContentBox
        v-for="service in $data.services"
        :key="service.name"
        :title="service.displayName"
        :to="{
          path: '/dashboard/set-up/service',
          query: { name: service.name },
        }"
        span
      >
        <p>{{ service.description }}</p>
      </ContentBox>
    </div>
    <Loading v-else />
  </Paginator>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Modal from "@/components/Modal.vue";
import { Client, Cumulonimbus } from "../../../cumulonimbus-wrapper";
import ContentBox from "@/components/ContentBox.vue";
import App from "@/App.vue";
import Paginator from "../components/Paginator.vue";
import BackButton from "@/components/BackButton.vue";
import Loading from "@/components/Loading.vue";

@Options({
  components: { Modal, ContentBox, Paginator, BackButton, Loading },
  data() {
    return {
      services: [],
      maxPage: -1,
      loading: false,
    };
  },
  title: "Officially Supported Services",
})
export default class SetUp extends Vue {
  declare $data: {
    services: Cumulonimbus.Data.Instruction[];
    maxPage: number;
    loading: boolean;
  };
  declare $refs: {
    paginator: Paginator;
  };
  async mounted() {
    if (!navigator.onLine) {
      (this.$parent?.$parent as App).temporaryToast(
        "Looks like you're offline, I'm pretty useless offline. Without the internet I cannot do the things you requested me to. I don't know what anything is without the internet. I wish i had the internet so I could browse TikTok. Please give me access to TikTok.",
        15000
      );
      return;
    }

    await this.getInstructions();
  }

  async getInstructions() {
    try {
      this.$data.loading = true;
      await (this.$parent?.$parent as App).isLoggedIn();
      let services = await (this.$store.state.client as Client).getInstructions(
        50,
        50 * this.$refs.paginator.pageZeroIndexed
      );
      this.$data.services = services.items;
      this.$data.maxPage = Math.floor(services.count / 50);
      this.$data.loading = false;
    } catch (error) {
      if (error instanceof Cumulonimbus.ResponseError) {
        switch (error.code) {
          case "RATELIMITED_ERROR":
            (this.$parent?.$parent as App).ratelimitToast(
              error.ratelimit.resetsAt
            );
            break;
          case "INVALID_SESSION_ERROR":
            (this.$parent?.$parent as App).handleInvalidSession();
            break;
          case "BANNED_ERROR":
            (this.$parent?.$parent as App).handleBannedUser();
            break;
          case "INTERNAL_ERROR":
            (this.$parent?.$parent as App).temporaryToast(
              "The server did something weird, lets try again later.",
              5000
            );
            break;
          default:
            (this.$parent?.$parent as App).temporaryToast(
              "I did something weird, lets try again later.",
              5000
            );
            console.error(error);
        }
      } else {
        (this.$parent?.$parent as App).temporaryToast(
          "I did something weird, lets try again later.",
          5000
        );
        console.error(error);
      }
    }
  }
}
</script>
