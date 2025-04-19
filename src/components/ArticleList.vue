<script setup>
import { defineEmits } from "vue";
import ArticleCard from "./ArticleCard.vue";

// --- Props ---
defineProps({
  articles: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
  error: {
    type: String,
    default: null,
  },
});

// --- Emits ---
const emit = defineEmits(["clear-filters"]);
</script>

<template>
  <ul
    class="bg-white max-w-[980px] mx-auto rounded-lg shadow-md pt-6 sm:p-6 divide-y divide-gray-200"
  >
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center text-gray-600 py-10">
      <p>Loading articles...</p>
      <p class="text-xs text-gray-500">
        (refresh after 1 minute, the free tier server is starting up)
      </p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <!-- No Articles/Results State -->
    <div
      v-else-if="articles.length === 0"
      class="text-center text-gray-600 py-10 space-y-4"
    >
      <p>No articles found. Try adjusting your search or check back later.</p>
      <button
        @click="emit('clear-filters')"
        class="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 py-1 px-3 rounded cursor-pointer"
      >
        Clear Filters
      </button>
    </div>

    <!-- Articles Feed: Wrapped ArticleCard in li and added padding -->
    <template v-else>
      <li
        v-for="article in articles"
        :key="article.id || article.source_url"
        class="pt-14 pb-6 first:pt-0 last:pb-0"
      >
        <!-- Removed conditional border class -->
        <ArticleCard :article="article" />
      </li>
    </template>
  </ul>
</template>
