<template>
  <div class="mx-auto max-w-content pt-10 lg:pt-14">
    <h1 class="type-h1 -ml-1 text-ink">AI Safety Digest</h1>
    <p class="type-h2 mt-8 mb-10 max-w-[640px] text-ink lg:mt-10 lg:mb-14">
      Subscribe to receive
      <span class="text-accent">curated AI safety articles</span> delivered to
      your inbox. Customize your digest below.
    </p>
    <EmailSubscription />
  </div>
</template>

<script setup>
import EmailSubscription from "../components/EmailSubscription.vue";

// Add any necessary logic for the digest page itself here, if needed in the future.
</script>
