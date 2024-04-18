import { createRouter, createWebHistory } from 'vue-router';

import Home from '@/views/Home.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Home page route
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    // Terms of Service page route
    {
      path: '/tos',
      name: 'tos',
      component: () => import('@/views/TOS.vue'),
    },
    // Privacy Policy page route
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/Privacy.vue'),
    },
    // About page route
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/About.vue'),
    },
    // Auth page route
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/Auth.vue'),
    },
    // Account Switcher page route
    {
      path: '/auth/switcher',
      name: 'account-switcher',
      component: () => import('@/views/AccountSwitcher.vue'),
    },
    // Email Verification page route
    {
      path: '/verify',
      name: 'verify',
      component: () => import('@/views/user-space/Verify.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    // User space routes
    {
      path: '/dashboard',
      name: 'user-space-dashboard',
      component: () => import('@/views/user-space/Dashboard.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/files',
      name: 'user-space-files',
      component: () => import('@/views/user-space/Files.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/file',
      name: 'user-space-file',
      component: () => import('@/views/user-space/File.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/upload',
      name: 'user-space-upload',
      component: () => import('@/views/user-space/Upload.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/account',
      name: 'user-space-account',
      component: () => import('@/views/user-space/Account.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/account/sessions',
      name: 'user-space-account-sessions',
      component: () => import('@/views/user-space/AccountSessions.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/account/second-factors',
      name: 'user-space-account-second-factors',
      component: () => import('@/views/user-space/AccountSecondFactors.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/setup-guides',
      name: 'user-space-setup-guides',
      component: () => import('@/views/user-space/SetupGuides.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/setup-guide',
      name: 'user-space-setup-guide',
      component: () => import('@/views/user-space/SetupGuide.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    // Staff space routes
    {
      path: '/staff',
      name: 'staff-space-dashboard',
      component: () => import('@/views/staff-space/Dashboard.vue'),
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/users',
      name: 'staff-space-users',
      component: () => import('@/views/staff-space/Users.vue'),
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/user',
      name: 'staff-space-user',
      component: () => import('@/views/staff-space/User.vue'),
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/user/sessions',
      name: 'staff-space-user-sessions',
      component: () => import('@/views/staff-space/UserSessions.vue'),
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/user/second-factors',
      name: 'staff-space-user-second-factors',
      component: () => import('@/views/staff-space/UserSecondFactors.vue'),
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/files',
      name: 'staff-space-files',
      component: () => import('@/views/staff-space/Files.vue'),
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/file',
      name: 'staff-space-file',
      component: () => import('@/views/staff-space/File.vue'),
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/domains',
      name: 'staff-space-domains',
      component: () => import('@/views/staff-space/Domains.vue'),
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/setup-guides',
      name: 'staff-space-setup-guides',
      component: () => import('@/views/staff-space/SetupGuides.vue'),
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/setup-guide',
      name: 'staff-space-setup-guide',
      component: () => import('@/views/staff-space/SetupGuide.vue'),
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/kill-switches',
      name: 'staff-space-kill-switches',
      component: () => import('@/views/staff-space/KillSwitches.vue'),
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    // Testing routes
    {
      path: '/testing/hush/dont/touch',
      name: 'testing',
      component: () => import('@/views/test/Testing.vue'),
    },
    {
      path: '/testing/hush/dont/touch/sink',
      name: 'testing-link-sink',
      component: () => import('@/views/test/TestingLinkSink.vue'),
    },
    // soft 404
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: () => import('@/views/404.vue'),
    },
  ],
});
