import { createRouter, createWebHistory } from "vue-router";
import FeedView from "../views/FeedView.vue"; // We'll create this next
import SimilarPage from "../views/SimilarPage.vue"; // We'll create this too
import AboutView from "../views/AboutView.vue"; // Import the new view

const routes = [
  {
    path: "/",
    name: "Feed",
    component: FeedView,
  },
  {
    // Use a parameter :id to pass the original article's ID
    path: "/similar/:id",
    name: "Similar",
    component: SimilarPage,
    props: true, // Automatically pass route params as props to the component
  },
  {
    path: "/about",
    name: "About",
    component: AboutView,
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
