import { createStore } from 'vuex';
import { Client, Cumulonimbus } from '../../../cumulonimbus-wrapper';

const clientOptions: Cumulonimbus.ClientOptions = {
  baseURL: '/api',
  baseThumbnailURL: `${window.location.protocol}//previews.${window.location.host}`
};

export default createStore({
  state: {
    client: null,
    user: null,
    session: null,
    filePage: null,
    loadComplete: false
  },
  mutations: {
    setClient(state, client) {
      state.client = client;
      (window as any).cumClient = state.client;
    },
    setUser(state, user) {
      state.user = user;
    },
    setSession(state, session) {
      state.session = session;
    },
    setFilePage(state, page) {
      state.filePage = page;
    },
    clientLoadComplete(state) {
      state.loadComplete = true;
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
          payload.rememberMe,
          clientOptions
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
        repeatPassword: string;
        rememberMe: boolean;
      }
    ) {
      try {
        let a = await Client.createAccount(
          payload.username,
          payload.password,
          payload.repeatPassword,
          payload.email,
          payload.rememberMe,
          clientOptions
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
    },
    async restoreSession({ commit }) {
      const tokenFromStorage = localStorage.getItem('token');
      try {
        if (tokenFromStorage === null) return false;
        else {
          const client = new Client(tokenFromStorage, clientOptions),
            currentSession = await client.getSelfSessionByID(),
            currentUser = await client.getSelfUser();
          commit('setClient', client);
          commit('setSession', currentSession);
          commit('setUser', currentUser);
          commit('clientLoadComplete');
          return true;
        }
      } catch (error) {
        if (error instanceof Cumulonimbus.ResponseError) {
          commit('clientLoadComplete');
          throw error;
        } else {
          console.error(error);
          commit('clientLoadComplete');
          return false;
        }
      }
    }
  },
  modules: {}
});
