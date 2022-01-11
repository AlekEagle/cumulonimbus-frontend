import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/auth',
    name: 'Auth',

    component: () => import('@/views/Auth.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/dashboard/files',
    name: 'SelfFiles',

    component: () => import('@/views/SelfFiles.vue')
  },
  {
    path: '/dashboard/file',
    name: 'SelfFile',

    component: () => import('@/views/SelfFile.vue')
  },
  {
    path: '/dashboard/set-up',
    name: 'SetUp',

    component: () => import('@/views/SetUp.vue')
  },
  {
    path: '/dashboard/set-up/service',
    name: 'SetUpService',
    component: () => import('@/views/SetUpService.vue')
  },
  {
    path: '/dashboard/upload',
    name: 'Upload',
    component: () => import('@/views/Upload.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
