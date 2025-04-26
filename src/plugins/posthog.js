import posthog from "posthog-js";

export default {
  install(app) {
    if (!import.meta.env.DEV) {
      app.config.globalProperties.$posthog = posthog.init(
        "phc_weq5oFmGbTNue6SQy8RQZvoz8IEJPN5c2a7aPROPFsX",
        {
          api_host: "https://aisafetyfeed.com/ingest",
          ui_host: "https://us.posthog.com",
        }
      );
    }
  },
};
