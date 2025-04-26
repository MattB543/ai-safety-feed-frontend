import { createApp } from "vue";
import "./assets/main.css";
import App from "./App.vue";
import posthogPlugin from "./plugins/posthog";

const app = createApp(App);

app.use(posthogPlugin);
app.mount("#app");
