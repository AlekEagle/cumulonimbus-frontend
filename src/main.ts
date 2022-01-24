import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import Title from './mixins/Title';
import packageJSON from '../package.json';

const app = createApp(App);

app.config.globalProperties.$appInformation = {
  version: packageJSON.version,
  dependencies: packageJSON.dependencies,
  devDependencies: packageJSON.devDependencies
};

app.use(store).use(router).mixin(Title).mount('#app');
