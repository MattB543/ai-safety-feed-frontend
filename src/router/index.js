import { createRouter, createWebHistory } from "vue-router";
import FeedView from "../views/FeedView.vue";
// Every other page is its own chunk, loaded on first visit.

const routes = [
  {
    path: "/",
    name: "Feed",
    component: FeedView,
  },
  {
    // Pass the combined slug-id as a single parameter
    path: "/similar/:slugWithId",
    name: "Similar",
    component: () => import("../views/SimilarPage.vue"), // parses slugWithId
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/AboutView.vue"),
  },
  {
    path: "/digest", // Add the new digest route
    name: "Digest",
    component: () => import("../views/DigestView.vue"),
  },
  {
    path: "/data", // Add the new data route
    name: "Data",
    component: () => import("../views/DataView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Optional: Add scroll behavior to scroll to top on new page navigation
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.path === from.path) {
      // Feed filter changes only rewrite the query string; stay put.
      return false;
    } else {
      return { top: 0 };
    }
  },
});

export default router;
