<template>
  <div class="max-w-[980px] mx-auto py-8 px-4">
    <h1 class="font-display text-2xl font-semibold text-ink mb-2">
      AI Safety Digest
    </h1>
    <p class="text-base text-ink-2 mb-8">
      Subscribe to receive curated AI safety articles delivered to your inbox.
      Customize your digest below.
    </p>
    <EmailSubscription />
  </div>
</template>

<script setup>
import EmailSubscription from "../components/EmailSubscription.vue";

// Add any necessary logic for the digest page itself here, if needed in the future.
</script>
