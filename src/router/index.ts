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
    path: '/dashboard/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue')
  },
  {
    path: '/dashboard/profile/sessions',
    name: 'Sessions',
    component: () => import('@/views/Sessions.vue')
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/Dashboard.vue')
  },
  {
    path: '/admin/files',
    name: 'AdminFiles',
    component: () => import('@/views/admin/Files.vue')
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/admin/Users.vue')
  },
  {
    path: '/admin/user',
    name: 'AdminUser',
    component: () => import('@/views/admin/User.vue')
  },
  {
    path: '/admin/user-sessions',
    name: 'AdminUserSessions',
    component: () => import('@/views/admin/Sessions.vue')
  },
  {
    path: '/admin/file',
    name: 'AdminFile',
    component: () => import('@/views/admin/File.vue')
  },
  {
    path: '/admin/domains',
    name: 'AdminDomains',
    component: () => import('@/views/admin/Domains.vue')
  },
  {
    path: '/admin/instructions',
    name: 'AdminInstructions',
    component: () => import('@/views/admin/Instructions.vue')
  },
  {
    path: '/admin/instruction',
    name: 'AdminInstruction',
    component: () => import('@/views/admin/Instruction.vue')
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
