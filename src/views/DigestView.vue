<template>
  <div class="max-w-[980px] mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">AI Safety Digest</h1>
    <p class="text-lg text-gray-600 mb-8">
      Subscribe to receive curated AI safety articles delivered to your inbox.
      Customize your digest below.
    </p>
    <n-message-provider>
      <EmailSubscription />
    </n-message-provider>
  </div>
</template>

<script setup>
import { NMessageProvider } from "naive-ui";
import EmailSubscription from "../components/EmailSubscription.vue";

// Add any necessary logic for the digest page itself here, if needed in the future.
</script>
