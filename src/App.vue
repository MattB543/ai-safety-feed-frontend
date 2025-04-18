<script setup>
import { ref, onMounted, watch } from "vue";
import { useArticles } from "./composables/useArticles";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import ArticleList from "./components/ArticleList.vue";
import SearchBar from "./components/SearchBar.vue";
import SourceFilters from "./components/SourceFilters.vue";
import TagFilters from "./components/TagFilters.vue";

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

// Function to trigger search
function handleSearch() {
  queryTerm.value = searchTerm.value.trim();
  fetchArticles();
}

// Function to clear search/filters
function clearFilters() {
  searchTerm.value = "";
  handleSearch();
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
    <main class="flex-grow w-full py-8">
      <!-- Search and Filters Container -->
      <div class="max-w-[980px] mx-auto mb-6 flex items-start gap-6">
        <!-- Search Input - listen for the 'search' event -->
        <SearchBar
          v-model="searchTerm"
          @search="handleSearch"
          class="flex-grow max-w-[400px]"
        />

        <div class="flex items-center gap-2 flex-shrink-0 ml-auto">
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
