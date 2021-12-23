import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import Title from './mixins/Title';

createApp(App).use(store).use(router).mixin(Title).mount('#app');
