import { createRouter, createWebHistory } from 'vue-router';

import Home from './views/Home.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('./views/Auth.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('./views/user-space/Dashboard.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/dashboard/files',
      name: 'user-space-files',
      component: () => import('./views/user-space/Files.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/dashboard/file',
      name: 'user-space-file',
      component: () => import('./views/user-space/File.vue'),
      meta: {
        requiresAuth: true
      }
    },
    /* {
      path: "/staff",
      name: "staff",
      component: () => import("./views/staff-space/index.vue"),
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    }, */
    {
      path: '/testing/hush/dont/touch',
      name: 'testing',
      component: () => import('./views/test/Testing.vue')
    },
    {
      path: '/testing/hush/dont/touch/sink',
      name: 'testing-link-sink',
      component: () => import('./views/test/TestingLinkSink.vue')
    },
    // soft 404
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: () => import('./views/404.vue')
    }
  ]
});
