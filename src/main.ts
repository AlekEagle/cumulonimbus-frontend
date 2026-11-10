// In-House Modules
import App from './App.vue';
import AuthStateManager from './utils/AuthStateManager.js';
import { router } from './router.js';
import packageJson from '../package.json';

// External Modules
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import '!/fonts/fonts.css';
import '!/base.css';

const app = createApp(App);

app.config.globalProperties.$version = packageJson.version;
app.config.globalProperties.$dependencies = packageJson.dependencies;
app.config.globalProperties.$devDependencies = packageJson.devDependencies;

app.use(router);
app.use(createPinia());
app.use(AuthStateManager);
app.mount('html body');
