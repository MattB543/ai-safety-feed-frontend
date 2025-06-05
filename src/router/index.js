import { createRouter, createWebHistory } from "vue-router";
import FeedView from "../views/FeedView.vue"; // We'll create this next
import SimilarPage from "../views/SimilarPage.vue"; // We'll create this too
import AboutView from "../views/AboutView.vue"; // Import the new view
import DigestView from "../views/DigestView.vue"; // Import the new Digest view
import DataView from "../views/DataView.vue"; // Import the new Data view

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
    component: SimilarPage, // Will need to parse slugWithId inside this component
  },
  {
    path: "/about",
    name: "About",
    component: AboutView,
  },
  {
    path: "/digest", // Add the new digest route
    name: "Digest",
    component: DigestView,
  },
  {
    path: "/data", // Add the new data route
    name: "Data",
    component: DataView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Optional: Add scroll behavior to scroll to top on new page navigation
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

export default router;
