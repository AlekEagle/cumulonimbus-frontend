import { defineStore } from 'pinia';
import { userStore } from '../user';
import { ref } from 'vue';
import Cumulonimbus from 'cumulonimbus-wrapper';

export const domainsStore = defineStore('staff-space-domains', () => {
  const user = userStore(),
    data = ref<Cumulonimbus.Data.List<Cumulonimbus.Data.Domain> | null>(null),
    loading = ref(false),
    errored = ref(false),
    page = ref(0);

  async function getDomains(p: number) {
    if (user.client === null) return false;
    loading.value = true;
    errored.value = false;
    try {
      const result = await user.client.getDomains(50, 50 * p);
      data.value = result.result;
      page.value = p;
      return true;
    } catch (e) {
      errored.value = true;
      if (e instanceof Cumulonimbus.ResponseError) {
        return e;
      } else {
        throw e;
      }
    } finally {
      loading.value = false;
    }
  }

  async function createDomain(domain: string, allowsSubdomains: boolean) {
    if (user.client === null) return false;
    loading.value = true;
    errored.value = false;
    try {
      const result = await user.client.createDomain(domain, allowsSubdomains);
      return true;
    } catch (e) {
      errored.value = true;
      if (e instanceof Cumulonimbus.ResponseError) {
        return e;
      } else {
        throw e;
      }
    } finally {
      loading.value = false;
    }
  }

  async function deleteDomain(domain: string) {
    if (user.client === null) return false;
    loading.value = true;
    errored.value = false;
    try {
      const result = await user.client.deleteDomain(domain);
      return true;
    } catch (e) {
      errored.value = true;
      if (e instanceof Cumulonimbus.ResponseError) {
        return e;
      } else {
        throw e;
      }
    } finally {
      loading.value = false;
    }
  }

  async function updateDomain(domain: string, allowsSubdomains: boolean) {
    if (user.client === null) return false;
    loading.value = true;
    errored.value = false;
    try {
      const result = await user.client.editDomain(domain, allowsSubdomains);
      return true;
    } catch (e) {
      errored.value = true;
      if (e instanceof Cumulonimbus.ResponseError) {
        return e;
      } else {
        throw e;
      }
    } finally {
      loading.value = false;
    }
  }

  async function deleteDomains(domains: string[]) {
    if (user.client === null) return false;
    loading.value = true;
    errored.value = false;
    try {
      const result = await user.client.deleteDomains(domains);
      return result.result.count;
    } catch (e) {
      errored.value = true;
      if (e instanceof Cumulonimbus.ResponseError) {
        return e;
      } else {
        throw e;
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
    deleteDomain,
    updateDomain,
    deleteDomains
  };
});
