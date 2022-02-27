<template>
  <ConfirmModal
    ref="modal"
    title="Change Domain"
    @confirm="confirmDomain"
    @deny="denyDomain"
    deny-closes-modal
    cancelable
  >
    <p>Select your choice below!</p>
    <form ref="form" @submit.prevent="confirmDomain">
      <input
        name="subdomain"
        type="text"
        maxlength="63"
        @beforeinput="validateSubdomain"
        placeholder="Subdomain"
        :disabled="!$data.subdomainCompatible"
      />
      <p>.</p>
      <select name="domain" @change="allowsSubdomains">
        <option
          v-for="domain in $data.domains"
          :key="domain.domain"
          :name="domain.domain"
          v-text="domain.domain"
        />
      </select>
    </form>
  </ConfirmModal>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import App from '@/App.vue';

  @Options({
    components: {
      ConfirmModal
    },
    data() {
      return {
        domains: [],
        subdomainCompatible: false
      };
    },
    props: {
      domain: {
        type: String,
        default: 'alekeagle.me'
      },
      subdomain: {
        type: String,
        default: null
      }
    },
    emits: ['confirm', 'decline', 'error']
  })
  export default class DomainModal extends Vue {
    declare $data: {
      domains: Cumulonimbus.Data.Domain[];
      subdomainCompatible: boolean;
    };
    declare $props: {
      domain: string;
      subdomain: string;
    };

    declare $refs: {
      modal: ConfirmModal;
      form: HTMLFormElement;
    };

    async getDomains() {
      const domains = await (this.$store.state.client as Client).getDomains();
      this.$data.domains = domains.items;
    }

    denyDomain() {
      this.$emit('decline');
    }

    confirmDomain() {
      this.$emit('confirm', this.selection);
    }

    validateSubdomain(event: Event) {
      if ((event as InputEvent).data === null) return;
      const input = event.target as HTMLInputElement;
      const r = /[a-z0-9-]+/;
      if (input.value.length >= 63) {
        event.preventDefault();
        return;
      }
      if (!r.test((event as InputEvent).data as string)) event.preventDefault();
      if ((event as InputEvent).data === ' ') {
        let curPos = input.selectionStart as number + 1;
        input.value = input.value.substring(0, curPos - 1) + '-' + input.value.substring(curPos - 1, input.value.length);
        input.setSelectionRange(curPos, curPos);
      }
    }

    allowsSubdomains(event: Event) {
      const select = event.target as HTMLSelectElement;
      const domain = select.value;
      const domainObject = this.$data.domains.find(d => d.domain === domain);
      this.$data.subdomainCompatible =
        domainObject?.allowsSubdomains as boolean;
      if (!this.$data.subdomainCompatible)
        (this.$parent?.$parent?.$parent as App).temporaryToast(
          'This domain does not allow subdomains.',
          5000
        );
    }

    async show() {
      this.$refs.modal.show();
      try {
        await (this.$parent?.$parent?.$parent as App).isLoggedIn();
        await this.getDomains();
      } catch (error) {
        this.$emit('error', error);
      }
      const domainField = this.$refs.form.querySelector(
          '[name="domain"]'
        ) as HTMLSelectElement,
        subdomainField = this.$refs.form.querySelector(
          '[name="subdomain"]'
        ) as HTMLInputElement;

      if (this.$props.subdomain) {
        subdomainField.value = this.$props.subdomain;
      }
      domainField.value = this.$props.domain;
      const domainObject = this.$data.domains.find(
        d => d.domain === this.$props.domain
      );
      this.$data.subdomainCompatible =
        domainObject?.allowsSubdomains as boolean;
    }

    hide() {
      this.$refs.modal.hide();
    }

    get selection() {
      const data = new FormData(this.$refs.form);
      return {
        domain: data.get('domain'),
        subdomain:
          data.get('subdomain') === '' || !this.$data.subdomainCompatible
            ? null
            : data.get('subdomain')
      };
    }
  }
</script>

<style>
  input[type='text'][name='subdomain'] {
    text-align: right;
  }

  select[name='domain'],
  input[type='text'][name='subdomain'] {
    width: 30vw;
  }

  input[type='text'][name='subdomain'] + p {
    display: inline;
    font-weight: 900;
    font-size: xx-large;
    margin: 0 5px;
  }
</style>
