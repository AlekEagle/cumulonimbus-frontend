import { createStore } from 'vuex';
import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';

export default createStore({
  state: {
    client: null,
    user: null,
    session: null,
    filePage: null
  },
  mutations: {
    setClient(state, client) {
      state.client = client;
    },
    setUser(state, user) {
      state.user = user;
    },
    setSession(state, session) {
      state.session = session;
    },
    setFilePage(state, page) {
      state.filePage = page;
    }
  },
  actions: {
    async checkClientAuth({ commit, state }) {
      try {
        await (state.client as unknown as Client).getSelfSessionByID();
        return true;
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          if (error.code === 'INVALID_SESSION_ERROR') {
            commit('setUser', null);
            commit('setSession', null);
            commit('setClient', null);
            localStorage.removeItem('token');
            return false;
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    },
    async login(
      { commit, state },
      payload: { user: string; pass: string; rememberMe: boolean }
    ) {
      try {
        let a = await Client.login(
          payload.user,
          payload.pass,
          payload.rememberMe
        );
        commit('setClient', a);
        let u = await (state.client as unknown as Client).getSelfUser();
        commit('setUser', u);
        let s = await (state.client as unknown as Client).getSelfSessionByID();
        commit('setSession', s);
        localStorage.setItem('token', (state.client as any).token);
        return true;
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          throw error;
        } else {
          console.error(error);
          return null;
        }
      }
    },
    async createAccount(
      { commit, state },
      payload: {
        username: string;
        email: string;
        password: string;
        rememberMe: boolean;
      }
    ) {
      try {
        let a = await Client.createAccount(
          payload.username,
          payload.password,
          payload.email,
          payload.rememberMe
        );
        commit('setClient', a);
        let u = await (state.client as unknown as Client).getSelfUser();
        commit('setUser', u);
        let s = await (state.client as unknown as Client).getSelfSessionByID();
        commit('setSession', s);
        localStorage.setItem('token', (state.client as any).token);
        return true;
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          throw error;
        } else {
          console.error(error);
          return null;
        }
      }
    },
    async logout({ commit, state }) {
      try {
        await (state.client as unknown as Client).deleteSelfSessionByID(
          (state.session as unknown as Cumulonimbus.Data.Session).iat.toString()
        );
        commit('setUser', null);
        commit('setSession', null);
        commit('setClient', null);
        localStorage.removeItem('token');
        return true;
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          throw error;
        } else {
          console.error(error);
          return null;
        }
      }
    }
  },
  modules: {}
});
