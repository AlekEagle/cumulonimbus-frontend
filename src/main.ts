// In-House Modules
import App from './App.vue';
import { ConnectivityCheckPlugin } from './utils/ConnectivityCheck.js';
import { router } from './router.js';
import packageJson from '../package.json';

// External Modules
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import '@/assets/fonts/fonts.css';

const app = createApp(App);

app.config.globalProperties.$version = packageJson.version;
app.config.globalProperties.$dependencies = packageJson.dependencies;
app.config.globalProperties.$devDependencies = packageJson.devDependencies;

app.use(router);
app.use(ConnectivityCheckPlugin);
app.use(createPinia());
app.mount('html body');
