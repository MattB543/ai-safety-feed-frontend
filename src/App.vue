<script setup>
import { watch, computed } from "vue";
import { useArticles } from "./composables/useArticles";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import ArticleList from "./components/ArticleList.vue";
import SearchBar from "./components/SearchBar.vue";
import SourceFilters from "./components/SourceFilters.vue";
import TagFilters from "./components/TagFilters.vue";
import IntroCard from "./components/IntroCard.vue";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const {
  articles,
  isLoading,
  error,
  fetchArticles,
  availableSources,
  activeSources,
  sourceCounts,
  searchTerm,
  queryTerm,
  updateActiveSources,
  availableTags,
  activeTags,
  updateActiveTags,
} = useArticles();

// Computed property to check if any filter is active
const isFilterActive = computed(() => {
  return (
    searchTerm.value.trim() !== "" ||
    activeSources.value.length !== availableSources.value.length ||
    activeTags.value.length !== availableTags.value.map((t) => t.tag).length
  );
});

// Function to trigger search
function handleSearch() {
  queryTerm.value = searchTerm.value.trim();
  fetchArticles();
}

// Function to clear search/filters
function clearFilters() {
  searchTerm.value = "";
  // Reset sources to all available
  updateActiveSources(availableSources.value);
  // Reset tags to all available
  updateActiveTags(availableTags.value.map((t) => t.tag));
  // No need to call handleSearch here as updateActiveSources/Tags trigger fetchArticles
}

// Watch for changes in activeSources, activeTags, and searchTerm to refetch articles
watch([activeSources, activeTags], () => {
  // TODO: Consider adding debouncing for searchTerm
  fetchArticles();
});
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex flex-col">
    <!-- Use AppHeader component, pass API_BASE_URL -->
    <AppHeader :API_BASE_URL="API_BASE_URL" />

    <!-- Main Content -->
    <main class="flex-grow w-full py-8 px-4">
      <!-- intro card -->
      <IntroCard class="max-w-[980px] mx-auto mb-8" />

      <!-- Search and Filters Container -->
      <div
        class="max-w-[980px] mx-auto mb-6 flex flex-col md:flex-row md:items-start gap-4 md:gap-6"
      >
        <!-- Search Input - listen for the 'search' event -->
        <SearchBar
          v-model="searchTerm"
          @search="handleSearch"
          class="flex-grow max-w-[400px]"
        />

        <div class="flex items-center gap-2 md:flex-shrink-0 md:ml-auto">
          <!-- Clear Filter Button -->
          <button
            v-if="isFilterActive"
            @click="clearFilters"
            class="text-sm text-blue-600 rounded px-2 py-1 transition-colors duration-150 ease-in-out focus:outline-none hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-100 focus:text-blue-700"
            aria-label="Clear all filters"
          >
            Clear filter
          </button>

          <!-- Source Filters - updated props and event -->
          <SourceFilters
            :availableSources="availableSources"
            :activeSources="activeSources"
            :counts="sourceCounts"
            @update-sources="updateActiveSources"
          />

          <!-- Tag Filters - Added -->
          <TagFilters
            :availableTags="availableTags"
            :activeTags="activeTags"
            @update-tags="updateActiveTags"
          />
        </div>
      </div>

      <!-- Use ArticleList component, passing necessary props and listening for clear-filters -->
      <ArticleList
        :articles="articles"
        :isLoading="isLoading"
        :error="error"
        @clear-filters="clearFilters"
      />
    </main>

    <!-- Use AppFooter component -->
    <AppFooter />
  </div>
</template>
