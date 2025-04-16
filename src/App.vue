<script setup>
import { ref, onMounted, watch } from "vue";
import { useArticles } from "./composables/useArticles";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import ArticleList from "./components/ArticleList.vue";
import SearchBar from "./components/SearchBar.vue";

const { articles, isLoading, error, fetchArticles } = useArticles();
const searchTerm = ref("");

// Function to trigger search
function handleSearch() {
  fetchArticles(searchTerm.value); // Pass the current search term
}

// Function to clear search/filters
function clearFilters() {
  searchTerm.value = "";
  handleSearch(); // Re-fetch all articles
}

// Initial fetch is handled by onMounted in useArticles
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex flex-col">
    <!-- Use AppHeader component -->
    <AppHeader />

    <!-- Main Content -->
    <main class="flex-grow w-full py-8">
      <!-- Search Input - listen for the 'search' event -->
      <SearchBar v-model="searchTerm" @search="handleSearch" />

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
