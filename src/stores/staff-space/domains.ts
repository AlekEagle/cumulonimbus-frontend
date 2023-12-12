// In-House Modules
import Cumulonimbus from 'cumulonimbus-wrapper';
import defaultErrorHandler from '@/utils/defaultErrorHandler';

// Other Store Modules
import { userStore } from '../user';
import { displayPrefStore } from '../displayPref';

// External Modules
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';

// Store Definition
export const domainsStore = defineStore('staff-space-domains', () => {
  const user = userStore(),
    router = useRouter(),
    displayPref = displayPrefStore(),
    data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.Domain> | null>(null),
    loading = ref(false),
    errored = ref(false),
    page = ref(0);

  async function getDomains(p: number): Promise<boolean> {
    if (user.client === null) return false;
    loading.value = true;
    errored.value = false;
    try {
      const result = await user.client.getDomains({
        limit: displayPref.itemsPerPage,
        offset: displayPref.itemsPerPage * p,
      });
      data.value = result.result;
      page.value = p;
      return true;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
        // No special cases to handle here.
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function createDomain(
    id: string,
    subdomains: boolean,
  ): Promise<boolean> {
    if (user.client === null) return false;
    loading.value = true;
    errored.value = false;
    try {
      await user.client.createDomain(id, subdomains);
      return true;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'DOMAIN_EXISTS_ERROR':
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function deleteDomain(domain: string): Promise<boolean> {
    if (user.client === null) return false;
    loading.value = true;
    errored.value = false;
    try {
      await user.client.deleteDomain(domain);
      return true;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_DOMAIN_ERROR':
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function enableSubdomains(domain: string): Promise<boolean> {
    if (user.client === null) return false;
    loading.value = true;
    errored.value = false;
    try {
      await user.client.allowSubdomains(domain);
      return true;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_DOMAIN_ERROR':
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function disableSubdomains(domain: string): Promise<boolean> {
    if (user.client === null) return false;
    loading.value = true;
    errored.value = false;
    try {
      await user.client.disallowSubdomains(domain);
      return true;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return false;
        case 'NOT_HANDLED':
          switch ((error as Cumulonimbus.ResponseError).code) {
            case 'INVALID_DOMAIN_ERROR':
              return false;
            default:
              // If it still wasn't handled, throw the error.
              throw error;
          }
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  async function deleteDomains(domains: string[]): Promise<number> {
    if (user.client === null) return -1;
    loading.value = true;
    errored.value = false;
    try {
      const result = await user.client.deleteDomains(domains);
      return result.result.count!;
    } catch (error) {
      errored.value = true;
      // Pass our error to the default error handler and check if it was handled.
      switch (await defaultErrorHandler(error, router)) {
        case 'OK':
          // If the error was handled, return true to signify success.
          return -1;
        case 'NOT_HANDLED':
        // No special cases to handle here.
        case 'NOT_RESPONSE_ERROR':
        default:
          // If the error wasn't handled, throw it.
          throw error;
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    data,
    loading,
    errored,
    page,
    getDomains,
    createDomain,
    enableSubdomains,
    disableSubdomains,
    deleteDomain,
    deleteDomains,
  };
});
