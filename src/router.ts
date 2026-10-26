import { createRouter, createWebHistory } from 'vue-router';

import MarketingHero from '@/views/MarketingHero.vue';
import MarketingContent from '@/views/MarketingContent.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Home page route
    {
      path: '/',
      name: 'home',
      components: {
        header: MarketingHero,
        default: MarketingContent,
      },
    },
    // Terms of Service page route
    {
      path: '/tos',
      name: 'tos',
      components: {
        header: () => import('@/views/TermsHeader.vue'),
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
        header: () => import('@/views/TermsHeader.vue'),
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
      component: () => import('@/views/About.vue'),
    },
    // Auth page route
    {
      path: '/auth',
      name: 'auth',
      components: {
        header: () => import('@/views/Auth2.vue'),
      },
      meta: {
        noClouds: true,
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
    },
    // Email Verification page route
    {
      path: '/verify',
      name: 'verify',
      component: () => import('@/views/user-space/Verify.vue'),
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
    {
      path: '/staff/utilities',
      name: 'staff-space-utilities',
      component: () => import('@/views/staff-space/Utilities.vue'),
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
