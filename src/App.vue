<script setup>
// Remove most imports, keep only header/footer
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";

// Keep API_BASE_URL if needed by header/footer
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex flex-col">
    <AppHeader :API_BASE_URL="API_BASE_URL" />

    <!-- Main Content - Replace with Router View -->
    <main class="flex-grow w-full py-8 px-4">
      <!-- Router View renders the matched component -->
      <router-view />
    </main>

    <!-- Keep AppFooter -->
    <AppFooter />
  </div>
</template>
