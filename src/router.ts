import { createRouter, createWebHistory } from "vue-router";

import Home from "./views/Home.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("./views/Auth.vue"),
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("./views/Dashboard.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    /* {
      path: "/admin",
      name: "admin",
      component: () => import("./views/admin/index.vue"),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    }, */
    // soft 404
    {
      path: "/:pathMatch(.*)*",
      name: "404",
      component: () => import("./views/404.vue"),
    },
  ],
});
