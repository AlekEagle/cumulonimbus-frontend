import { createRouter, createWebHistory } from 'vue-router';

import MarketingHero from '@/headers/Marketing.vue';
import MarketingContent from '@/views/Marketing.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Marketing page route
    {
      path: '/',
      name: 'marketing',
      components: {
        header: MarketingHero,
        default: MarketingContent,
      },
      meta: {},
    },
    // Terms of Service page route
    {
      path: '/tos',
      name: 'tos',
      components: {
        header: () => import('@/headers/Terms.vue'),
        default: () => import('@/views/TOS.vue'),
      },
      meta: {
        documentName: 'Terms of Service',
        updated: 'October 22nd, 2023',
      },
    },
    // Privacy Policy page route
    {
      path: '/privacy',
      name: 'privacy',
      components: {
        header: () => import('@/headers/Terms.vue'),
        default: () => import('@/views/Privacy.vue'),
      },
      meta: {
        documentName: 'Privacy Policy',
        updated: 'October 21st, 2023',
      },
    },
    // About page route
    {
      path: '/about',
      name: 'about',
      components: {
        header: () => import('@/headers/About.vue'),
        default: () => import('@/views/About.vue'),
      },
      meta: {},
    },
    // Auth page route
    {
      path: '/auth',
      name: 'auth',
      components: {
        header: () => import('@/views/Auth2.vue'),
      },
      meta: {
        noClouds: false,
      },
    },
    // Account Switcher page route
    {
      path: '/auth/switcher',
      name: 'account-switcher',
      components: {
        default: () => import('@/views/Demo.vue'),
        header: () => import('@/views/Demo.vue'),
      },
      meta: {},
    },
    // Email Verification page route
    {
      path: '/verify',
      name: 'verify',
      components: {
        default: () => import('@/views/user-space/Verify.vue'),
      },
      meta: {},
    },
    // User space routes
    {
      path: '/dashboard',
      name: 'user-space-dashboard',
      components: {
        default: () => import('@/views/user-space/Dashboard.vue'),
      },
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/files',
      name: 'user-space-files',
      components: {
        default: () => import('@/views/user-space/Files.vue'),
      },
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/file',
      name: 'user-space-file',
      components: {
        default: () => import('@/views/user-space/File.vue'),
      },
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/upload',
      name: 'user-space-upload',
      components: {
        default: () => import('@/views/user-space/Upload.vue'),
      },
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/account',
      name: 'user-space-account',
      components: {
        default: () => import('@/views/user-space/Account.vue'),
      },
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/account/sessions',
      name: 'user-space-account-sessions',
      components: {
        default: () => import('@/views/user-space/AccountSessions.vue'),
      },
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/account/second-factors',
      name: 'user-space-account-second-factors',
      components: {
        default: () => import('@/views/user-space/AccountSecondFactors.vue'),
      },
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/setup-guides',
      name: 'user-space-setup-guides',
      components: {
        default: () => import('@/views/user-space/SetupGuides.vue'),
      },
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/setup-guide',
      name: 'user-space-setup-guide',
      components: {
        default: () => import('@/views/user-space/SetupGuide.vue'),
      },
      meta: {
        requiresAuth: true,
      },
    },
    // Staff space routes
    {
      path: '/staff',
      name: 'staff-space-dashboard',
      components: {
        default: () => import('@/views/staff-space/Dashboard.vue'),
      },
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/users',
      name: 'staff-space-users',
      components: {
        default: () => import('@/views/staff-space/Users.vue'),
      },
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/user',
      name: 'staff-space-user',
      components: {
        default: () => import('@/views/staff-space/User.vue'),
      },
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/user/sessions',
      name: 'staff-space-user-sessions',
      components: {
        default: () => import('@/views/staff-space/UserSessions.vue'),
      },
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/user/second-factors',
      name: 'staff-space-user-second-factors',
      components: {
        default: () => import('@/views/staff-space/UserSecondFactors.vue'),
      },
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/files',
      name: 'staff-space-files',
      components: {
        default: () => import('@/views/staff-space/Files.vue'),
      },
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/file',
      name: 'staff-space-file',
      components: {
        default: () => import('@/views/staff-space/File.vue'),
      },
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/domains',
      name: 'staff-space-domains',
      components: {
        default: () => import('@/views/staff-space/Domains.vue'),
      },
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/setup-guides',
      name: 'staff-space-setup-guides',
      components: {
        default: () => import('@/views/staff-space/SetupGuides.vue'),
      },
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/setup-guide',
      name: 'staff-space-setup-guide',
      components: {
        default: () => import('@/views/staff-space/SetupGuide.vue'),
      },
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/kill-switches',
      name: 'staff-space-kill-switches',
      components: {
        default: () => import('@/views/staff-space/KillSwitches.vue'),
      },
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    {
      path: '/staff/utilities',
      name: 'staff-space-utilities',
      components: {
        default: () => import('@/views/staff-space/Utilities.vue'),
      },
      meta: {
        requiresAuth: true,
        requiresStaff: true,
      },
    },
    // Testing routes
    {
      path: '/ui-sandbox/standard',
      name: 'ui-sandbox-standard',
      components: {
        header: () => import('@/headers/Testing.vue'),
        default: () => import('@/views/test/Testing.vue'),
      },
      meta: {},
    },
    {
      path: '/ui-sandbox/header-clouds',
      name: 'ui-sandbox-header-clouds',
      components: {
        header: () => import('@/views/test/Testing.vue'),
      },
      meta: {},
    },
    {
      path: '/ui-sandbox/header-no-clouds',
      name: 'ui-sandbox-header-no-clouds',
      components: {
        header: () => import('@/views/test/Testing.vue'),
      },
      meta: {
        noClouds: true,
      },
    },
    {
      path: '/ui-sandbox/body-clouds',
      name: 'ui-sandbox-body-clouds',
      components: {
        default: () => import('@/views/test/Testing.vue'),
      },
      meta: {},
    },
    {
      path: '/ui-sandbox/body-no-clouds',
      name: 'ui-sandbox-body-no-clouds',
      components: {
        default: () => import('@/views/test/Testing.vue'),
      },
      meta: {
        noClouds: true,
      },
    },
    {
      path: '/ui-sandbox/sink',
      name: 'testing-link-sink',
      components: {
        header: () => import('@/headers/TestingLinkSink.vue'),
      },
      meta: {},
    },
    // soft 404
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      components: {
        header: () => import('@/headers/404.vue'),
        default: () => import('@/views/404.vue'),
      },
      meta: {},
    },
  ],
});

// let finishViewTransition: (() => void) | undefined;
//
// import {ref} from 'vue';
// export const visible = ref(false);
//
// router.beforeResolve((to, from) => {
//   if (!document.startViewTransition || to.fullPath === from.fullPath) return;
//
//   return new Promise<void>((resolve) => {
//     visible.value = false;
//     setTimeout(() => {
//
//     document.startViewTransition(
//       () =>
//         new Promise<void>((done) => {
//           function doThing() {
//             visible.value = true;
//             done();
//             setTimeout(() => {
//             }, 200);
//           }
//
//           finishViewTransition = doThing;
//           resolve();
//         }),
//     );
//     }, 100);
//   });
// });
//
// router.afterEach(() => {
//   const finish = finishViewTransition;
//   finishViewTransition = undefined;
//   if (finish) nextTick(finish);
// });
