<template>
  <ConfirmModal
    ref="modal"
    title="Change Domain"
    @confirm="confirmDomain"
    @deny="denyDomain"
    deny-closes-modal
    cancelable
  >
    <p>Customize your domain here!</p>
    <form ref="form" @submit.prevent="confirmDomain" v-if="$data.loaded">
      <div class="fancy-domain-selector-container">
        <div v-if="$data.subdomainCompatible" class="fancy-subdomain">
          <input
            name="subdomain"
            type="text"
            maxlength="63"
            @input="subdomainInputHandler"
            placeholder="Subdomain"
            :disabled="!$data.subdomainCompatible"
          />
          <p>.</p>
        </div>
        <select name="domain" @change="allowsSubdomains">
          <option
            v-for="domain in $data.domains"
            :key="domain.domain"
            :name="domain.domain"
            :title="domain.domain"
            v-text="domain.domain"
          />
        </select>
      </div>
    </form>
    <Loading v-else />
  </ConfirmModal>
  <div class="input-fit-content-shim" ref="inputFitContentShim"></div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';
  import ConfirmModal from '@/components/ConfirmModal.vue';
  import Loading from '@/components/Loading.vue';
  import App from '@/App.vue';

  function setCursorPos(
    e: HTMLInputElement | HTMLTextAreaElement,
    pos: number
  ) {
    e.focus();
    e.setSelectionRange(pos, pos);
  }

  @Options({
    components: {
      ConfirmModal,
      Loading
    },
    data() {
      return {
        domains: [],
        subdomainCompatible: false,
        loaded: false
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
      loaded: boolean;
    };
    declare $props: {
      domain: string;
      subdomain: string;
    };

    declare $refs: {
      modal: ConfirmModal;
      form: HTMLFormElement;
      inputFitContentShim: HTMLDivElement;
    };

    async getDomains() {
      const domains = await (this.$store.state.client as Client).getDomains();
      this.$data.domains = domains.items;
      this.$data.loaded = true;
    }

    denyDomain() {
      this.$emit('decline');
    }

    confirmDomain() {
      this.$emit('confirm', this.selection);
    }

    subdomainInputHandler(event: Event) {
      const input = event.target as HTMLInputElement;
      this.resizeSubdomain((input.value || input.placeholder) + '_');
      this.validateSubdomain(event);
    }

    validateSubdomain(event: Event) {
      if ((event as InputEvent).data === null) return;
      const input = event.target as HTMLInputElement;
      if (input.value.length >= 63) {
        event.preventDefault();
        return;
      }
      const cursorPos = input.selectionStart as number;
      input.value = input.value.replace(/[^a-z0-9-]/gi, '-');
      setCursorPos(input, cursorPos);
    }

    getInputSize(text: string) {
      this.$refs.inputFitContentShim.innerText = text;
      return window.getComputedStyle(this.$refs.inputFitContentShim).width;
    }

    resizeSubdomain(text: string) {
      const size = this.getInputSize(text);
      document.documentElement.style.setProperty(
        '--subdomain-input-width',
        size
      );
    }

    resizeDomain(text: string) {
      const size = this.getInputSize(text);
      document.documentElement.style.setProperty('--domain-input-width', size);
    }

    resetSubdomainSize() {
      document.documentElement.style.setProperty(
        '--subdomain-input-width',
        this.getInputSize('Subdomain')
      );
    }

    resetDomainSize() {
      document.documentElement.style.setProperty(
        '--domain-input-width',
        this.getInputSize('Domain')
      );
    }

    allowsSubdomains(event: Event) {
      const select = event.target as HTMLSelectElement;
      const domain = select.value;
      this.resizeDomain(domain);
      const domainObject = this.$data.domains.find(d => d.domain === domain);
      this.$data.subdomainCompatible =
        domainObject?.allowsSubdomains as boolean;
      if (!this.$data.subdomainCompatible) {
        (this.$parent?.$parent?.$parent as App).temporaryToast(
          'This domain does not allow subdomains.',
          5000
        );
        this.resetSubdomainSize();
      }
    }

    async show() {
      this.resetDomainSize();
      this.resetSubdomainSize();
      this.$refs.modal.show();
      try {
        await (this.$parent?.$parent?.$parent as App).isLoggedIn();
        await this.getDomains();
      } catch (error) {
        this.$emit('error', error);
      }
      await this.initFormInputs();
    }

    initFormInputs(): Promise<void> {
      return new Promise((resolve, reject) => {
        // check if the domain selector is ready
        const interval = setInterval(() => {
          if (this.$refs.form) {
            const domainField = this.$refs.form.querySelector(
              'select'
            ) as HTMLSelectElement | null;
            if (domainField) {
              clearInterval(interval);
              domainField.value = this.$props.domain;
              const domainObject = this.$data.domains.find(
                d => d.domain === this.$props.domain
              );
              if (!domainObject) {
                (this.$parent?.$parent?.$parent as App).temporaryToast(
                  'Domain not found.',
                  5000
                );
                reject(new Error('Domain not found'));
                return;
              }
              this.resizeDomain(domainObject.domain);
              this.$data.subdomainCompatible =
                domainObject.allowsSubdomains as boolean;
              if (!this.$data.subdomainCompatible) {
                resolve();
              }
              const interval2 = setInterval(() => {
                if (this.$refs.form) {
                  const subdomainField = this.$refs.form.querySelector(
                    '.fancy-subdomain input'
                  ) as HTMLInputElement | null;
                  if (subdomainField) {
                    clearInterval(interval2);
                    if (this.$props.subdomain) {
                      subdomainField.value = this.$props.subdomain;
                      this.resizeSubdomain(this.$props.subdomain);
                      resolve();
                    } else {
                      resolve();
                    }
                  }
                }
              }, 100);
            }
          }
        });
      });
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
  .fancy-domain-selector-container {
    padding: 0;
    width: fit-content;
    border-radius: 10px;
    background-color: #f3f3f3;
    transition: border 0.25s, background-color 0.25s, color 0.25s;
    border: 1px solid #9a9a9a;
    outline: none;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    margin: 0 auto;
  }

  .fancy-domain-selector-container:hover,
  .fancy-domain-selector-container:focus,
  .fancy-domain-selector-container:active,
  .fancy-domain-selector-container:focus-within {
    background-color: #d6d6d6;
  }

  html.dark-theme .fancy-domain-selector-container {
    background-color: #272727;
    color: #fff;
    border: 1px solid #000000;
  }

  html.dark-theme .fancy-domain-selector-container:hover,
  html.dark-theme .fancy-domain-selector-container:focus,
  html.dark-theme .fancy-domain-selector-container:active,
  html.dark-theme .fancy-domain-selector-container:focus-within {
    background-color: #202020;
  }

  .fancy-domain-selector-container .fancy-subdomain {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-items: baseline;
  }

  .fancy-domain-selector-container .fancy-subdomain p {
    margin: 0;
    font-weight: 900;
  }

  .fancy-domain-selector-container .fancy-subdomain input {
    padding-right: 4px;
    margin: 0;
    width: var(--subdomain-input-width, 9ch);
    min-width: 10vw;
    text-align: right;
  }

  .fancy-domain-selector-container .fancy-subdomain,
  .fancy-domain-selector-container select {
    min-width: 10vw;
    margin: 0;
  }

  .fancy-domain-selector-container select {
    width: calc(var(--domain-input-width, 6ch) + 30px);
    padding-left: 0;
  }

  .fancy-domain-selector-container select:nth-child(1) {
    margin-left: 10px;
  }

  .fancy-domain-selector-container .fancy-subdomain input,
  .fancy-domain-selector-container select {
    border: none;
  }

  .fancy-domain-selector-container .fancy-subdomain input,
  .fancy-domain-selector-container .fancy-subdomain input:hover,
  .fancy-domain-selector-container .fancy-subdomain input:focus,
  html.dark-theme .fancy-domain-selector-container .fancy-subdomain input,
  html.dark-theme .fancy-domain-selector-container .fancy-subdomain input:hover,
  html.dark-theme
    .fancy-domain-selector-container
    .fancy-subdomain
    input:focus {
    background-color: inherit;
  }

  .fancy-domain-selector-container .fancy-subdomain input:hover,
  .fancy-domain-selector-container .fancy-subdomain input:focus,
  .fancy-domain-selector-container select:hover,
  .fancy-domain-selector-container select:focus {
    border: none;
  }

  .fancy-domain-selector-container:hover select,
  .fancy-domain-selector-container:focus select,
  .fancy-domain-selector-container:active select,
  .fancy-domain-selector-container:focus-within select {
    background-color: #d6d6d6;
  }

  html.dark-theme .fancy-domain-selector-container .fancy-subdomain input,
  html.dark-theme .fancy-domain-selector-container select {
    border: none;
  }

  html.dark-theme .fancy-domain-selector-container .fancy-subdomain input:hover,
  html.dark-theme .fancy-domain-selector-container .fancy-subdomain input:focus,
  html.dark-theme .fancy-domain-selector-container select:hover,
  html.dark-theme .fancy-domain-selector-container select:focus {
    border: none;
  }

  html.dark-theme .fancy-domain-selector-container:hover select,
  html.dark-theme .fancy-domain-selector-container:focus select,
  html.dark-theme .fancy-domain-selector-container:active select,
  html.dark-theme .fancy-domain-selector-container:focus-within select {
    background-color: #202020;
  }

  .input-fit-content-shim {
    position: absolute;
    top: 0;
    left: -9999px;
    overflow: hidden;
    visibility: hidden;
    white-space: nowrap;
    height: 0;
    font-family: 'Montserrat', 'Franklin Gothic Medium', 'Arial Narrow', Arial,
      sans-serif;
    font-weight: 600;
    font-size: calc(13.3px + 0.5vw);
  }
</style>
