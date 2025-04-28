import { createApp } from "vue";
import "./assets/main.css";
import App from "./App.vue";
import posthogPlugin from "./plugins/posthog";
import router from "./router";

const app = createApp(App);

app.use(posthogPlugin);
app.use(router);

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error("Vue Error:", err);
  console.error("Error occurred in component:", instance);
  console.error("Vue specific error info:", info);

  // Attempt to log article ID if available in props
  if (instance && instance.$props && instance.$props.article) {
    console.error(
      "Problematic Article ID (if applicable):",
      instance.$props.article.id
    );
    // console.error("Full Article Data:", instance.$props.article); // Uncomment to log full article data
  }
  // You could add more sophisticated logging here, e.g., sending to an error tracking service
};

app.mount("#app");
