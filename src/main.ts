import { createApp } from 'vue';
import App from './App.vue';
import { ConnectivityCheckPlugin } from './utils/ConnectivityCheck';
import { createPinia } from 'pinia';
import { router } from './router';
import packageJson from '../package.json';

import '@/assets/fonts/fonts.css';

const app = createApp(App);

app.config.globalProperties.$version = packageJson.version;
app.config.globalProperties.$dependencies = packageJson.dependencies;
app.config.globalProperties.$devDependencies = packageJson.devDependencies;

app.use(router);
app.use(ConnectivityCheckPlugin);
app.use(createPinia());
app.mount('html body');
