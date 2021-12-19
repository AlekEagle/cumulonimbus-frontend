import { createStore } from 'vuex';
import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';

export default createStore({
  state: {
    client: null
  },
  mutations: {
    setClient(state, client) {
      state.client = client as any;
    }
  },
  actions: {
    async checkClientAuth({ commit, state }) {
      try {
        (state.client as unknown as Client).getSelfUser();
      } catch (error) {
        if (
          (error as Cumulonimbus.ResponseError).code === 'INVALID_SESSION_ERROR'
        )
          commit('setClient', null);
        else console.log(error);
      }
    }
  },
  modules: {}
});
